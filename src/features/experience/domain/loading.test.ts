import { describe, expect, it } from 'vitest'
import { resolveModelLoadPercent } from './loading'

describe('model loading progress', () => {
  it('returns a rounded percentage when the response size is known', () => {
    expect(resolveModelLoadPercent({ loaded: 384, total: 768 })).toBe(50)
    expect(resolveModelLoadPercent({ loaded: 769, total: 768 })).toBe(100)
  })

  it('keeps the indicator indeterminate when the response size is unknown', () => {
    expect(resolveModelLoadPercent({ loaded: 384, total: 0 })).toBeUndefined()
    expect(resolveModelLoadPercent(undefined)).toBeUndefined()
  })
})
