import type { InteractionConfig } from '../../../config/experience/types'
import type { ExperienceState } from '../domain/contracts'

interface ParallaxDrag {
  totalX: number
  totalY: number
  width: number
  height: number
}

interface InputCallbacks {
  getState: () => ExperienceState
  isGiftHit: (event: PointerEvent) => boolean
  onOrbitDrag: (movementX: number, movementY: number) => void
  onParallaxStart: () => void
  onParallaxDrag: (drag: ParallaxDrag) => void
  onUserGesture: () => void
  onActivate: () => void
  requestFrame: () => void
}

export class InputController {
  private pointerId: number | undefined
  private pointerMoved = false
  private pointerStartX = 0
  private pointerStartY = 0
  private pointerPreviousX = 0
  private pointerPreviousY = 0

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: InteractionConfig,
    private readonly callbacks: InputCallbacks
  ) {
    canvas.addEventListener('pointerdown', this.handlePointerDown)
    canvas.addEventListener('pointermove', this.handlePointerMove)
    canvas.addEventListener('pointerup', this.handlePointerUp)
    canvas.addEventListener('pointercancel', this.handlePointerCancel)
    canvas.addEventListener('keydown', this.handleKeyDown)
  }

  get isPointerActive() {
    return this.pointerId !== undefined
  }

  dispose() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    this.canvas.removeEventListener('pointermove', this.handlePointerMove)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
    this.canvas.removeEventListener('pointercancel', this.handlePointerCancel)
    this.canvas.removeEventListener('keydown', this.handleKeyDown)
  }

  private handlePointerDown = (event: PointerEvent) => {
    if (this.pointerId !== undefined || this.callbacks.getState() === 'failed') {
      return
    }

    this.pointerId = event.pointerId
    this.pointerMoved = false
    this.pointerStartX = event.clientX
    this.pointerStartY = event.clientY
    this.pointerPreviousX = event.clientX
    this.pointerPreviousY = event.clientY

    if (this.callbacks.getState() === 'idle') {
      this.callbacks.onUserGesture()
    }

    if (this.callbacks.getState() !== 'idle') {
      this.callbacks.onParallaxStart()
    }

    try {
      this.canvas.setPointerCapture(event.pointerId)
    } catch {
      this.pointerId = event.pointerId
    }

    this.callbacks.requestFrame()
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (this.pointerId !== event.pointerId) {
      return
    }

    const totalX = event.clientX - this.pointerStartX
    const totalY = event.clientY - this.pointerStartY
    const movementX = event.clientX - this.pointerPreviousX
    const movementY = event.clientY - this.pointerPreviousY

    if (Math.hypot(totalX, totalY) > this.config.dragThresholdPx) {
      this.pointerMoved = true
    }

    if (this.callbacks.getState() === 'idle' && this.pointerMoved) {
      this.callbacks.onOrbitDrag(movementX, movementY)
    } else if (this.callbacks.getState() !== 'idle') {
      this.callbacks.onParallaxDrag({
        totalX,
        totalY,
        width: Math.max(this.canvas.clientWidth, 1),
        height: Math.max(this.canvas.clientHeight, 1),
      })
    }

    this.pointerPreviousX = event.clientX
    this.pointerPreviousY = event.clientY
    this.callbacks.requestFrame()
  }

  private handlePointerUp = (event: PointerEvent) => {
    if (this.pointerId !== event.pointerId) {
      return
    }

    const shouldActivate =
      this.callbacks.getState() === 'idle' && !this.pointerMoved && this.callbacks.isGiftHit(event)
    this.pointerId = undefined

    try {
      this.canvas.releasePointerCapture(event.pointerId)
    } catch {
      this.pointerId = undefined
    }

    if (shouldActivate) {
      this.callbacks.onActivate()
      return
    }

    this.callbacks.requestFrame()
  }

  private handlePointerCancel = (event: PointerEvent) => {
    if (this.pointerId !== event.pointerId) {
      return
    }

    this.pointerId = undefined
    this.callbacks.requestFrame()
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && this.callbacks.getState() === 'idle') {
      event.preventDefault()
      this.callbacks.onActivate()
    }
  }
}
