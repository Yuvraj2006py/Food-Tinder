import { describe, expect, it } from 'vitest'
import { mergeVoteList, mergeVoteRow } from './votesMerge.js'

describe('mergeVoteRow', () => {
  it('appends new rows', () => {
    const a = { id: '1', session_id: 's', restaurant_id: 'r', user_slot: 'user1', vote: 'yes' }
    expect(mergeVoteRow([], a)).toEqual([a])
  })

  it('replaces by id', () => {
    const prev = [{ id: '1', vote: 'no' }]
    const upd = { id: '1', session_id: 's', restaurant_id: 'r', user_slot: 'user1', vote: 'yes' }
    expect(mergeVoteRow(prev, upd)).toEqual([{ id: '1', vote: 'yes', session_id: 's', restaurant_id: 'r', user_slot: 'user1' }])
  })

  it('replaces by session + restaurant + slot when id missing', () => {
    const prev = [{ session_id: 's', restaurant_id: 'r', user_slot: 'user1', vote: 'no' }]
    const upd = { session_id: 's', restaurant_id: 'r', user_slot: 'user1', vote: 'yes', id: 'new-id' }
    const out = mergeVoteRow(prev, upd)
    expect(out).toHaveLength(1)
    expect(out[0].vote).toBe('yes')
    expect(out[0].id).toBe('new-id')
  })
})

describe('mergeVoteList', () => {
  it('merges multiple rows', () => {
    const rows = [
      { id: 'a', session_id: 's', restaurant_id: 'r1', user_slot: 'user1', vote: 'yes' },
      { id: 'b', session_id: 's', restaurant_id: 'r2', user_slot: 'user1', vote: 'no' },
    ]
    expect(mergeVoteList([], rows)).toHaveLength(2)
  })
})
