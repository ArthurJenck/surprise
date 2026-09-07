import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type {
    MotionConfig,
    SceneConfig,
    ThemeConfig,
} from '../../../../config/experience/types'
import type { ExperienceFeature } from '../../domain/contracts'
import {
    createShakePattern,
    sampleShakePattern,
    type ShakePattern,
} from './shakePattern'

export class GiftFeature implements ExperienceFeature {
    readonly stage = new THREE.Group()
    readonly visual = new THREE.Group()
    readonly hitTargets: THREE.Object3D[]
    readonly clipDurationSeconds: number

    private readonly mixer: THREE.AnimationMixer
    private readonly action: THREE.AnimationAction
    private readonly config: SceneConfig
    private readonly motionConfig: MotionConfig
    private shakeStartedAtMs = 0
    private shakePattern: ShakePattern | undefined

    private constructor(
        asset: GiftAsset,
        scene: THREE.Scene,
        config: SceneConfig,
        themeConfig: ThemeConfig,
        motionConfig: MotionConfig
    ) {
        this.config = config
        this.motionConfig = motionConfig
        this.mixer = asset.mixer
        this.action = asset.action
        this.clipDurationSeconds = asset.durationSeconds
        this.hitTargets = [this.createHitArea(), ...asset.hitTargets]

        this.stage.position.y = config.stage.initialY
        this.visual.add(this.hitTargets[0])
        this.visual.add(asset.root)
        this.stage.add(this.visual)
        this.stage.add(createShadow(config, themeConfig))
        scene.add(this.stage)
    }

    static async create(
        scene: THREE.Scene,
        config: SceneConfig,
        themeConfig: ThemeConfig,
        motionConfig: MotionConfig
    ) {
        const asset = await loadGiftAsset(config, themeConfig)
        return new GiftFeature(asset, scene, config, themeConfig, motionConfig)
    }

    setScale(scale: number) {
        this.stage.scale.setScalar(scale)
    }

    setStageProgress(progress: number) {
        this.stage.position.y = THREE.MathUtils.lerp(
            this.config.stage.initialY,
            this.config.stage.finalY,
            progress
        )
    }

    finalizeStage(finalScale: number) {
        this.stage.position.y = this.config.stage.finalY
        this.setScale(finalScale)
    }

    resetOpening() {
        this.shakeStartedAtMs = 0
        this.shakePattern = undefined
        this.resetShakeTransform()
        this.action.reset()
        this.action.paused = false
        this.action.play()
        this.mixer.setTime(0)
    }

    setOpeningProgress(progress: number) {
        this.mixer.setTime(this.clipDurationSeconds * progress)
    }

    pauseOpening() {
        this.action.paused = true
    }

    startShake(nowMs: number) {
        this.shakeStartedAtMs = nowMs
        this.shakePattern = createShakePattern(this.motionConfig.idle.shake)
    }

    updateIdleShake(nowMs: number) {
        if (this.shakeStartedAtMs === 0) {
            return false
        }

        if (!this.shakePattern) {
            return false
        }

        const elapsedMs = nowMs - this.shakeStartedAtMs
        if (elapsedMs < this.shakePattern.durationMs) {
            const transform = sampleShakePattern(this.shakePattern, elapsedMs)
            this.visual.rotation.x = transform.rotationX
            this.visual.rotation.z = transform.rotationZ
            this.visual.position.x = transform.positionX
            this.visual.position.y = transform.positionY
            return true
        }

        this.shakeStartedAtMs = 0
        this.shakePattern = undefined
        this.resetShakeTransform()
        return false
    }

    isShaking() {
        return this.shakeStartedAtMs > 0
    }

    dispose() {
        this.mixer.stopAllAction()
        this.mixer.uncacheRoot(this.mixer.getRoot())
    }

    private createHitArea() {
        const { size, segments, radius, y } = this.config.gift.hitArea
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            colorWrite: false,
        })
        const hitArea = new THREE.Mesh(
            new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius),
            material
        )
        hitArea.position.y = y
        return hitArea
    }

    private resetShakeTransform() {
        this.visual.rotation.set(0, 0, 0)
        this.visual.position.set(0, 0, 0)
    }
}

interface GiftAsset {
    root: THREE.Group
    mixer: THREE.AnimationMixer
    action: THREE.AnimationAction
    durationSeconds: number
    hitTargets: THREE.Object3D[]
}

async function loadGiftAsset(
    config: SceneConfig,
    themeConfig: ThemeConfig
): Promise<GiftAsset> {
    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(config.gift.modelUrl)
    const clip = gltf.animations[0]

    if (!clip) {
        throw new Error("Le modèle du cadeau ne contient pas d'animation.")
    }

    const hitTargets: THREE.Object3D[] = []
    const previousMaterials = new Set<THREE.Material>()

    gltf.scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) {
            return
        }

        const objectMaterials = Array.isArray(object.material)
            ? object.material
            : [object.material]
        objectMaterials.forEach((material) => previousMaterials.add(material))
        object.material = Array.isArray(object.material)
            ? objectMaterials.map((material) =>
                  recolorGiftMaterial(material, config, themeConfig)
              )
            : recolorGiftMaterial(objectMaterials[0], config, themeConfig)
        object.frustumCulled = false
        hitTargets.push(object)

        if (object instanceof THREE.SkinnedMesh) {
            object.normalizeSkinWeights()
        }
    })

    previousMaterials.forEach((material) => material.dispose())

    const mixer = new THREE.AnimationMixer(gltf.scene)
    const action = mixer.clipAction(clip)
    action.setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = true
    action.play()
    mixer.setTime(0)
    gltf.scene.updateMatrixWorld(true)

    const bounds = new THREE.Box3().setFromObject(gltf.scene)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const scale = config.gift.targetSize / Math.max(size.x, size.y, size.z)
    gltf.scene.scale.setScalar(scale)
    gltf.scene.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale
    )

    const root = new THREE.Group()
    root.add(gltf.scene)
    return { root, mixer, action, durationSeconds: clip.duration, hitTargets }
}

function recolorGiftMaterial(
    material: THREE.Material,
    config: SceneConfig,
    themeConfig: ThemeConfig
) {
    const recoloredMaterial = material.clone()

    if (
        !(recoloredMaterial instanceof THREE.MeshStandardMaterial) ||
        !recoloredMaterial.map
    ) {
        return recoloredMaterial
    }

    const kraftYellow = new THREE.Color(themeConfig.scene.giftKraft)
    const previousOnBeforeCompile = recoloredMaterial.onBeforeCompile
    const previousProgramCacheKey = recoloredMaterial.customProgramCacheKey
    const replacement = config.gift.blueReplacement

    recoloredMaterial.onBeforeCompile = (shader, renderer) => {
        previousOnBeforeCompile.call(recoloredMaterial, shader, renderer)
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `
        #ifdef USE_MAP
          vec4 sampledDiffuseColor = texture2D( map, vMapUv );
          #ifdef DECODE_VIDEO_TEXTURE
            sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
          #endif
          float blueDominance = sampledDiffuseColor.b - max( sampledDiffuseColor.r, sampledDiffuseColor.g );
          float blueMask = smoothstep( ${replacement.dominanceStart.toFixed(6)}, ${replacement.dominanceEnd.toFixed(6)}, blueDominance ) * smoothstep( ${replacement.blueStart.toFixed(6)}, ${replacement.blueEnd.toFixed(6)}, sampledDiffuseColor.b );
          sampledDiffuseColor.rgb = mix( sampledDiffuseColor.rgb, vec3( ${kraftYellow.r.toFixed(6)}, ${kraftYellow.g.toFixed(6)}, ${kraftYellow.b.toFixed(6)} ), blueMask );
          diffuseColor *= sampledDiffuseColor;
        #endif
      `
        )
    }
    recoloredMaterial.customProgramCacheKey = () =>
        `${previousProgramCacheKey.call(recoloredMaterial)}:gift-blue-to-kraft`
    recoloredMaterial.needsUpdate = true

    return recoloredMaterial
}

function createShadow(config: SceneConfig, themeConfig: ThemeConfig) {
    const shadowTexture = createShadowTexture(config, themeConfig)
    const material = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
        opacity: config.gift.shadow.opacity,
        side: THREE.DoubleSide,
    })
    const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(
            config.gift.shadow.size[0],
            config.gift.shadow.size[1]
        ),
        material
    )
    shadow.position.y = config.gift.shadow.y
    shadow.rotation.x = -Math.PI / 2
    return shadow
}

function createShadowTexture(config: SceneConfig, themeConfig: ThemeConfig) {
    const textureSize = config.gift.shadow.textureSizePx
    const canvas = document.createElement('canvas')
    canvas.width = textureSize
    canvas.height = textureSize
    const context = canvas.getContext('2d')

    if (!context) {
        return new THREE.CanvasTexture(canvas)
    }

    const center = textureSize / 2
    const gradient = context.createRadialGradient(
        center,
        center,
        config.gift.shadow.innerRadiusPx,
        center,
        center,
        config.gift.shadow.outerRadiusPx
    )
    gradient.addColorStop(0, themeConfig.scene.shadowCenter)
    gradient.addColorStop(
        config.gift.shadow.middleStop,
        themeConfig.scene.shadowMiddle
    )
    gradient.addColorStop(1, themeConfig.scene.shadowEdge)
    context.fillStyle = gradient
    context.fillRect(0, 0, textureSize, textureSize)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}
