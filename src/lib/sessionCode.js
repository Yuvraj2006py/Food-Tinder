/**
 * 6-character session codes: uppercase, no 0/O/1/I/L ambiguity.
 * Uniqueness is enforced against `public.sessions.id` via Supabase.
 */

/** Excludes ambiguous 0/O and 1/I */
export const SESSION_CODE_ALPHABET =
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

const CODE_LENGTH = 6

/**
 * @returns {string} A random candidate code (not yet checked for DB collision).
 */
export function generateSessionCandidate() {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  const n = SESSION_CODE_ALPHABET.length
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += SESSION_CODE_ALPHABET[bytes[i] % n]
  }
  return out
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {number} [maxAttempts]
 * @returns {Promise<string>} An id that does not yet exist in `sessions`.
 */
export async function reserveUniqueSessionId(client, maxAttempts = 20) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const id = generateSessionCandidate()
    const { data, error } = await client
      .from('sessions')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return id
  }

  throw new Error('Could not allocate a unique session code. Try again.')
}
