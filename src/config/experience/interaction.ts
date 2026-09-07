import type { InteractionConfig } from './types'

export const interactionConfig = {
    dragThresholdPx: 7,
    orbit: {
        finePointerSensitivity: 0.007,
        coarsePointerSensitivity: 0.009,
        inertiaMultiplier: 0.24,
        minimumInertia: 0.00008,
        minimumQuaternionDifference: 0.000001,
    },
    parallax: {
        maxX: 4,
        maxY: 4,
        horizontalFactor: 0.25,
        verticalFactor: 0.18,
        minimumDifference: 0.0001,
    },
} as const satisfies InteractionConfig
