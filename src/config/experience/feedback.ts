import type { FeedbackConfig } from './types'

export const feedbackConfig = {
  vibrationEnabled: true,
  vibrationPatternMs: [18, 32, 38],
  audio: {
    enabled: true,
    minimumGain: 0.0001,
    masterPeakGain: 0.16,
    masterAttackDurationSeconds: 0.018,
    masterReleaseDurationSeconds: 1.2,
    treasureChime: {
      attackDurationSeconds: 0.014,
      notes: [
        {
          frequencyHz: 783.99,
          startDelaySeconds: 0,
          gainPeak: 0.48,
          releaseDurationSeconds: 0.42,
        },
        {
          frequencyHz: 1046.5,
          startDelaySeconds: 0.12,
          gainPeak: 0.58,
          releaseDurationSeconds: 0.54,
        },
        {
          frequencyHz: 1318.51,
          startDelaySeconds: 0.27,
          gainPeak: 0.72,
          releaseDurationSeconds: 0.78,
        },
        {
          frequencyHz: 2093,
          startDelaySeconds: 0.48,
          gainPeak: 0.22,
          releaseDurationSeconds: 0.56,
        },
      ],
      partials: [
        { frequencyMultiplier: 1, gainMultiplier: 1 },
        { frequencyMultiplier: 2.01, gainMultiplier: 0.22 },
        { frequencyMultiplier: 3.14, gainMultiplier: 0.08 },
        { frequencyMultiplier: 4.2, gainMultiplier: 0.03 },
      ],
    },
    contextCloseDelayMs: 1450,
  },
} as const satisfies FeedbackConfig
