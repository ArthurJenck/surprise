import { describe, expect, it } from 'vitest'
import { effectsConfig } from '../../../../config/experience/effects'
import { calculateConfettiScale } from './ConfettiFeature'

describe('calculateConfettiScale', () => {
  it('keeps particles full size before fading', () => {
    expect(calculateConfettiScale(1, effectsConfig.confetti)).toBe(1)
  })

  it('fades particles and applies the configured minimum scale', () => {
    expect(calculateConfettiScale(2.05, effectsConfig.confetti)).toBeCloseTo(0.5)
    expect(calculateConfettiScale(4, effectsConfig.confetti)).toBe(
      effectsConfig.confetti.minimumScale
    )
  })
})
