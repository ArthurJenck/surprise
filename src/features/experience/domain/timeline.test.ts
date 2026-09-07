import { describe, expect, it } from 'vitest'
import {
  clamp01,
  easeInOutCubic,
  easeOutBack,
  easeOutCubic,
  phase,
  recenterDurationForAngle,
} from './timeline'

describe('opening timeline helpers', () => {
  it('clamps values to the unit interval', () => {
    expect(clamp01(-2)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(3)).toBe(1)
  })

  it('maps a bounded phase', () => {
    expect(phase(50, 100, 200)).toBe(0)
    expect(phase(150, 100, 200)).toBe(0.5)
    expect(phase(250, 100, 200)).toBe(1)
  })

  it('adapts recentering time to the camera angle', () => {
    expect(recenterDurationForAngle(0, 80, 420)).toBe(80)
    expect(recenterDurationForAngle(Math.PI / 2, 80, 420)).toBe(250)
    expect(recenterDurationForAngle(Math.PI, 80, 420)).toBe(420)
    expect(recenterDurationForAngle(Math.PI * 2, 80, 420)).toBe(420)
  })

  it('keeps easing endpoints stable', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeOutBack(0)).toBeCloseTo(0)
    expect(easeOutBack(1)).toBe(1)
  })
})
