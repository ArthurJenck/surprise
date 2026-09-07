import type { MotionConfig } from '../../../../config/experience/types'

type ShakeConfig = MotionConfig['idle']['shake']

export interface ShakePulse {
  startMs: number
  durationMs: number
  rotationXAmplitude: number
  rotationZAmplitude: number
  positionXAmplitude: number
  positionYAmplitude: number
}

export interface ShakePattern {
  durationMs: number
  pulses: readonly ShakePulse[]
}

export interface ShakeTransform {
  rotationX: number
  rotationZ: number
  positionX: number
  positionY: number
}

const REST_TRANSFORM: ShakeTransform = {
  rotationX: 0,
  rotationZ: 0,
  positionX: 0,
  positionY: 0,
}

export function createShakePattern(config: ShakeConfig, random = Math.random): ShakePattern {
  const pulseCount = randomInteger(config.pulseCountRange, random)
  const pulses: ShakePulse[] = []
  let startMs = 0

  for (let index = 0; index < pulseCount; index += 1) {
    const durationMs = randomBetween(config.pulseDurationRangeMs, random)
    pulses.push({
      startMs,
      durationMs,
      rotationXAmplitude: randomSignedValue(config.rotationXAmplitudeRangeRadians, random),
      rotationZAmplitude: randomSignedValue(config.rotationZAmplitudeRangeRadians, random),
      positionXAmplitude: randomSignedValue(config.positionXAmplitudeRange, random),
      positionYAmplitude: randomBetween(config.positionYAmplitudeRange, random),
    })
    startMs += durationMs

    if (index < pulseCount - 1) {
      startMs += randomBetween(config.pulseGapRangeMs, random)
    }
  }

  return { durationMs: startMs, pulses }
}

export function sampleShakePattern(pattern: ShakePattern, elapsedMs: number): ShakeTransform {
  const pulse = pattern.pulses.find(
    ({ startMs, durationMs }) => elapsedMs >= startMs && elapsedMs < startMs + durationMs
  )

  if (!pulse) {
    return REST_TRANSFORM
  }

  const progress = (elapsedMs - pulse.startMs) / pulse.durationMs
  const strength = Math.sin(progress * Math.PI)
  const oscillation = Math.sin(progress * Math.PI * 2) * strength

  return {
    rotationX: pulse.rotationXAmplitude * oscillation,
    rotationZ: pulse.rotationZAmplitude * oscillation,
    positionX: pulse.positionXAmplitude * oscillation,
    positionY: pulse.positionYAmplitude * strength,
  }
}

function randomBetween(range: readonly [number, number], random: () => number) {
  return range[0] + (range[1] - range[0]) * random()
}

function randomInteger(range: readonly [number, number], random: () => number) {
  return Math.min(range[1], Math.floor(range[0] + random() * (range[1] - range[0] + 1)))
}

function randomSignedValue(range: readonly [number, number], random: () => number) {
  const magnitude = randomBetween(range, random)
  return (random() < 0.5 ? -1 : 1) * magnitude
}
