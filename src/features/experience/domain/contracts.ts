import type { ExperienceConfig, Locale } from '../../../config/experience'

export type ExperienceState = 'idle' | 'recentering' | 'opening' | 'revealed' | 'failed'

export interface ModelLoadProgress {
  loaded: number
  total: number
}

export interface ExperienceCallbacks {
  onReady: () => void
  onLoadProgress: (progress: ModelLoadProgress) => void
  onStateChange: (state: ExperienceState) => void
  onFailure: () => void
}

export interface ExperienceController {
  destroy: () => void
  setLocale: (locale: Locale) => void
}

export interface FrameContext {
  nowMs: number
  deltaSeconds: number
  state: ExperienceState
}

export interface Viewport {
  width: number
  height: number
  aspectRatio: number
  cameraFov: number
  cameraY: number
  cameraZ: number
  baseGiftScale: number
  finalGiftScale: number
  textScale: number
}

export interface ExperienceFeature {
  dispose: () => void
}

export interface ExperienceFactory {
  create: (
    canvas: HTMLCanvasElement,
    config: ExperienceConfig,
    callbacks: ExperienceCallbacks,
    locale: Locale
  ) => Promise<ExperienceController>
}
