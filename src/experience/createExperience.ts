import { experienceConfig } from '../config/experience'
import type { ExperienceConfig } from '../config/experience'
import { ExperienceEngine } from '../features/experience/application/ExperienceEngine'
import type {
  ExperienceCallbacks,
  ExperienceController,
} from '../features/experience/domain/contracts'

export type { ExperienceCallbacks, ExperienceController }

export function createExperience(
  canvas: HTMLCanvasElement,
  callbacks: ExperienceCallbacks,
  config: ExperienceConfig = experienceConfig
): Promise<ExperienceController> {
  return ExperienceEngine.create(canvas, config, callbacks)
}
