import { describe, expect, it } from 'vitest'
import { assertTransition, canTransition } from './state'

describe('experience state machine', () => {
  it('accepts the opening sequence and failure from each active state', () => {
    expect(canTransition('idle', 'recentering')).toBe(true)
    expect(canTransition('recentering', 'opening')).toBe(true)
    expect(canTransition('opening', 'revealed')).toBe(true)
    expect(canTransition('idle', 'failed')).toBe(true)
    expect(canTransition('recentering', 'failed')).toBe(true)
    expect(canTransition('opening', 'failed')).toBe(true)
    expect(canTransition('revealed', 'failed')).toBe(true)
  })

  it('rejects transitions that skip the sequence', () => {
    expect(canTransition('idle', 'revealed')).toBe(false)
    expect(() => assertTransition('opening', 'idle')).toThrow(
      'Invalid experience state transition: opening -> idle'
    )
  })
})
