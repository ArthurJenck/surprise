export type ColorValue = string | number

export type Vector3 = readonly [number, number, number]

export interface ProfessionalLink {
  label: string
  href: string
}

export interface ContentConfig {
  overlay: {
    signature: string
    availability: string
    contact: {
      label: string
      email: string
    }
    links: readonly ProfessionalLink[]
  }
  revealText: {
    lines: readonly string[]
  }
}

export interface ThemeConfig {
  cssVariables: Readonly<Record<`--${string}`, string>>
  scene: {
    hemisphereSky: ColorValue
    hemisphereGround: ColorValue
    keyLight: ColorValue
    redRimLight: ColorValue
    violetFillLight: ColorValue
    giftKraft: ColorValue
    shadowCenter: string
    shadowMiddle: string
    shadowEdge: string
    revealFront: ColorValue
    revealSide: ColorValue
    confetti: readonly ColorValue[]
  }
}

export interface SceneConfig {
  renderer: {
    toneMappingExposure: number
    clearColor: ColorValue
    clearAlpha: number
  }
  camera: {
    near: number
    far: number
    initialPosition: Vector3
    initialLookAt: Vector3
  }
  stage: {
    initialY: number
    finalY: number
  }
  gift: {
    modelUrl: string
    targetSize: number
    hitArea: {
      size: Vector3
      segments: number
      radius: number
      y: number
    }
    shadow: {
      size: readonly [number, number]
      y: number
      opacity: number
      textureSizePx: number
      innerRadiusPx: number
      outerRadiusPx: number
      middleStop: number
    }
    blueReplacement: {
      dominanceStart: number
      dominanceEnd: number
      blueStart: number
      blueEnd: number
    }
  }
  lighting: {
    hemisphereIntensity: number
    key: {
      intensity: number
      position: Vector3
    }
    redRim: {
      intensity: number
      distance: number
      decay: number
      position: Vector3
    }
    violetFill: {
      intensity: number
      distance: number
      decay: number
      position: Vector3
    }
  }
  reveal: {
    fontUrl: string
    linePositionsY: readonly number[]
    maximumWidth: number
    textDepthOffset: number
    lineHeightAdjustment: number
    minimumVisibleScale: number
    geometry: {
      depth: number
      steps: number
      curveSegments: number
      bevelEnabled: boolean
      bevelThickness: number
      bevelSize: number
      bevelSegments: number
    }
    materials: {
      frontRoughness: number
      frontMetalness: number
      frontClearcoat: number
      frontClearcoatRoughness: number
      sideRoughness: number
      sideMetalness: number
    }
  }
}

export interface MotionConfig {
  maxFrameDeltaSeconds: number
  idle: {
    shake: {
      delayRangeMs: readonly [number, number]
      pulseCountRange: readonly [number, number]
      pulseDurationRangeMs: readonly [number, number]
      pulseGapRangeMs: readonly [number, number]
      rotationXAmplitudeRangeRadians: readonly [number, number]
      rotationZAmplitudeRangeRadians: readonly [number, number]
      positionXAmplitudeRange: readonly [number, number]
      positionYAmplitudeRange: readonly [number, number]
    }
    orbit: {
      dampingBasePerSecond: number
      slerpBasePerSecond: number
    }
  }
  opening: {
    reducedMotionTimeScale: number
    recenterMinDurationMs: number
    recenterMaxDurationMs: number
    textStartBeforeClipEndMs: number
    textRevealDurationMs: number
    stageRevealDurationMs: number
    completionDelayMs: number
  }
  parallax: {
    responseBasePerSecond: number
    textStartY: number
    textFinalY: number
    textStartZ: number
    textFinalZ: number
    textStartRotationX: number
    textStartRotationY: number
  }
}

export interface InteractionConfig {
  dragThresholdPx: number
  shakeToOpen: {
    minimumAccelerationMagnitudeMetersPerSecondSquared: number
    requiredPeakCount: number
    peakWindowMs: number
    cooldownMs: number
  }
  orbit: {
    finePointerSensitivity: number
    coarsePointerSensitivity: number
    inertiaMultiplier: number
    minimumInertia: number
    minimumQuaternionDifference: number
    minimumCameraGroundClearance: number
  }
  parallax: {
    maxX: number
    maxY: number
    horizontalFactor: number
    verticalFactor: number
    minimumDifference: number
  }
}

export interface FeedbackConfig {
  vibrationEnabled: boolean
  vibrationPatternMs: readonly number[]
  audio: {
    enabled: boolean
    minimumGain: number
    masterPeakGain: number
    masterAttackDurationSeconds: number
    masterReleaseDurationSeconds: number
    treasureChime: {
      attackDurationSeconds: number
      notes: readonly {
        frequencyHz: number
        startDelaySeconds: number
        gainPeak: number
        releaseDurationSeconds: number
      }[]
      partials: readonly {
        frequencyMultiplier: number
        gainMultiplier: number
      }[]
    }
    contextCloseDelayMs: number
  }
}

export interface EffectsConfig {
  confetti: {
    finePointerCount: number
    coarsePointerCount: number
    size: readonly [number, number]
    spawn: {
      x: readonly [number, number]
      y: readonly [number, number]
      z: readonly [number, number]
    }
    horizontalSpeed: readonly [number, number]
    verticalSpeed: readonly [number, number]
    rotationSpeed: {
      x: readonly [number, number]
      y: readonly [number, number]
      z: readonly [number, number]
    }
    initialRotationRadians: readonly [number, number]
    gravityPerSecond: number
    dampingBasePerSecond: number
    fadeStartSeconds: number
    fadeDurationSeconds: number
    durationSeconds: number
    minimumScale: number
  }
  performance: {
    finePointerMaxPixelRatio: number
    coarsePointerMaxPixelRatio: number
    sampleDurationSeconds: number
    minimumFramesPerSecond: number
    pixelRatioStep: number
    minimumPixelRatio: number
  }
}

export interface ResponsiveProfile {
  cameraFov: number
  cameraY: number
  cameraZ: number
  baseGiftScale: number
  finalGiftScaleMultiplier: number
  textScale: number
}

export interface ResponsiveConfig {
  portraitMaxAspectRatio: number
  wideTextMinAspectRatio: number
  wideTextScale: number
  compactLandscape: {
    maxHeightPx: number
    minAspectRatio: number
  }
  portrait: ResponsiveProfile
  compactLandscapeProfile: ResponsiveProfile
  default: ResponsiveProfile
}

export interface ExperienceConfig {
  content: ContentConfig
  theme: ThemeConfig
  scene: SceneConfig
  motion: MotionConfig
  interaction: InteractionConfig
  feedback: FeedbackConfig
  effects: EffectsConfig
  responsive: ResponsiveConfig
}
