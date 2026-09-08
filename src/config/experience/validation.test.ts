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
        overlay: {
          ...experienceConfig.content.overlay,
          availability: '',
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'content.overlay.availability must not be empty.'
    )
  })

  it('rejects an empty contact label', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      content: {
        ...experienceConfig.content,
        overlay: {
          ...experienceConfig.content.overlay,
          contact: {
            ...experienceConfig.content.overlay.contact,
            label: '',
          },
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'content.overlay.contact.label must not be empty.'
    )
  })

  it('rejects an empty contact email', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      content: {
        ...experienceConfig.content,
        overlay: {
          ...experienceConfig.content.overlay,
          contact: {
            ...experienceConfig.content.overlay.contact,
            email: '',
          },
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'content.overlay.contact.email must not be empty.'
    )
  })

  it('rejects mismatched reveal text positions', () => {
    const invalidConfig: ExperienceConfig = {
      ...experienceConfig,
      content: {
        ...experienceConfig.content,
        revealText: {
          lines: ['Une seule ligne'],
        },
      },
    }

    expect(() => assertValidExperienceConfig(invalidConfig)).toThrow(
      'scene.reveal.linePositionsY must match content.revealText.lines.'
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
})
