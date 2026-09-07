import type { EffectsConfig } from './types'

export const effectsConfig = {
  confetti: {
    finePointerCount: 76,
    coarsePointerCount: 52,
    size: [0.1, 0.2],
    spawn: {
      x: [-0.3, 0.3],
      y: [0.65, 1.1],
      z: [-0.25, 0.3],
    },
    horizontalSpeed: [1.2, 3.4],
    verticalSpeed: [2.9, 5.4],
    rotationSpeed: {
      x: [-6, 6],
      y: [-8, 8],
      z: [-5, 5],
    },
    initialRotationRadians: [0, Math.PI],
    gravityPerSecond: 4.8,
    dampingBasePerSecond: 0.78,
    fadeStartSeconds: 1.7,
    fadeDurationSeconds: 0.7,
    durationSeconds: 2.4,
    minimumScale: 0.01,
  },
  performance: {
    finePointerMaxPixelRatio: 1.8,
    coarsePointerMaxPixelRatio: 1.4,
    sampleDurationSeconds: 1.05,
    minimumFramesPerSecond: 45,
    pixelRatioStep: 0.3,
    minimumPixelRatio: 1,
  },
} as const satisfies EffectsConfig
