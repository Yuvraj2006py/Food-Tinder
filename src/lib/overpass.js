/**
 * Geocoding (Nominatim) + restaurant POIs (Overpass).
 * Nominatim: max ~1 req/s — do not hammer from the client in production without caching.
 *
 * Overpass: the main public instance often returns 502/504 when busy. We try multiple
 * mirrors and retry transient failures.
 */

const USER_AGENT =
  'FoodTinder/1.0 (local dev; https://github.com/; contact: not-configured)'

/** Dev: Vite proxies each path to a different Overpass mirror (avoids browser CORS). */
function overpassInterpreterUrls() {
  if (import.meta.env.DEV) {
    return ['/api/overpass', '/api/overpass-kumi', '/api/overpass-fr']
  }
  return [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.fr/api/interpreter',
  ]
}

/** Nominatim: dev proxy vs prod direct. */
function nominatimBase() {
  return import.meta.env.DEV ? '/api/nominatim' : 'https://nominatim.openstreetmap.org'
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Escape a user-provided cuisine string for use inside Overpass regex quotes.
 */
function escapeOverpassRegexFragment(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/**
 * @param {string} query — city or free-text place
 * @returns {Promise<{ lat: number, lng: number, displayName: string } | null>}
 */
export async function geocodeCity(query) {
  const q = query?.trim()
  if (!q) return null

  const params = new URLSearchParams({
    q,
    format: 'json',
    limit: '1',
  })

  let res
  try {
    res = await fetch(`${nominatimBase()}/search?${params}`, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'User-Agent': USER_AGENT,
      },
    })
  } catch {
    throw new Error('Could not reach geocoding service. Check your connection and try again.')
  }

  if (!res.ok) {
    throw new Error(`Geocoding failed (${res.status}). Try again in a moment.`)
  }

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error('Geocoding returned invalid data. Try again.')
  }

  const item = Array.isArray(data) ? data[0] : null
  if (!item?.lat || !item?.lon) return null

  return {
    lat: Number.parseFloat(item.lat),
    lng: Number.parseFloat(item.lon),
    displayName: item.display_name ?? q,
  }
}

function mapOverpassElements(elements) {
  return elements
    .filter((el) => el.type === 'node' && el.tags?.name && el.lat != null && el.lon != null)
    .map((el) => ({
      osm_id: String(el.id),
      name: el.tags.name,
      cuisine: el.tags.cuisine || 'restaurant',
      address: formatAddress(el.tags),
      lat: el.lat,
      lng: el.lon,
    }))
}

function isRetryableOverpassError(err) {
  if (!err || typeof err !== 'object') return false
  if (err.name === 'AbortError') return true
  if (err instanceof TypeError && err.message === 'Failed to fetch') return true
  const s = err.overpassStatus
  return s === 429 || s === 500 || s === 502 || s === 503 || s === 504
}

/**
 * POST one Overpass query to a single interpreter URL (one attempt).
 * @param {string} interpreterUrl
 * @param {string} body
 */
async function postOverpassOnce(interpreterUrl, body) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 28000)

  try {
    const res = await fetch(interpreterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'User-Agent': USER_AGENT,
      },
      body,
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = new Error(
        `Overpass returned ${res.status}. The public server may be busy — try again.`,
      )
      err.overpassStatus = res.status
      throw err
    }

    let data
    try {
      data = await res.json()
    } catch {
      throw new Error('Overpass returned invalid data. Try again in a moment.')
    }

    const elements = Array.isArray(data.elements) ? data.elements : []
    return mapOverpassElements(elements)
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Try mirrors + short retries for transient overload (504, etc.).
 */
async function postOverpassWithFallback(body) {
  const urls = overpassInterpreterUrls()

  for (const url of urls) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await postOverpassOnce(url, body)
      } catch (err) {
        if (!isRetryableOverpassError(err)) {
          throw err
        }
        if (attempt === 0) {
          await sleep(1400)
        }
      }
    }
  }

  throw new Error(
    'Restaurant lookup could not finish — public map servers are overloaded right now. Wait a minute and try again.',
  )
}

/**
 * @param {number} lat
 * @param {number} lng
 * @param {string} [cuisine] — optional OSM cuisine tag filter (regex fragment)
 * @param {number} [radius] — meters
 * @returns {Promise<Array<{ osm_id: string, name: string, cuisine: string, address: string, lat: number, lng: number }>>}
 */
export async function fetchRestaurants(lat, lng, cuisine = '', radius = 2000) {
  const cuisineTrimmed = cuisine?.trim() ?? ''
  const cuisineFilter = cuisineTrimmed
    ? `["cuisine"~"${escapeOverpassRegexFragment(cuisineTrimmed)}",i]`
    : ''

  const query = `
    [out:json][timeout:20];
    (
      node["amenity"="restaurant"]${cuisineFilter}(around:${radius},${lat},${lng});
      node["amenity"="cafe"]${cuisineFilter}(around:${radius},${lat},${lng});
      node["amenity"="fast_food"]${cuisineFilter}(around:${radius},${lat},${lng});
    );
    out body 30;
  `

  try {
    return await postOverpassWithFallback(query.trim())
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Could not reach Overpass. Check your connection and try again.')
    }
    throw err
  }
}

function formatAddress(tags) {
  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ')
  if (street) return street
  return 'See map'
}

/**
 * Geocode + fetch + stable sort + cap + card_order for DB seeding later.
 *
 * @param {string} city
 * @param {{ cuisine?: string, radius?: number, maxResults?: number }} [options]
 */
export async function searchRestaurantsByCity(city, options = {}) {
  const { cuisine = '', radius = 2000, maxResults = 20 } = options

  const geo = await geocodeCity(city)
  if (!geo) {
    throw new Error(
      'Could not find that place. Try a larger city or include region (e.g. "Milton, ON").',
    )
  }

  const raw = await fetchRestaurants(geo.lat, geo.lng, cuisine, radius)
  const sorted = [...raw].sort((a, b) => a.osm_id.localeCompare(b.osm_id, undefined, { numeric: true }))
  const sliced = sorted.slice(0, maxResults)
  const restaurants = sliced.map((r, i) => ({ ...r, card_order: i }))

  return { restaurants, geo }
}
