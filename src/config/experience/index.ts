import { contentConfig } from './content'
import { effectsConfig } from './effects'
import { feedbackConfig } from './feedback'
import { interactionConfig } from './interaction'
import { motionConfig } from './motion'
import { responsiveConfig } from './responsive'
import { sceneConfig } from './scene'
import { themeConfig } from './theme'
import type { ExperienceConfig } from './types'

export const experienceConfig = {
  content: contentConfig,
  theme: themeConfig,
  scene: sceneConfig,
  motion: motionConfig,
  interaction: interactionConfig,
  feedback: feedbackConfig,
  effects: effectsConfig,
  responsive: responsiveConfig,
} as const satisfies ExperienceConfig

export type {
  ExperienceConfig,
  ProfessionalLink,
  ResponsiveProfile,
} from './types'
