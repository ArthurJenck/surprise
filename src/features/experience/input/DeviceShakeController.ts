import type { InteractionConfig } from '../../../config/experience/types'
import type { ExperienceState } from '../domain/contracts'

type ShakeToOpenConfig = InteractionConfig['shakeToOpen']
type MotionPermission = 'granted' | 'denied'

interface MotionPermissionRequester {
  requestPermission?: () => Promise<MotionPermission>
}

export interface DeviceMotionEnvironment {
  readonly isSecureContext: boolean
  readonly motionEvent: MotionPermissionRequester | undefined
  addMotionListener: (listener: (event: DeviceMotionEvent) => void) => void
  removeMotionListener: (listener: (event: DeviceMotionEvent) => void) => void
}

interface DeviceShakeControllerOptions {
  config: ShakeToOpenConfig
  enabled: boolean
  getState: () => ExperienceState
  onShake: () => void
  environment?: DeviceMotionEnvironment
  now?: () => number
}

export class ShakeDetector {
  private peakCount = 0
  private firstPeakAtMs: number | undefined
  private cooldownUntilMs = 0
  private wasAboveThreshold = false

  constructor(private readonly config: ShakeToOpenConfig) {}

  consume(event: DeviceMotionEvent, nowMs: number) {
    const magnitude = getAccelerationMagnitude(event)
    if (magnitude === undefined) {
      return false
    }

    const isAboveThreshold =
      magnitude >= this.config.minimumAccelerationMagnitudeMetersPerSecondSquared
    const isNewPeak = isAboveThreshold && !this.wasAboveThreshold
    this.wasAboveThreshold = isAboveThreshold

    if (!isNewPeak || nowMs < this.cooldownUntilMs) {
      return false
    }

    if (
      this.firstPeakAtMs === undefined ||
      nowMs - this.firstPeakAtMs > this.config.peakWindowMs
    ) {
      this.firstPeakAtMs = nowMs
      this.peakCount = 1
      return false
    }

    this.peakCount += 1
    if (this.peakCount < this.config.requiredPeakCount) {
      return false
    }

    this.firstPeakAtMs = undefined
    this.peakCount = 0
    this.cooldownUntilMs = nowMs + this.config.cooldownMs
    return true
  }
}

export class DeviceShakeController {
  private readonly environment: DeviceMotionEnvironment
  private readonly detector: ShakeDetector
  private readonly now: () => number
  private permissionRequested = false
  private listening = false
  private disposed = false

  constructor(private readonly options: DeviceShakeControllerOptions) {
    this.environment = options.environment ?? createBrowserEnvironment()
    this.detector = new ShakeDetector(options.config)
    this.now = options.now ?? performance.now.bind(performance)
  }

  arm() {
    if (
      !this.options.enabled ||
      this.disposed ||
      this.listening ||
      this.permissionRequested ||
      this.options.getState() !== 'idle' ||
      !this.environment.isSecureContext ||
      !this.environment.motionEvent
    ) {
      return
    }

    const requestPermission = this.environment.motionEvent.requestPermission
    if (!requestPermission) {
      this.startListening()
      return
    }

    this.permissionRequested = true
    void requestPermission()
      .then((permission) => {
        if (
          permission === 'granted' &&
          !this.disposed &&
          this.options.getState() === 'idle'
        ) {
          this.startListening()
        }
      })
      .catch(() => undefined)
  }

  dispose() {
    if (this.disposed) {
      return
    }

    this.disposed = true
    if (this.listening) {
      this.environment.removeMotionListener(this.handleMotion)
      this.listening = false
    }
  }

  private startListening() {
    if (this.disposed || this.listening || this.options.getState() !== 'idle') {
      return
    }

    this.listening = true
    this.environment.addMotionListener(this.handleMotion)
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    if (this.options.getState() !== 'idle') {
      return
    }

    if (this.detector.consume(event, this.now())) {
      this.dispose()
      this.options.onShake()
    }
  }
}

function createBrowserEnvironment(): DeviceMotionEnvironment {
  return {
    isSecureContext: window.isSecureContext,
    motionEvent: window.DeviceMotionEvent as MotionPermissionRequester | undefined,
    addMotionListener: (listener) => window.addEventListener('devicemotion', listener),
    removeMotionListener: (listener) => window.removeEventListener('devicemotion', listener),
  }
}

function getAccelerationMagnitude(event: DeviceMotionEvent) {
  const acceleration = toAccelerationVector(event.acceleration) ?? toAccelerationVector(event.accelerationIncludingGravity)
  if (!acceleration) {
    return undefined
  }

  return Math.hypot(acceleration.x, acceleration.y, acceleration.z)
}

function toAccelerationVector(acceleration: DeviceMotionEventAcceleration | null) {
  if (!acceleration) {
    return undefined
  }

  const { x, y, z } = acceleration
  if (
    x === null ||
    y === null ||
    z === null ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(z)
  ) {
    return undefined
  }

  return { x, y, z }
}
