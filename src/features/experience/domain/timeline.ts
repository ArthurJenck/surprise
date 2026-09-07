export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function phase(elapsed: number, start: number, end: number) {
  return clamp01((elapsed - start) / (end - start))
}

export function recenterDurationForAngle(
  angle: number,
  minimumDurationMs: number,
  maximumDurationMs: number
) {
  return minimumDurationMs + clamp01(angle / Math.PI) * (maximumDurationMs - minimumDurationMs)
}

export function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - clamp01(value), 3)
}

export function easeInOutCubic(value: number) {
  const progress = clamp01(value)
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2
}

export function easeOutBack(value: number) {
  const progress = clamp01(value)
  const amount = 1.70158
  return 1 + (amount + 1) * Math.pow(progress - 1, 3) + amount * Math.pow(progress - 1, 2)
}
