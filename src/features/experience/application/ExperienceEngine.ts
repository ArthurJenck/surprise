import * as THREE from 'three'
import type { ExperienceConfig } from '../../../config/experience'
import { assertValidExperienceConfig } from '../../../config/experience/validation'
import { disposeSceneResources } from '../core/dispose'
import { createSceneLights } from '../core/lighting'
import { createRenderer } from '../core/renderer'
import { resolveViewport } from '../core/viewport'
import type {
  ExperienceCallbacks,
  ExperienceController,
  ExperienceState,
  Viewport,
} from '../domain/contracts'
import { assertTransition } from '../domain/state'
import {
  easeInOutCubic,
  phase,
  recenterDurationForAngle,
} from '../domain/timeline'
import { ConfettiFeature } from '../features/confetti/ConfettiFeature'
import { playOpeningFeedback } from '../features/feedback/openingFeedback'
import { GiftFeature } from '../features/gift/GiftFeature'
import { RevealFeature } from '../features/reveal/RevealFeature'
import { DeviceShakeController } from '../input/DeviceShakeController'
import { InputController } from '../input/InputController'

const FRONT_QUATERNION = new THREE.Quaternion()
const Y_AXIS = new THREE.Vector3(0, 1, 0)
const X_AXIS = new THREE.Vector3(1, 0, 0)

export class ExperienceEngine implements ExperienceController {
  private state: ExperienceState = 'idle'
  private destroyed = false
  private frameId = 0
  private shakeTimer = 0
  private openingStartedAtMs = 0
  private recenterDurationMs: number
  private openingStateSent = false
  private giftOpened = false
  private lastFrameAtMs = performance.now()
  private currentPixelRatio: number
  private sampleDurationSeconds = 0
  private sampleFrames = 0
  private adaptedPixelRatio = false
  private viewport: Viewport
  private inertiaX = 0
  private inertiaY = 0
  private parallaxStartX = 0
  private parallaxStartY = 0
  private parallaxTargetX = 0
  private parallaxTargetY = 0
  private parallaxCurrentX = 0
  private parallaxCurrentY = 0
  private readonly targetOrbitQuaternion = new THREE.Quaternion()
  private readonly openingQuaternion = new THREE.Quaternion()
  private readonly parallaxQuaternion = new THREE.Quaternion()
  private readonly yawQuaternion = new THREE.Quaternion()
  private readonly pitchQuaternion = new THREE.Quaternion()
  private readonly candidateOrbitQuaternion = new THREE.Quaternion()
  private readonly orbitCameraPosition = new THREE.Vector3()
  private readonly pointer = new THREE.Vector2()
  private readonly raycaster = new THREE.Raycaster()
  private readonly resizeObserver: ResizeObserver
  private readonly input: InputController
  private readonly shakeToOpen: DeviceShakeController
  private openingOrbitYaw = 0
  private openingOrbitPitch = 0

  private constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: ExperienceConfig,
    private readonly callbacks: ExperienceCallbacks,
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly cameraRig: THREE.Group,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly gift: GiftFeature,
    private readonly reveal: RevealFeature,
    private readonly confetti: ConfettiFeature,
    private readonly reducedMotion: boolean,
    private readonly coarsePointer: boolean
  ) {
    this.recenterDurationMs = config.motion.opening.recenterMinDurationMs
    this.currentPixelRatio = renderer.getPixelRatio()
    this.viewport = resolveViewport(canvas.clientWidth, canvas.clientHeight, config.responsive)
    const frontCameraPosition = new THREE.Vector3(0, this.viewport.cameraY, this.viewport.cameraZ)
    const initialPosition = new THREE.Vector3().fromArray(config.scene.camera.initialPosition)
    this.camera.position.copy(frontCameraPosition)
    this.camera.lookAt(...config.scene.camera.initialLookAt)
    this.cameraRig.quaternion.setFromEuler(
      new THREE.Euler(
        Math.atan2(frontCameraPosition.y, frontCameraPosition.z) -
          Math.atan2(initialPosition.y, Math.hypot(initialPosition.x, initialPosition.z)),
        Math.atan2(initialPosition.x, initialPosition.z),
        0,
        'YXZ'
      )
    )
    this.targetOrbitQuaternion.copy(this.cameraRig.quaternion)
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.shakeToOpen = new DeviceShakeController({
      config: config.interaction.shakeToOpen,
      enabled: coarsePointer && !reducedMotion,
      getState: () => this.state,
      onShake: this.beginOpening,
    })
    this.input = new InputController(canvas, config.interaction, {
      getState: () => this.state,
      isGiftHit: this.isGiftHit,
      onOrbitDrag: this.handleOrbitDrag,
      onParallaxStart: this.captureParallaxStart,
      onParallaxDrag: this.handleParallaxDrag,
      onUserGesture: this.armShakeToOpen,
      onActivate: this.beginOpening,
      requestFrame: this.requestFrame,
    })
  }

  static async create(
    canvas: HTMLCanvasElement,
    config: ExperienceConfig,
    callbacks: ExperienceCallbacks
  ): Promise<ExperienceEngine> {
    assertValidExperienceConfig(config)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const renderer = createRenderer(canvas, config.scene, config.effects, coarsePointer)
    const scene = new THREE.Scene()
    const cameraRig = new THREE.Group()
    const camera = new THREE.PerspectiveCamera(config.responsive.default.cameraFov, 1, config.scene.camera.near, config.scene.camera.far)
    camera.position.fromArray(config.scene.camera.initialPosition)
    camera.lookAt(...config.scene.camera.initialLookAt)
    cameraRig.add(camera)
    scene.add(cameraRig)
    createSceneLights(scene, config.scene, config.theme)

    try {
      const gift = await GiftFeature.create(
        scene,
        config.scene,
        config.theme,
        config.motion,
        callbacks.onLoadProgress
      )
      const reveal = await RevealFeature.create(
        scene,
        config.content,
        config.scene,
        config.theme,
        config.motion
      )
      const confetti = new ConfettiFeature(scene, config.effects, config.theme, coarsePointer)
      return new ExperienceEngine(
        canvas,
        config,
        callbacks,
        renderer,
        scene,
        cameraRig,
        camera,
        gift,
        reveal,
        confetti,
        reducedMotion,
        coarsePointer
      ).initialize()
    } catch (error) {
      disposeSceneResources(scene)
      renderer.dispose()
      throw error
    }
  }

  destroy = () => {
    if (this.destroyed) {
      return
    }

    this.destroyed = true
    window.cancelAnimationFrame(this.frameId)
    window.clearTimeout(this.shakeTimer)
    this.resizeObserver.disconnect()
    this.input.dispose()
    this.shakeToOpen.dispose()
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.gift.dispose()
    this.reveal.dispose()
    this.confetti.dispose()
    disposeSceneResources(this.scene)
    this.renderer.dispose()
  }

  private initialize() {
    this.resizeObserver.observe(this.canvas)
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost)
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    this.handleResize()
    this.renderer.render(this.scene, this.camera)
    this.scheduleShake()
    this.callbacks.onReady()
    this.callbacks.onStateChange('idle')
    return this
  }

  private requestFrame = () => {
    if (this.destroyed || this.frameId) {
      return
    }

    this.frameId = window.requestAnimationFrame(this.renderFrame)
  }

  private renderFrame = (nowMs: number) => {
    this.frameId = 0
    if (this.destroyed) {
      return
    }

    const deltaSeconds = Math.min(
      (nowMs - this.lastFrameAtMs) / 1000,
      this.config.motion.maxFrameDeltaSeconds
    )
    this.lastFrameAtMs = nowMs

    if (this.state === 'idle') {
      this.updateIdle(nowMs, deltaSeconds)
    } else {
      this.updateParallax(deltaSeconds)
    }

    if (this.state === 'recentering' || this.state === 'opening') {
      this.updateOpening(nowMs, deltaSeconds)
      this.samplePerformance(deltaSeconds)
    } else if (this.state === 'revealed') {
      this.confetti.update(deltaSeconds)
    }

    this.renderer.render(this.scene, this.camera)

    if (this.needsAnotherFrame()) {
      this.requestFrame()
    }
  }

  private updateIdle(nowMs: number, deltaSeconds: number) {
    const orbit = this.config.motion.idle.orbit
    const interaction = this.config.interaction.orbit
    if (Math.abs(this.inertiaX) > interaction.minimumInertia || Math.abs(this.inertiaY) > interaction.minimumInertia) {
      const appliedPitch = this.applyOrbitRotation(this.inertiaX, this.inertiaY)
      const damping = Math.pow(orbit.dampingBasePerSecond, deltaSeconds)
      this.inertiaX *= damping
      this.inertiaY = appliedPitch ? this.inertiaY * damping : 0
    }

    this.cameraRig.quaternion.slerp(
      this.targetOrbitQuaternion,
      1 - Math.pow(orbit.slerpBasePerSecond, deltaSeconds)
    )

    const wasShaking = this.gift.isShaking()
    const shaking = !this.reducedMotion && this.gift.updateIdleShake(nowMs)
    if (wasShaking && !shaking) {
      this.scheduleShake()
    }
  }

  private updateParallax(deltaSeconds: number) {
    const response = 1 - Math.pow(this.config.motion.parallax.responseBasePerSecond, deltaSeconds)
    this.parallaxCurrentX = THREE.MathUtils.lerp(this.parallaxCurrentX, this.parallaxTargetX, response)
    this.parallaxCurrentY = THREE.MathUtils.lerp(this.parallaxCurrentY, this.parallaxTargetY, response)
    this.parallaxQuaternion.setFromEuler(
      new THREE.Euler(this.parallaxCurrentY, this.parallaxCurrentX, 0, 'YXZ')
    )

    if (this.state === 'revealed') {
      this.cameraRig.quaternion.copy(this.parallaxQuaternion)
    }
  }

  private updateOpening(nowMs: number, deltaSeconds: number) {
    const timeScale = this.reducedMotion ? this.config.motion.opening.reducedMotionTimeScale : 1
    const elapsedMs = (nowMs - this.openingStartedAtMs) / timeScale
    const recenterProgress = easeInOutCubic(phase(elapsedMs, 0, this.recenterDurationMs))
    this.cameraRig.quaternion
      .setFromEuler(
        new THREE.Euler(
          THREE.MathUtils.lerp(this.openingOrbitPitch, 0, recenterProgress),
          THREE.MathUtils.lerp(this.openingOrbitYaw, 0, recenterProgress),
          0,
          'YXZ'
        )
      )
      .multiply(this.parallaxQuaternion)

    if (!this.openingStateSent && elapsedMs >= this.recenterDurationMs) {
      this.openingStateSent = true
      this.setState('opening')
    }

    const openingElapsedMs = Math.max(0, elapsedMs - this.recenterDurationMs)
    const clipDurationMs = this.gift.clipDurationSeconds * 1000
    if (!this.giftOpened) {
      const clipProgress = phase(openingElapsedMs, 0, clipDurationMs)
      this.gift.setOpeningProgress(clipProgress)

      if (clipProgress === 1) {
        this.giftOpened = true
        this.gift.pauseOpening()
        if (!this.reducedMotion) {
          this.confetti.start()
        }
      }
    }

    const revealElapsedMs = Math.max(0, openingElapsedMs - clipDurationMs)
    const textProgress = phase(
      openingElapsedMs,
      Math.max(0, clipDurationMs - this.config.motion.opening.textStartBeforeClipEndMs),
      clipDurationMs + this.config.motion.opening.textRevealDurationMs
    )
    const stageProgress = easeInOutCubic(
      phase(revealElapsedMs, 0, this.config.motion.opening.stageRevealDurationMs)
    )

    this.gift.setStageProgress(stageProgress)
    this.gift.setScale(
      THREE.MathUtils.lerp(this.viewport.baseGiftScale, this.viewport.finalGiftScale, stageProgress)
    )
    this.reveal.applyAnimatedOpeningProgress(textProgress, this.viewport.textScale)
    this.confetti.update(deltaSeconds)

    if (this.giftOpened && revealElapsedMs >= this.config.motion.opening.completionDelayMs) {
      this.reveal.finalize(this.viewport.textScale)
      this.gift.finalizeStage(this.viewport.finalGiftScale)
      this.cameraRig.quaternion.copy(this.parallaxQuaternion)
      this.setState('revealed')
    }
  }

  private samplePerformance(deltaSeconds: number) {
    const performanceConfig = this.config.effects.performance
    if (this.adaptedPixelRatio || deltaSeconds <= 0) {
      return
    }

    this.sampleDurationSeconds += deltaSeconds
    this.sampleFrames += 1
    if (this.sampleDurationSeconds < performanceConfig.sampleDurationSeconds) {
      return
    }

    const framesPerSecond = this.sampleFrames / this.sampleDurationSeconds
    if (framesPerSecond < performanceConfig.minimumFramesPerSecond && this.currentPixelRatio > performanceConfig.minimumPixelRatio) {
      this.currentPixelRatio = Math.max(
        performanceConfig.minimumPixelRatio,
        this.currentPixelRatio - performanceConfig.pixelRatioStep
      )
      this.renderer.setPixelRatio(this.currentPixelRatio)
      this.renderer.setSize(this.viewport.width, this.viewport.height, false)
    }
    this.adaptedPixelRatio = true
  }

  private needsAnotherFrame() {
    if (
      this.state === 'recentering' ||
      this.state === 'opening' ||
      this.confetti.isActive() ||
      this.gift.isShaking() ||
      this.input.isPointerActive
    ) {
      return true
    }

    if (this.state === 'idle') {
      const orbitDifference = 1 - Math.abs(this.cameraRig.quaternion.dot(this.targetOrbitQuaternion))
      return (
        Math.abs(this.inertiaX) > this.config.interaction.orbit.minimumInertia ||
        Math.abs(this.inertiaY) > this.config.interaction.orbit.minimumInertia ||
        orbitDifference > this.config.interaction.orbit.minimumQuaternionDifference
      )
    }

    const parallaxDifference =
      Math.abs(this.parallaxTargetX - this.parallaxCurrentX) +
      Math.abs(this.parallaxTargetY - this.parallaxCurrentY)
    return parallaxDifference > this.config.interaction.parallax.minimumDifference
  }

  private scheduleShake() {
    window.clearTimeout(this.shakeTimer)
    if (this.reducedMotion || this.state !== 'idle' || this.destroyed) {
      return
    }

    const [minimumDelayMs, maximumDelayMs] = this.config.motion.idle.shake.delayRangeMs
    const delayMs = THREE.MathUtils.lerp(minimumDelayMs, maximumDelayMs, Math.random())

    this.shakeTimer = window.setTimeout(() => {
      if (this.state === 'idle' && !this.destroyed) {
        this.gift.startShake(performance.now())
        this.requestFrame()
      }
    }, delayMs)
  }

  private beginOpening = () => {
    if (this.state !== 'idle') {
      return
    }

    window.clearTimeout(this.shakeTimer)
    this.shakeToOpen.dispose()
    this.openingQuaternion.copy(this.cameraRig.quaternion)
    this.orbitCameraPosition.copy(this.camera.position).applyQuaternion(this.cameraRig.quaternion)
    this.openingOrbitYaw = Math.atan2(this.orbitCameraPosition.x, this.orbitCameraPosition.z)
    this.openingOrbitPitch =
      Math.atan2(this.camera.position.y, this.camera.position.z) -
      Math.atan2(
        this.orbitCameraPosition.y,
        Math.hypot(this.orbitCameraPosition.x, this.orbitCameraPosition.z)
      )
    this.openingStartedAtMs = performance.now()
    this.recenterDurationMs = recenterDurationForAngle(
      this.openingQuaternion.angleTo(FRONT_QUATERNION),
      this.config.motion.opening.recenterMinDurationMs,
      this.config.motion.opening.recenterMaxDurationMs
    )
    this.parallaxTargetX = 0
    this.parallaxTargetY = 0
    this.inertiaX = 0
    this.inertiaY = 0
    this.openingStateSent = false
    this.giftOpened = false
    this.gift.resetOpening()
    this.setState('recentering')
    playOpeningFeedback(this.config.feedback)
    this.requestFrame()
  }

  private handleOrbitDrag = (movementX: number, movementY: number) => {
    const sensitivity = this.coarsePointer
      ? this.config.interaction.orbit.coarsePointerSensitivity
      : this.config.interaction.orbit.finePointerSensitivity
    const appliedPitch = this.applyOrbitRotation(
      -movementX * sensitivity,
      -movementY * sensitivity
    )
    this.inertiaX = -movementX * sensitivity * this.config.interaction.orbit.inertiaMultiplier
    this.inertiaY = appliedPitch
      ? -movementY * sensitivity * this.config.interaction.orbit.inertiaMultiplier
      : 0
  }

  private armShakeToOpen = () => {
    this.shakeToOpen.arm()
  }

  private applyOrbitRotation(yaw: number, pitch: number) {
    this.yawQuaternion.setFromAxisAngle(Y_AXIS, yaw)
    this.pitchQuaternion.setFromAxisAngle(X_AXIS, pitch)
    this.candidateOrbitQuaternion
      .copy(this.targetOrbitQuaternion)
      .premultiply(this.yawQuaternion)
      .multiply(this.pitchQuaternion)
      .normalize()

    if (this.isOrbitCameraAboveGround(this.candidateOrbitQuaternion)) {
      this.targetOrbitQuaternion.copy(this.candidateOrbitQuaternion)
      return true
    }

    this.targetOrbitQuaternion.premultiply(this.yawQuaternion).normalize()
    return false
  }

  private isOrbitCameraAboveGround(orbitQuaternion: THREE.Quaternion) {
    const groundY =
      this.config.scene.stage.initialY +
      this.config.scene.gift.shadow.y * this.viewport.baseGiftScale
    const minimumCameraY =
      groundY + this.config.interaction.orbit.minimumCameraGroundClearance
    this.orbitCameraPosition.copy(this.camera.position).applyQuaternion(orbitQuaternion)
    return this.orbitCameraPosition.y >= minimumCameraY
  }

  private handleParallaxDrag = ({
    totalX,
    totalY,
    width,
    height,
  }: {
    totalX: number
    totalY: number
    width: number
    height: number
  }) => {
    const parallax = this.config.interaction.parallax
    this.parallaxTargetX = THREE.MathUtils.clamp(
      this.parallaxStartX - (totalX / width) * parallax.horizontalFactor,
      -parallax.maxX,
      parallax.maxX
    )
    this.parallaxTargetY = THREE.MathUtils.clamp(
      this.parallaxStartY - (totalY / height) * parallax.verticalFactor,
      -parallax.maxY,
      parallax.maxY
    )
  }

  private captureParallaxStart = () => {
    this.parallaxStartX = this.parallaxTargetX
    this.parallaxStartY = this.parallaxTargetY
  }

  private isGiftHit = (event: PointerEvent) => {
    const bounds = this.canvas.getBoundingClientRect()
    this.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    this.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    this.raycaster.setFromCamera(this.pointer, this.camera)
    return this.raycaster.intersectObjects(this.gift.hitTargets, false).length > 0
  }

  private handleResize = () => {
    this.viewport = resolveViewport(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      this.config.responsive
    )
    this.camera.aspect = this.viewport.aspectRatio
    this.camera.fov = this.viewport.cameraFov
    this.camera.position.set(0, this.viewport.cameraY, this.viewport.cameraZ)
    this.camera.lookAt(...this.config.scene.camera.initialLookAt)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.viewport.width, this.viewport.height, false)

    if (this.state === 'idle') {
      this.gift.setScale(this.viewport.baseGiftScale)
    } else if (this.state === 'revealed') {
      this.gift.finalizeStage(this.viewport.finalGiftScale)
      this.reveal.setResponsiveScale(this.viewport.textScale)
    }

    this.requestFrame()
  }

  private handleContextLost = (event: Event) => {
    event.preventDefault()
    this.setState('failed')
    this.callbacks.onFailure()
    this.destroy()
  }

  private handleVisibilityChange = () => {
    if (!document.hidden) {
      this.lastFrameAtMs = performance.now()
      this.requestFrame()
    }
  }

  private setState(nextState: ExperienceState) {
    if (this.state === nextState) {
      return
    }

    assertTransition(this.state, nextState)
    this.state = nextState
    if (nextState === 'revealed') {
      this.canvas.setAttribute(
        'aria-label',
        'Cadeau ouvert. Les liens professionnels sont affichés sous la scène.'
      )
      this.canvas.setAttribute('role', 'img')
      this.canvas.tabIndex = -1
      this.canvas.blur()
    }
    this.callbacks.onStateChange(nextState)
  }
}
