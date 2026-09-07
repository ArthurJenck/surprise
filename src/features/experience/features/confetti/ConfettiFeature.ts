import * as THREE from 'three'
import type { EffectsConfig, ThemeConfig } from '../../../../config/experience/types'
import type { ExperienceFeature } from '../../domain/contracts'

interface ConfettiParticle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: THREE.Euler
  rotationSpeed: THREE.Vector3
}

export class ConfettiFeature implements ExperienceFeature {
  private readonly mesh: THREE.InstancedMesh
  private readonly particles: ConfettiParticle[]
  private readonly dummy = new THREE.Object3D()
  private readonly config: EffectsConfig['confetti']
  private active = false
  private ageSeconds = 0

  constructor(
    scene: THREE.Scene,
    effectsConfig: EffectsConfig,
    themeConfig: ThemeConfig,
    coarsePointer: boolean
  ) {
    this.config = effectsConfig.confetti
    const count = coarsePointer ? this.config.coarsePointerCount : this.config.finePointerCount
    const geometry = new THREE.PlaneGeometry(this.config.size[0], this.config.size[1])
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
    this.mesh = new THREE.InstancedMesh(geometry, material, count)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.visible = false
    this.mesh.frustumCulled = false
    this.particles = createParticles(this.mesh, count, themeConfig)
    scene.add(this.mesh)
  }

  start() {
    this.active = true
    this.ageSeconds = 0
    this.mesh.visible = true

    for (const particle of this.particles) {
      const angle = randomRange(-Math.PI, Math.PI)
      const horizontalSpeed = randomRange(...this.config.horizontalSpeed)
      particle.position.set(
        randomRange(...this.config.spawn.x),
        randomRange(...this.config.spawn.y),
        randomRange(...this.config.spawn.z)
      )
      particle.velocity.set(
        Math.cos(angle) * horizontalSpeed,
        randomRange(...this.config.verticalSpeed),
        Math.sin(angle) * horizontalSpeed
      )
      particle.rotation.set(
        randomRange(...this.config.initialRotationRadians),
        randomRange(...this.config.initialRotationRadians),
        randomRange(...this.config.initialRotationRadians)
      )
      particle.rotationSpeed.set(
        randomRange(...this.config.rotationSpeed.x),
        randomRange(...this.config.rotationSpeed.y),
        randomRange(...this.config.rotationSpeed.z)
      )
    }
  }

  update(deltaSeconds: number) {
    if (!this.active) {
      return
    }

    this.ageSeconds += deltaSeconds
    for (let index = 0; index < this.particles.length; index += 1) {
      const particle = this.particles[index]
      particle.velocity.y -= this.config.gravityPerSecond * deltaSeconds
      particle.velocity.multiplyScalar(Math.pow(this.config.dampingBasePerSecond, deltaSeconds))
      particle.position.addScaledVector(particle.velocity, deltaSeconds)
      particle.rotation.x += particle.rotationSpeed.x * deltaSeconds
      particle.rotation.y += particle.rotationSpeed.y * deltaSeconds
      particle.rotation.z += particle.rotationSpeed.z * deltaSeconds
      this.dummy.position.copy(particle.position)
      this.dummy.rotation.copy(particle.rotation)
      this.dummy.scale.setScalar(calculateConfettiScale(this.ageSeconds, this.config))
      this.dummy.updateMatrix()
      this.mesh.setMatrixAt(index, this.dummy.matrix)
    }

    this.mesh.instanceMatrix.needsUpdate = true
    if (this.ageSeconds >= this.config.durationSeconds) {
      this.active = false
      this.mesh.visible = false
    }
  }

  isActive() {
    return this.active
  }

  dispose() {
    this.mesh.removeFromParent()
  }
}

export function calculateConfettiScale(
  ageSeconds: number,
  config: EffectsConfig['confetti']
) {
  const fadeProgress = Math.max(0, ageSeconds - config.fadeStartSeconds) / config.fadeDurationSeconds
  return Math.max(config.minimumScale, 1 - fadeProgress)
}

function createParticles(
  mesh: THREE.InstancedMesh,
  count: number,
  themeConfig: ThemeConfig
) {
  const particles: ConfettiParticle[] = []

  for (let index = 0; index < count; index += 1) {
    particles.push({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      rotationSpeed: new THREE.Vector3(),
    })
    mesh.setColorAt(index, new THREE.Color(themeConfig.scene.confetti[index % themeConfig.scene.confetti.length]))
  }

  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true
  }

  return particles
}

function randomRange(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum)
}
