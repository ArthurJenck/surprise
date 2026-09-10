import { LOCALES, type ExperienceConfig } from './types'

export class ExperienceConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExperienceConfigError'
  }
}

export function assertValidExperienceConfig(config: ExperienceConfig) {
  assertNonEmpty(config.scene.gift.modelUrl, 'scene.gift.modelUrl')
  assertNonEmpty(config.scene.reveal.fontUrl, 'scene.reveal.fontUrl')
  assertLocalizedContent(config)

  if (config.theme.scene.confetti.length === 0) {
    throw new ExperienceConfigError('theme.scene.confetti must not be empty.')
  }

  assertPositive(config.scene.camera.near, 'scene.camera.near')
  assertPositive(config.scene.camera.far, 'scene.camera.far')
  if (config.scene.camera.far <= config.scene.camera.near) {
    throw new ExperienceConfigError('scene.camera.far must be greater than scene.camera.near.')
  }

  assertPositive(config.scene.renderer.toneMappingExposure, 'scene.renderer.toneMappingExposure')
  assertRange(config.scene.renderer.clearAlpha, 0, 1, 'scene.renderer.clearAlpha')
  assertPositive(config.scene.gift.targetSize, 'scene.gift.targetSize')
  assertPositiveInteger(config.scene.gift.hitArea.segments, 'scene.gift.hitArea.segments')
  assertPositive(config.scene.gift.hitArea.radius, 'scene.gift.hitArea.radius')
  config.scene.gift.hitArea.size.forEach((value, index) =>
    assertPositive(value, `scene.gift.hitArea.size[${index}]`)
  )
  config.scene.gift.shadow.size.forEach((value, index) =>
    assertPositive(value, `scene.gift.shadow.size[${index}]`)
  )
  assertPositiveInteger(config.scene.gift.shadow.textureSizePx, 'scene.gift.shadow.textureSizePx')
  assertRange(config.scene.gift.shadow.middleStop, 0, 1, 'scene.gift.shadow.middleStop')
  assertPositive(config.scene.reveal.maximumWidth, 'scene.reveal.maximumWidth')
  assertPositive(config.scene.reveal.minimumVisibleScale, 'scene.reveal.minimumVisibleScale')
  assertPositive(config.scene.reveal.geometry.depth, 'scene.reveal.geometry.depth')
  assertPositiveInteger(config.scene.reveal.geometry.steps, 'scene.reveal.geometry.steps')
  assertPositiveInteger(config.scene.reveal.geometry.curveSegments, 'scene.reveal.geometry.curveSegments')
  assertPositiveInteger(config.scene.reveal.geometry.bevelSegments, 'scene.reveal.geometry.bevelSegments')

  assertPositive(config.motion.maxFrameDeltaSeconds, 'motion.maxFrameDeltaSeconds')
  const shake = config.motion.idle.shake
  assertPositiveRange(shake.delayRangeMs, 'motion.idle.shake.delayRangeMs')
  assertPositiveIntegerRange(shake.pulseCountRange, 'motion.idle.shake.pulseCountRange')
  assertPositiveRange(shake.pulseDurationRangeMs, 'motion.idle.shake.pulseDurationRangeMs')
  assertPositiveRange(shake.pulseGapRangeMs, 'motion.idle.shake.pulseGapRangeMs')
  assertPositiveRange(
    shake.rotationXAmplitudeRangeRadians,
    'motion.idle.shake.rotationXAmplitudeRangeRadians'
  )
  assertPositiveRange(
    shake.rotationZAmplitudeRangeRadians,
    'motion.idle.shake.rotationZAmplitudeRangeRadians'
  )
  assertPositiveRange(shake.positionXAmplitudeRange, 'motion.idle.shake.positionXAmplitudeRange')
  assertPositiveRange(shake.positionYAmplitudeRange, 'motion.idle.shake.positionYAmplitudeRange')
  assertPositive(config.motion.opening.reducedMotionTimeScale, 'motion.opening.reducedMotionTimeScale')
  assertPositive(config.motion.opening.recenterMinDurationMs, 'motion.opening.recenterMinDurationMs')
  assertPositive(config.motion.opening.recenterMaxDurationMs, 'motion.opening.recenterMaxDurationMs')
  if (config.motion.opening.recenterMaxDurationMs < config.motion.opening.recenterMinDurationMs) {
    throw new ExperienceConfigError('motion.opening.recenterMaxDurationMs must be at least the minimum duration.')
  }
  assertPositive(config.motion.opening.stageRevealDurationMs, 'motion.opening.stageRevealDurationMs')
  assertPositive(config.motion.opening.completionDelayMs, 'motion.opening.completionDelayMs')
  assertPositive(config.interaction.dragThresholdPx, 'interaction.dragThresholdPx')
  const shakeToOpen = config.interaction.shakeToOpen
  assertPositive(
    shakeToOpen.minimumAccelerationMagnitudeMetersPerSecondSquared,
    'interaction.shakeToOpen.minimumAccelerationMagnitudeMetersPerSecondSquared'
  )
  assertPositiveInteger(shakeToOpen.requiredPeakCount, 'interaction.shakeToOpen.requiredPeakCount')
  if (shakeToOpen.requiredPeakCount < 2) {
    throw new ExperienceConfigError('interaction.shakeToOpen.requiredPeakCount must be at least 2.')
  }
  assertPositive(shakeToOpen.peakWindowMs, 'interaction.shakeToOpen.peakWindowMs')
  assertPositive(shakeToOpen.cooldownMs, 'interaction.shakeToOpen.cooldownMs')
  assertNonNegative(
    config.interaction.orbit.minimumCameraGroundClearance,
    'interaction.orbit.minimumCameraGroundClearance'
  )
  assertPositive(config.interaction.parallax.maxX, 'interaction.parallax.maxX')
  assertPositive(config.interaction.parallax.maxY, 'interaction.parallax.maxY')
  const audio = config.feedback.audio
  assertPositive(audio.minimumGain, 'feedback.audio.minimumGain')
  assertPositive(audio.masterPeakGain, 'feedback.audio.masterPeakGain')
  assertPositive(audio.masterAttackDurationSeconds, 'feedback.audio.masterAttackDurationSeconds')
  assertPositive(audio.masterReleaseDurationSeconds, 'feedback.audio.masterReleaseDurationSeconds')
  assertPositive(
    audio.treasureChime.attackDurationSeconds,
    'feedback.audio.treasureChime.attackDurationSeconds'
  )
  if (audio.treasureChime.notes.length === 0) {
    throw new ExperienceConfigError('feedback.audio.treasureChime.notes must not be empty.')
  }
  if (audio.treasureChime.partials.length === 0) {
    throw new ExperienceConfigError('feedback.audio.treasureChime.partials must not be empty.')
  }
  audio.treasureChime.notes.forEach((note, index) => {
    assertPositive(note.frequencyHz, `feedback.audio.treasureChime.notes[${index}].frequencyHz`)
    assertNonNegative(
      note.startDelaySeconds,
      `feedback.audio.treasureChime.notes[${index}].startDelaySeconds`
    )
    assertPositive(note.gainPeak, `feedback.audio.treasureChime.notes[${index}].gainPeak`)
    assertPositive(
      note.releaseDurationSeconds,
      `feedback.audio.treasureChime.notes[${index}].releaseDurationSeconds`
    )
  })
  audio.treasureChime.partials.forEach((partial, index) => {
    assertPositive(
      partial.frequencyMultiplier,
      `feedback.audio.treasureChime.partials[${index}].frequencyMultiplier`
    )
    assertPositive(
      partial.gainMultiplier,
      `feedback.audio.treasureChime.partials[${index}].gainMultiplier`
    )
  })
  assertPositiveInteger(config.effects.confetti.finePointerCount, 'effects.confetti.finePointerCount')
  assertPositiveInteger(config.effects.confetti.coarsePointerCount, 'effects.confetti.coarsePointerCount')
  assertPositive(config.effects.confetti.durationSeconds, 'effects.confetti.durationSeconds')
  assertPositive(config.effects.confetti.fadeDurationSeconds, 'effects.confetti.fadeDurationSeconds')
  if (config.effects.confetti.fadeStartSeconds > config.effects.confetti.durationSeconds) {
    throw new ExperienceConfigError('effects.confetti.fadeStartSeconds must not exceed the duration.')
  }
  assertPositive(config.effects.performance.minimumPixelRatio, 'effects.performance.minimumPixelRatio')
  assertPositive(config.effects.performance.finePointerMaxPixelRatio, 'effects.performance.finePointerMaxPixelRatio')
  assertPositive(config.effects.performance.coarsePointerMaxPixelRatio, 'effects.performance.coarsePointerMaxPixelRatio')
  if (
    config.effects.performance.finePointerMaxPixelRatio < config.effects.performance.minimumPixelRatio ||
    config.effects.performance.coarsePointerMaxPixelRatio < config.effects.performance.minimumPixelRatio
  ) {
    throw new ExperienceConfigError('effects.performance maximum pixel ratios must not be below the minimum.')
  }
  assertPositive(config.responsive.portraitMaxAspectRatio, 'responsive.portraitMaxAspectRatio')
  assertPositive(config.responsive.wideTextMinAspectRatio, 'responsive.wideTextMinAspectRatio')
  assertPositive(config.responsive.wideTextScale, 'responsive.wideTextScale')
  assertPositive(config.responsive.compactLandscape.maxHeightPx, 'responsive.compactLandscape.maxHeightPx')
  assertPositive(config.responsive.compactLandscape.minAspectRatio, 'responsive.compactLandscape.minAspectRatio')
  if (config.responsive.wideTextMinAspectRatio <= config.responsive.portraitMaxAspectRatio) {
    throw new ExperienceConfigError('responsive.wideTextMinAspectRatio must exceed portraitMaxAspectRatio.')
  }

  for (const [name, profile] of Object.entries({
    portrait: config.responsive.portrait,
    compactLandscape: config.responsive.compactLandscapeProfile,
    default: config.responsive.default,
  })) {
    assertPositive(profile.cameraFov, `responsive.${name}.cameraFov`)
    assertPositive(profile.cameraZ, `responsive.${name}.cameraZ`)
    assertPositive(profile.baseGiftScale, `responsive.${name}.baseGiftScale`)
    assertPositive(profile.finalGiftScaleMultiplier, `responsive.${name}.finalGiftScaleMultiplier`)
    assertPositive(profile.textScale, `responsive.${name}.textScale`)
  }
}

function assertLocalizedContent(config: ExperienceConfig) {
  assertNonEmpty(config.content.languageSelection.ariaLabel, 'content.languageSelection.ariaLabel')

  const configuredLocales = new Set(
    config.content.languageSelection.options.map((option) => option.locale)
  )

  if (
    configuredLocales.size !== LOCALES.length ||
    LOCALES.some((locale) => !configuredLocales.has(locale))
  ) {
    throw new ExperienceConfigError(
      'content.languageSelection.options must contain each supported locale exactly once.'
    )
  }

  config.content.languageSelection.options.forEach((option, index) => {
    assertNonEmpty(option.label, `content.languageSelection.options[${index}].label`)
    assertNonEmpty(option.compactLabel, `content.languageSelection.options[${index}].compactLabel`)
  })

  LOCALES.forEach((locale) => {
    const content = config.content.locales[locale]
    const path = `content.locales.${locale}`
    assertNonEmpty(content.overlay.signature, `${path}.overlay.signature`)
    assertNonEmpty(content.overlay.availability, `${path}.overlay.availability`)
    assertNonEmpty(content.overlay.contact.label, `${path}.overlay.contact.label`)
    assertNonEmpty(content.overlay.contact.email, `${path}.overlay.contact.email`)
    assertNonEmpty(content.overlay.professionalLinksLabel, `${path}.overlay.professionalLinksLabel`)
    content.overlay.links.forEach((link, index) => {
      assertNonEmpty(link.label, `${path}.overlay.links[${index}].label`)
      assertNonEmpty(link.href, `${path}.overlay.links[${index}].href`)
    })

    if (content.revealText.lines.length === 0) {
      throw new ExperienceConfigError(`${path}.revealText.lines must not be empty.`)
    }

    if (config.scene.reveal.linePositionsY.length !== content.revealText.lines.length) {
      throw new ExperienceConfigError(
        `scene.reveal.linePositionsY must match ${path}.revealText.lines.`
      )
    }

    if (content.revealText.maximumWidth !== undefined) {
      assertPositive(content.revealText.maximumWidth, `${path}.revealText.maximumWidth`)
    }

    assertNonEmpty(content.loading.message, `${path}.loading.message`)
    assertNonEmpty(content.loading.failureMessage, `${path}.loading.failureMessage`)
    assertNonEmpty(content.loading.failureDetail, `${path}.loading.failureDetail`)
    assertNonEmpty(content.loading.retryLabel, `${path}.loading.retryLabel`)
    assertNonEmpty(content.loading.reloadLabel, `${path}.loading.reloadLabel`)
    assertNonEmpty(content.accessibility.closedCanvasLabel, `${path}.accessibility.closedCanvasLabel`)
    assertNonEmpty(content.accessibility.openedCanvasLabel, `${path}.accessibility.openedCanvasLabel`)
    assertNonEmpty(
      content.accessibility.languageSwitcherLabel,
      `${path}.accessibility.languageSwitcherLabel`
    )
    assertNonEmpty(content.document.title, `${path}.document.title`)
    assertNonEmpty(content.document.description, `${path}.document.description`)
  })
}

function assertNonEmpty(value: string, path: string) {
  if (value.trim().length === 0) {
    throw new ExperienceConfigError(`${path} must not be empty.`)
  }
}

function assertPositive(value: number, path: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ExperienceConfigError(`${path} must be a finite positive number.`)
  }
}

function assertPositiveInteger(value: number, path: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ExperienceConfigError(`${path} must be a positive integer.`)
  }
}

function assertPositiveRange(value: readonly [number, number], path: string) {
  assertPositive(value[0], `${path}[0]`)
  assertPositive(value[1], `${path}[1]`)
  if (value[1] < value[0]) {
    throw new ExperienceConfigError(`${path}[1] must be at least ${path}[0].`)
  }
}

function assertPositiveIntegerRange(value: readonly [number, number], path: string) {
  assertPositiveInteger(value[0], `${path}[0]`)
  assertPositiveInteger(value[1], `${path}[1]`)
  if (value[1] < value[0]) {
    throw new ExperienceConfigError(`${path}[1] must be at least ${path}[0].`)
  }
}

function assertNonNegative(value: number, path: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new ExperienceConfigError(`${path} must be a finite non-negative number.`)
  }
}

function assertRange(value: number, minimum: number, maximum: number, path: string) {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new ExperienceConfigError(`${path} must be between ${minimum} and ${maximum}.`)
  }
}
