import type { ResponsiveConfig } from '../../../config/experience/types'
import type { Viewport } from '../domain/contracts'

export function resolveViewport(
  width: number,
  height: number,
  responsiveConfig: ResponsiveConfig
): Viewport {
  const safeWidth = Math.max(width, 1)
  const safeHeight = Math.max(height, 1)
  const aspectRatio = safeWidth / safeHeight
  const profile = selectResponsiveProfile(aspectRatio, safeHeight, responsiveConfig)

  return {
    width: safeWidth,
    height: safeHeight,
    aspectRatio,
    cameraFov: profile.cameraFov,
    cameraY: profile.cameraY,
    cameraZ: profile.cameraZ,
    baseGiftScale: profile.baseGiftScale,
    finalGiftScale: profile.baseGiftScale * profile.finalGiftScaleMultiplier,
    textScale:
      aspectRatio >= responsiveConfig.wideTextMinAspectRatio
        ? responsiveConfig.wideTextScale
        : profile.textScale,
  }
}

function selectResponsiveProfile(
  aspectRatio: number,
  height: number,
  responsiveConfig: ResponsiveConfig
) {
  if (aspectRatio < responsiveConfig.portraitMaxAspectRatio) {
    return responsiveConfig.portrait
  }

  if (
    height < responsiveConfig.compactLandscape.maxHeightPx &&
    aspectRatio > responsiveConfig.compactLandscape.minAspectRatio
  ) {
    return responsiveConfig.compactLandscapeProfile
  }

  return responsiveConfig.default
}
