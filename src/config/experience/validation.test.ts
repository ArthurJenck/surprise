import { describe, expect, it } from 'vitest'
import { experienceConfig } from './index'
import type { ExperienceConfig } from './types'
import { assertValidExperienceConfig, ExperienceConfigError } from './validation'

describe('experience configuration validation', () => {
  it('accepts the shipped configuration', () => {
    expect(() => assertValidExperienceConfig(experienceConfig)).not.toThrow()
  })

  it('rejects an empty asset URL', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      scene: {
        ...experienceConfig.scene,
        gift: {
          ...experienceConfig.scene.gift,
          modelUrl: '',
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(ExperienceConfigError)
  })

  it('rejects an empty availability message', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      content: {
        ...experienceConfig.content,
        locales: {
          ...experienceConfig.content.locales,
          fr: {
            ...experienceConfig.content.locales.fr,
            overlay: {
              ...experienceConfig.content.locales.fr.overlay,
              availability: '',
            },
          },
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'content.locales.fr.overlay.availability must not be empty.'
    )
  })

  it('rejects an empty contact label', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      content: {
        ...experienceConfig.content,
        locales: {
          ...experienceConfig.content.locales,
          fr: {
            ...experienceConfig.content.locales.fr,
            overlay: {
              ...experienceConfig.content.locales.fr.overlay,
              contact: {
                ...experienceConfig.content.locales.fr.overlay.contact,
                label: '',
              },
            },
          },
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'content.locales.fr.overlay.contact.label must not be empty.'
    )
  })

  it('rejects an empty contact email', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      content: {
        ...experienceConfig.content,
        locales: {
          ...experienceConfig.content.locales,
          fr: {
            ...experienceConfig.content.locales.fr,
            overlay: {
              ...experienceConfig.content.locales.fr.overlay,
              contact: {
                ...experienceConfig.content.locales.fr.overlay.contact,
                email: '',
              },
            },
          },
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'content.locales.fr.overlay.contact.email must not be empty.'
    )
  })

  it('rejects mismatched reveal text positions', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      content: {
        ...experienceConfig.content,
        locales: {
          ...experienceConfig.content.locales,
          en: {
            ...experienceConfig.content.locales.en,
            revealText: {
              lines: ['One line only'],
            },
          },
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'scene.reveal.linePositionsY must match content.locales.en.revealText.lines.'
    )
  })

  it('rejects a non-positive localized reveal width', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      content: {
        ...experienceConfig.content,
        locales: {
          ...experienceConfig.content.locales,
          en: {
            ...experienceConfig.content.locales.en,
            revealText: {
              ...experienceConfig.content.locales.en.revealText,
              maximumWidth: 0,
            },
          },
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'content.locales.en.revealText.maximumWidth must be a finite positive number.'
    )
  })

  it('rejects a reversed shake delay range', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      motion: {
        ...experienceConfig.motion,
        idle: {
          ...experienceConfig.motion.idle,
          shake: {
            ...experienceConfig.motion.idle.shake,
            delayRangeMs: [4200, 1600],
          },
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'motion.idle.shake.delayRangeMs[1] must be at least motion.idle.shake.delayRangeMs[0].'
    )
  })

  it('requires two peaks to open the gift by shaking', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      interaction: {
        ...experienceConfig.interaction,
        shakeToOpen: {
          ...experienceConfig.interaction.shakeToOpen,
          requiredPeakCount: 1,
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'interaction.shakeToOpen.requiredPeakCount must be at least 2.'
    )
  })
})
