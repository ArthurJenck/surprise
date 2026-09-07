import type { ExperienceConfig } from '../../../config/experience'

export type ExperienceState = 'idle' | 'recentering' | 'opening' | 'revealed' | 'fallback'

export interface ExperienceCallbacks {
  onReady: () => void
  onStateChange: (state: ExperienceState) => void
  onFallback: () => void
}

export interface ExperienceController {
  destroy: () => void
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
    callbacks: ExperienceCallbacks
  ) => Promise<ExperienceController>
}
