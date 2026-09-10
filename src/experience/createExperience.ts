import { experienceConfig } from '../config/experience'
import type { ExperienceConfig, Locale } from '../config/experience'
import { ExperienceEngine } from '../features/experience/application/ExperienceEngine'
import type {
  ExperienceCallbacks,
  ExperienceController,
} from '../features/experience/domain/contracts'

export type { ExperienceCallbacks, ExperienceController }

export function createExperience(
  canvas: HTMLCanvasElement,
  callbacks: ExperienceCallbacks,
  config: ExperienceConfig = experienceConfig,
  locale: Locale = 'fr'
): Promise<ExperienceController> {
  return ExperienceEngine.create(canvas, config, callbacks, locale)
}
