import { describe, expect, it } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useMatch } from './useMatch.js'

const deck = [
  { id: 'r1', name: 'Place One', address: '1 Main St', cuisine: 'Thai' },
  { id: 'r2', name: 'Place Two', address: '2 Oak Ave', cuisine: 'Mexican' },
]

describe('useMatch', () => {
  it('sets matchedRestaurant when both users voted yes', async () => {
    const votes = [
      { restaurant_id: 'r1', user_slot: 'user1', vote: 'yes' },
      { restaurant_id: 'r1', user_slot: 'user2', vote: 'yes' },
    ]

    const { result, rerender } = renderHook(
      ({ v, sid }) => useMatch(v, deck, sid),
      { initialProps: { v: [], sid: 'S1' } },
    )

    rerender({ v: votes, sid: 'S1' })

    await waitFor(() => {
      expect(result.current.matchedRestaurant).not.toBeNull()
    })

    expect(result.current.matchedRestaurant.id).toBe('r1')
    expect(result.current.matchedRestaurant.name).toBe('Place One')
  })

  it('does not re-open the same match after votes array churn (celebrated dedupe)', async () => {
    const votes = [
      { restaurant_id: 'r1', user_slot: 'user1', vote: 'yes' },
      { restaurant_id: 'r1', user_slot: 'user2', vote: 'yes' },
    ]

    const { result, rerender } = renderHook(
      ({ v }) => useMatch(v, deck, 'S1'),
      { initialProps: { v: votes } },
    )

    await waitFor(() => {
      expect(result.current.matchedRestaurant?.id).toBe('r1')
    })

    rerender({ v: [...votes] })

    await waitFor(() => {
      expect(result.current.matchedRestaurant?.id).toBe('r1')
    })
  })

  it('clears modal on dismiss and can show the next mutual match', async () => {
    const votes = [
      { restaurant_id: 'r1', user_slot: 'user1', vote: 'yes' },
      { restaurant_id: 'r1', user_slot: 'user2', vote: 'yes' },
      { restaurant_id: 'r2', user_slot: 'user1', vote: 'yes' },
      { restaurant_id: 'r2', user_slot: 'user2', vote: 'yes' },
    ]

    const { result } = renderHook(() => useMatch(votes, deck, 'S1'))

    await waitFor(() => {
      expect(result.current.matchedRestaurant?.id).toBe('r1')
    })

    await act(async () => {
      result.current.dismissMatch()
    })

    await waitFor(() => {
      expect(result.current.matchedRestaurant?.id).toBe('r2')
    })

    await act(async () => {
      result.current.dismissMatch()
    })

    expect(result.current.matchedRestaurant).toBeNull()
  })

  it('resets when sessionId changes', async () => {
    const votes = [
      { restaurant_id: 'r1', user_slot: 'user1', vote: 'yes' },
      { restaurant_id: 'r1', user_slot: 'user2', vote: 'yes' },
    ]

    const { result, rerender } = renderHook(
      ({ sid, v }) => useMatch(v, deck, sid),
      { initialProps: { sid: 'S1', v: votes } },
    )

    await waitFor(() => {
      expect(result.current.matchedRestaurant).not.toBeNull()
    })

    rerender({ sid: 'S2', v: [] })

    await waitFor(() => {
      expect(result.current.matchedRestaurant).toBeNull()
    })
  })
})
