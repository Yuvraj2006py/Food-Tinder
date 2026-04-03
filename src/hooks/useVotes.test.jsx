import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { isUniqueViolation, useVotes } from './useVotes.js'

const mockFrom = vi.fn()
const mockChannel = vi.fn()
const mockRemoveChannel = vi.fn()

vi.mock('../lib/supabase.js', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
    channel: (...args) => mockChannel(...args),
    removeChannel: (...args) => mockRemoveChannel(...args),
  },
}))

describe('isUniqueViolation', () => {
  it('detects 23505 as string or number', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true)
    expect(isUniqueViolation({ code: 23505 })).toBe(true)
    expect(isUniqueViolation({ code: '42' })).toBe(false)
  })
})

describe('useVotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChannel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })
    mockFrom.mockImplementation((table) => {
      if (table === 'votes') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({
                data: [
                  {
                    id: 'vote-1',
                    session_id: 'ABC123',
                    restaurant_id: 'rest-1',
                    user_slot: 'user1',
                    vote: 'yes',
                  },
                ],
                error: null,
              }),
            ),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: {
                    id: 'vote-2',
                    session_id: 'ABC123',
                    restaurant_id: 'rest-2',
                    user_slot: 'user1',
                    vote: 'no',
                  },
                  error: null,
                }),
              ),
            })),
          })),
        }
      }
      return {}
    })
  })

  it('loads votes for sessionId and subscribes to channel', async () => {
    const { result } = renderHook(() => useVotes('ABC123', 'user1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.votes).toHaveLength(1)
    expect(result.current.votes[0].restaurant_id).toBe('rest-1')
    expect(mockChannel).toHaveBeenCalledWith('votes:ABC123')
    expect(mockChannel().on).toHaveBeenCalled()
    expect(mockChannel().subscribe).toHaveBeenCalled()
  })

  it('castVote inserts and merges returned row', async () => {
    const { result } = renderHook(() => useVotes('ABC123', 'user1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.castVote('rest-2', 'no')
    })

    expect(result.current.votes.some((v) => v.id === 'vote-2')).toBe(true)
  })

  it('castVote no-ops on unique violation', async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: null,
              error: { code: '23505', message: 'duplicate' },
            }),
          ),
        })),
      })),
    }))

    const { result } = renderHook(() => useVotes('ABC123', 'user1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.castVote('rest-2', 'yes')
    })

    expect(result.current.error).toBeNull()
  })

  it('skips fetch when sessionId is null', async () => {
    const { result } = renderHook(() => useVotes(null, 'user1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockFrom).not.toHaveBeenCalled()
    expect(result.current.votes).toEqual([])
  })
})
