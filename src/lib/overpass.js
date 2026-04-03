/**
 * Geocoding (Nominatim) + restaurant POIs (Overpass).
 * Nominatim: max ~1 req/s — do not hammer from the client in production without caching.
 */

const USER_AGENT =
  'FoodTinder/1.0 (local dev; https://github.com/; contact: not-configured)'

/** Dev uses Vite proxy to avoid CORS; prod hits APIs directly. */
function nominatimBase() {
  return import.meta.env.DEV ? '/api/nominatim' : 'https://nominatim.openstreetmap.org'
}

function overpassInterpreterUrl() {
  return import.meta.env.DEV
    ? '/api/overpass'
    : 'https://overpass-api.de/api/interpreter'
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
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"]${cuisineFilter}(around:${radius},${lat},${lng});
      node["amenity"="cafe"]${cuisineFilter}(around:${radius},${lat},${lng});
      node["amenity"="fast_food"]${cuisineFilter}(around:${radius},${lat},${lng});
    );
    out body 30;
  `

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  try {
    const res = await fetch(overpassInterpreterUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'User-Agent': USER_AGENT,
      },
      body: query.trim(),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(
        `Overpass returned ${res.status}. The public server may be busy — try again.`,
      )
    }

    let data
    try {
      data = await res.json()
    } catch {
      throw new Error('Overpass returned invalid data. Try again in a moment.')
    }

    const elements = Array.isArray(data.elements) ? data.elements : []

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
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Overpass timed out. Try a smaller city or try again later.')
    }
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error('Could not reach Overpass. Check your connection and try again.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
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
