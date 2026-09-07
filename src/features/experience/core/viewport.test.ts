import { describe, expect, it } from 'vitest'
import { responsiveConfig } from '../../../config/experience/responsive'
import { resolveViewport } from './viewport'

describe('resolveViewport', () => {
  it('uses the portrait profile on narrow screens', () => {
    const viewport = resolveViewport(360, 800, responsiveConfig)

    expect(viewport.cameraFov).toBe(responsiveConfig.portrait.cameraFov)
    expect(viewport.baseGiftScale).toBe(responsiveConfig.portrait.baseGiftScale)
    expect(viewport.textScale).toBe(responsiveConfig.portrait.textScale)
  })

  it('uses the compact landscape camera when height is constrained', () => {
    const viewport = resolveViewport(1200, 500, responsiveConfig)

    expect(viewport.cameraZ).toBe(responsiveConfig.compactLandscapeProfile.cameraZ)
    expect(viewport.baseGiftScale).toBe(responsiveConfig.compactLandscapeProfile.baseGiftScale)
  })

  it('keeps the wide text scale separate from the camera profile', () => {
    const viewport = resolveViewport(1600, 900, responsiveConfig)

    expect(viewport.baseGiftScale).toBe(responsiveConfig.default.baseGiftScale)
    expect(viewport.textScale).toBe(responsiveConfig.wideTextScale)
    expect(viewport.finalGiftScale).toBe(
      responsiveConfig.default.baseGiftScale *
        responsiveConfig.default.finalGiftScaleMultiplier
    )
  })
})
