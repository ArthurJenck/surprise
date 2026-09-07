import type { ModelLoadProgress } from './contracts'

export function resolveModelLoadPercent(progress: ModelLoadProgress | undefined) {
  if (!progress || !Number.isFinite(progress.total) || progress.total <= 0) {
    return undefined
  }

  const ratio = progress.loaded / progress.total
  return Math.round(Math.min(Math.max(ratio, 0), 1) * 100)
}
