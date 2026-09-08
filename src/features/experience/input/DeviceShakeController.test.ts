import { describe, expect, it, vi } from 'vitest'
import { interactionConfig } from '../../../config/experience/interaction'
import type { ExperienceState } from '../domain/contracts'
import {
  DeviceShakeController,
  type DeviceMotionEnvironment,
  ShakeDetector,
} from './DeviceShakeController'

const shakeConfig = interactionConfig.shakeToOpen

describe('ShakeDetector', () => {
  it('opens after two distinct strong peaks inside the configured window', () => {
    const detector = new ShakeDetector(shakeConfig)

    expect(detector.consume(createMotionEvent(14), 0)).toBe(false)
    expect(detector.consume(createMotionEvent(0), 30)).toBe(false)
    expect(detector.consume(createMotionEvent(15), 400)).toBe(true)
  })

  it('ignores a single peak and restarts detection after the window expires', () => {
    const detector = new ShakeDetector(shakeConfig)

    expect(detector.consume(createMotionEvent(16), 0)).toBe(false)
    expect(detector.consume(createMotionEvent(0), 30)).toBe(false)
    expect(detector.consume(createMotionEvent(16), 700)).toBe(false)
  })

  it('does not trigger again until its cooldown has expired', () => {
    const detector = new ShakeDetector(shakeConfig)

    detector.consume(createMotionEvent(16), 0)
    detector.consume(createMotionEvent(0), 30)
    expect(detector.consume(createMotionEvent(16), 100)).toBe(true)

    detector.consume(createMotionEvent(0), 140)
    expect(detector.consume(createMotionEvent(16), 500)).toBe(false)
    detector.consume(createMotionEvent(0), 540)
    expect(detector.consume(createMotionEvent(16), 1_200)).toBe(false)
    detector.consume(createMotionEvent(0), 1_240)
    expect(detector.consume(createMotionEvent(16), 1_400)).toBe(true)
  })

  it('ignores incomplete data and falls back to acceleration including gravity', () => {
    const detector = new ShakeDetector(shakeConfig)

    expect(detector.consume(createMotionEvent(null, null), 0)).toBe(false)
    expect(detector.consume(createMotionEvent(null, 15), 20)).toBe(false)
    expect(detector.consume(createMotionEvent(null, 0), 40)).toBe(false)
    expect(detector.consume(createMotionEvent(null, 16), 200)).toBe(true)
  })
})

describe('DeviceShakeController', () => {
  it('waits for an explicit permission grant before listening', async () => {
    let resolvePermission: (permission: 'granted' | 'denied') => void
    const requestPermission = vi.fn(
      () =>
        new Promise<'granted' | 'denied'>((resolve) => {
          resolvePermission = resolve
        })
    )
    const fakeEnvironment = createEnvironment({ requestPermission })
    const onShake = vi.fn()
    const controller = createController(fakeEnvironment.environment, onShake)

    controller.arm()

    expect(requestPermission).toHaveBeenCalledOnce()
    expect(fakeEnvironment.listenerCount()).toBe(0)

    resolvePermission!('granted')
    await Promise.resolve()

    expect(fakeEnvironment.listenerCount()).toBe(1)
    fakeEnvironment.dispatch(createMotionEvent(16))
    fakeEnvironment.dispatch(createMotionEvent(0))
    fakeEnvironment.dispatch(createMotionEvent(16))
    expect(onShake).toHaveBeenCalledOnce()
    expect(fakeEnvironment.listenerCount()).toBe(0)
  })

  it('does not listen when permission is refused', async () => {
    const requestPermission = vi.fn(async () => 'denied' as const)
    const fakeEnvironment = createEnvironment({ requestPermission })
    const controller = createController(fakeEnvironment.environment, vi.fn())

    controller.arm()
    await Promise.resolve()

    expect(requestPermission).toHaveBeenCalledOnce()
    expect(fakeEnvironment.listenerCount()).toBe(0)
  })

  it('listens immediately when permission is not required', () => {
    const fakeEnvironment = createEnvironment()
    const controller = createController(fakeEnvironment.environment, vi.fn())

    controller.arm()

    expect(fakeEnvironment.listenerCount()).toBe(1)
  })

  it('does not listen without a secure context or motion support', () => {
    const insecureEnvironment = createEnvironment({ isSecureContext: false })
    const unsupportedEnvironment = createEnvironment({ motionEvent: undefined })

    createController(insecureEnvironment.environment, vi.fn()).arm()
    createController(unsupportedEnvironment.environment, vi.fn()).arm()

    expect(insecureEnvironment.listenerCount()).toBe(0)
    expect(unsupportedEnvironment.listenerCount()).toBe(0)
  })
})

function createController(environment: DeviceMotionEnvironment, onShake: () => void) {
  let state: ExperienceState = 'idle'
  let nowMs = 0

  return new DeviceShakeController({
    config: shakeConfig,
    enabled: true,
    getState: () => state,
    onShake: () => {
      state = 'recentering'
      onShake()
    },
    environment,
    now: () => nowMs++,
  })
}

function createEnvironment(options: {
  isSecureContext?: boolean
  motionEvent?: DeviceMotionEnvironment['motionEvent']
  requestPermission?: () => Promise<'granted' | 'denied'>
} = {}) {
  const isSecureContext = options.isSecureContext ?? true
  const motionEvent = 'motionEvent' in options ? options.motionEvent : {}
  const listeners = new Set<(event: DeviceMotionEvent) => void>()
  const environment: DeviceMotionEnvironment = {
    isSecureContext,
    motionEvent: options.requestPermission
      ? { requestPermission: options.requestPermission }
      : motionEvent,
    addMotionListener: (listener) => listeners.add(listener),
    removeMotionListener: (listener) => listeners.delete(listener),
  }

  return {
    environment,
    dispatch: (event: DeviceMotionEvent) => listeners.forEach((listener) => listener(event)),
    listenerCount: () => listeners.size,
  }
}

function createMotionEvent(
  accelerationMagnitude: number | null,
  gravityAccelerationMagnitude: number | null = null
) {
  return {
    acceleration: createAcceleration(accelerationMagnitude),
    accelerationIncludingGravity: createAcceleration(gravityAccelerationMagnitude),
  } as DeviceMotionEvent
}

function createAcceleration(magnitude: number | null) {
  if (magnitude === null) {
    return { x: null, y: null, z: null }
  }

  return { x: magnitude, y: 0, z: 0 }
}
