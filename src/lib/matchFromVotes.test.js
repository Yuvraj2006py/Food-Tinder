import { describe, expect, it } from 'vitest'
import { findMutualYesRestaurantIds } from './matchFromVotes.js'

describe('findMutualYesRestaurantIds', () => {
  it('returns empty when no mutual yes', () => {
    expect(
      findMutualYesRestaurantIds([
        { restaurant_id: 'a', user_slot: 'user1', vote: 'yes' },
        { restaurant_id: 'a', user_slot: 'user2', vote: 'no' },
      ]),
    ).toEqual([])
  })

  it('detects mutual yes', () => {
    expect(
      findMutualYesRestaurantIds([
        { restaurant_id: 'r1', user_slot: 'user1', vote: 'yes' },
        { restaurant_id: 'r1', user_slot: 'user2', vote: 'yes' },
      ]),
    ).toEqual(['r1'])
  })

  it('ignores non-yes votes', () => {
    expect(
      findMutualYesRestaurantIds([
        { restaurant_id: 'r1', user_slot: 'user1', vote: 'no' },
        { restaurant_id: 'r1', user_slot: 'user2', vote: 'yes' },
      ]),
    ).toEqual([])
  })

  it('returns multiple restaurants', () => {
    const out = findMutualYesRestaurantIds([
      { restaurant_id: 'r1', user_slot: 'user1', vote: 'yes' },
      { restaurant_id: 'r1', user_slot: 'user2', vote: 'yes' },
      { restaurant_id: 'r2', user_slot: 'user1', vote: 'yes' },
      { restaurant_id: 'r2', user_slot: 'user2', vote: 'yes' },
    ])
    expect(out).toContain('r1')
    expect(out).toContain('r2')
    expect(out).toHaveLength(2)
  })
})
