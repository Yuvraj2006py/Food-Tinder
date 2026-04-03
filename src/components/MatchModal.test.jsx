import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MatchModal } from './MatchModal.jsx'

describe('MatchModal', () => {
  it('renders nothing when restaurant is null', () => {
    const { container } = render(<MatchModal restaurant={null} onDismiss={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows venue details and calls onDismiss', () => {
    const onDismiss = vi.fn()
    render(
      <MatchModal
        restaurant={{
          id: 'r1',
          name: 'Test Bistro',
          address: '99 Lane',
          cuisine: 'Italian',
        }}
        onDismiss={onDismiss}
      />,
    )

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Test Bistro')).toBeTruthy()
    expect(screen.getByText('99 Lane')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /keep swiping/i }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
