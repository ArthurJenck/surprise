import { describe, expect, it } from 'vitest'
import { motionConfig } from '../../../../config/experience/motion'
import { createShakePattern, sampleShakePattern } from './shakePattern'

describe('gift shake patterns', () => {
  it('creates pulses inside the configured bounds', () => {
    const pattern = createShakePattern(motionConfig.idle.shake, () => 0.5)
    const shake = motionConfig.idle.shake

    expect(pattern.pulses).toHaveLength(3)
    expect(pattern.durationMs).toBeGreaterThan(0)

    pattern.pulses.forEach((pulse, index) => {
      expect(pulse.durationMs).toBeGreaterThanOrEqual(shake.pulseDurationRangeMs[0])
      expect(pulse.durationMs).toBeLessThanOrEqual(shake.pulseDurationRangeMs[1])
      expect(Math.abs(pulse.rotationXAmplitude)).toBeGreaterThanOrEqual(
        shake.rotationXAmplitudeRangeRadians[0]
      )
      expect(Math.abs(pulse.rotationXAmplitude)).toBeLessThanOrEqual(
        shake.rotationXAmplitudeRangeRadians[1]
      )
      expect(Math.abs(pulse.rotationZAmplitude)).toBeGreaterThanOrEqual(
        shake.rotationZAmplitudeRangeRadians[0]
      )
      expect(Math.abs(pulse.rotationZAmplitude)).toBeLessThanOrEqual(
        shake.rotationZAmplitudeRangeRadians[1]
      )
      expect(Math.abs(pulse.positionXAmplitude)).toBeGreaterThanOrEqual(
        shake.positionXAmplitudeRange[0]
      )
      expect(Math.abs(pulse.positionXAmplitude)).toBeLessThanOrEqual(
        shake.positionXAmplitudeRange[1]
      )
      expect(pulse.positionYAmplitude).toBeGreaterThanOrEqual(shake.positionYAmplitudeRange[0])
      expect(pulse.positionYAmplitude).toBeLessThanOrEqual(shake.positionYAmplitudeRange[1])

      if (index > 0) {
        const previousPulse = pattern.pulses[index - 1]
        const gapMs = pulse.startMs - (previousPulse.startMs + previousPulse.durationMs)
        expect(gapMs).toBeGreaterThanOrEqual(shake.pulseGapRangeMs[0])
        expect(gapMs).toBeLessThanOrEqual(shake.pulseGapRangeMs[1])
      }
    })
  })

  it('returns to rest outside every pulse', () => {
    const pattern = createShakePattern(motionConfig.idle.shake, () => 0.5)
    const firstPulse = pattern.pulses[0]

    expect(sampleShakePattern(pattern, 0)).toEqual({
      rotationX: 0,
      rotationZ: 0,
      positionX: 0,
      positionY: 0,
    })
    expect(sampleShakePattern(pattern, firstPulse.startMs + firstPulse.durationMs)).toEqual({
      rotationX: 0,
      rotationZ: 0,
      positionX: 0,
      positionY: 0,
    })
    expect(sampleShakePattern(pattern, pattern.durationMs)).toEqual({
      rotationX: 0,
      rotationZ: 0,
      positionX: 0,
      positionY: 0,
    })
  })
})
