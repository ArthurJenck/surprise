import soraFontUrl from '@fontsource/sora/files/sora-latin-800-normal.woff?url'
import type { SceneConfig } from './types'

export const sceneConfig = {
    renderer: {
        toneMappingExposure: 1.08,
        clearColor: 0x000000,
        clearAlpha: 0,
    },
    camera: {
        near: 0.1,
        far: 50,
        initialPosition: [0, 0.35, 8.5],
        initialLookAt: [0, 0, 0],
    },
    stage: {
        initialY: -0.05,
        finalY: -1.05,
    },
    gift: {
        modelUrl: '/models/gift-loot-box-optimized.glb',
        targetSize: 3.05,
        hitArea: {
            size: [3.75, 3.7, 3.75],
            segments: 3,
            radius: 0.25,
            y: 0.08,
        },
        shadow: {
            size: [5.1, 2.6],
            y: -1.55,
            opacity: 0.5,
            textureSizePx: 128,
            innerRadiusPx: 2,
            outerRadiusPx: 62,
            middleStop: 0.45,
        },
        blueReplacement: {
            dominanceStart: 0.006,
            dominanceEnd: 0.08,
            blueStart: 0.015,
            blueEnd: 0.1,
        },
    },
    lighting: {
        hemisphereIntensity: 1.8,
        key: {
            intensity: 4.2,
            position: [-3.5, 5.5, 6],
        },
        redRim: {
            intensity: 22,
            distance: 14,
            decay: 1.7,
            position: [4, 1.6, 4],
        },
        violetFill: {
            intensity: 18,
            distance: 16,
            decay: 1.8,
            position: [-4, -1, 2],
        },
    },
    reveal: {
        fontUrl: soraFontUrl,
        linePositionsY: [1.15, 0, -1.15],
        maximumWidth: 5.4,
        textDepthOffset: -0.21,
        lineHeightAdjustment: 0.03,
        minimumVisibleScale: 0.01,
        geometry: {
            depth: 0.42,
            steps: 1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.035,
            bevelSize: 0.025,
            bevelSegments: 3,
        },
        materials: {
            frontRoughness: 0.3,
            frontMetalness: 0.02,
            frontClearcoat: 0.34,
            frontClearcoatRoughness: 0.22,
            sideRoughness: 0.44,
            sideMetalness: 0.02,
        },
    },
} as const satisfies SceneConfig
