import type { ResponsiveConfig } from './types'

export const responsiveConfig = {
  portraitMaxAspectRatio: 0.72,
  wideTextMinAspectRatio: 1.15,
  wideTextScale: 0.8,
  compactLandscape: {
    maxHeightPx: 560,
    minAspectRatio: 1.2,
  },
  portrait: {
    cameraFov: 40,
    cameraY: 0.3,
    cameraZ: 11.8,
    baseGiftScale: 0.62,
    finalGiftScaleMultiplier: 0.74,
    textScale: 0.56,
  },
  compactLandscapeProfile: {
    cameraFov: 34,
    cameraY: 0.2,
    cameraZ: 9.8,
    baseGiftScale: 0.64,
    finalGiftScaleMultiplier: 0.58,
    textScale: 0.8,
  },
  default: {
    cameraFov: 34,
    cameraY: 0.2,
    cameraZ: 8.8,
    baseGiftScale: 0.74,
    finalGiftScaleMultiplier: 0.58,
    textScale: 0.72,
  },
} as const satisfies ResponsiveConfig
