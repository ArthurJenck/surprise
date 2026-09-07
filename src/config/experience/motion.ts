import type { MotionConfig } from './types'

export const motionConfig = {
    maxFrameDeltaSeconds: 0.05,
    idle: {
        shake: {
            delayRangeMs: [600, 1800],
            pulseCountRange: [2, 4],
            pulseDurationRangeMs: [105, 165],
            pulseGapRangeMs: [35, 95],
            rotationXAmplitudeRangeRadians: [0.01, 0.026],
            rotationZAmplitudeRangeRadians: [0.032, 0.068],
            positionXAmplitudeRange: [0.018, 0.044],
            positionYAmplitudeRange: [0.006, 0.017],
        },
        orbit: {
            dampingBasePerSecond: 0.045,
            slerpBasePerSecond: 0.0008,
        },
    },
    opening: {
        reducedMotionTimeScale: 0.22,
        recenterMinDurationMs: 80,
        recenterMaxDurationMs: 420,
        textStartBeforeClipEndMs: 400,
        textRevealDurationMs: 400,
        stageRevealDurationMs: 820,
        completionDelayMs: 1000,
    },
    parallax: {
        responseBasePerSecond: 0.0015,
        textStartY: 0.06,
        textFinalY: 0.08,
        textStartZ: 0.24,
        textFinalZ: 1.15,
        textStartRotationX: -1.15,
        textStartRotationY: 0.22,
    },
} as const satisfies MotionConfig
