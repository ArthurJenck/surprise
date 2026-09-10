import * as THREE from 'three'
import * as opentype from 'opentype.js'
import type {
  Locale,
  LocalizedContent,
  MotionConfig,
  SceneConfig,
  ThemeConfig,
} from '../../../../config/experience/types'
import { easeOutBack, easeOutCubic } from '../../domain/timeline'
import type { ExperienceFeature } from '../../domain/contracts'

export class RevealFeature implements ExperienceFeature {
  readonly root = new THREE.Group()

  private activeContent: THREE.Group
  private readonly config: SceneConfig
  private readonly motionConfig: MotionConfig
  private readonly contentByLocale: ReadonlyMap<Locale, THREE.Group>
  private readonly materials: RevealMaterials

  private constructor(
    scene: THREE.Scene,
    config: SceneConfig,
    motionConfig: MotionConfig,
    contentByLocale: ReadonlyMap<Locale, THREE.Group>,
    materials: RevealMaterials,
    locale: Locale
  ) {
    this.config = config
    this.motionConfig = motionConfig
    this.contentByLocale = contentByLocale
    this.materials = materials
    this.activeContent = getContent(contentByLocale, locale)
    contentByLocale.forEach((content, contentLocale) => {
      content.visible = contentLocale === locale
      this.root.add(content)
    })
    this.root.visible = false
    scene.add(this.root)
  }

  static async create(
    scene: THREE.Scene,
    localizedContent: Readonly<Record<Locale, LocalizedContent>>,
    sceneConfig: SceneConfig,
    themeConfig: ThemeConfig,
    motionConfig: MotionConfig,
    locale: Locale
  ) {
    const font = await loadFont(sceneConfig.reveal.fontUrl)
    const materials = createMaterials(sceneConfig, themeConfig)
    const contentByLocale = new Map<Locale, THREE.Group>()

    for (const contentLocale of ['fr', 'en'] as const) {
      contentByLocale.set(
        contentLocale,
        createTextContent(localizedContent[contentLocale], sceneConfig, materials, font)
      )
    }

    return new RevealFeature(
      scene,
      sceneConfig,
      motionConfig,
      contentByLocale,
      materials,
      locale
    )
  }

  setLocale(locale: Locale, responsiveScale?: number) {
    const nextContent = getContent(this.contentByLocale, locale)

    if (nextContent === this.activeContent) {
      return
    }

    this.activeContent.visible = false
    this.activeContent = nextContent
    this.activeContent.visible = true

    if (responsiveScale !== undefined) {
      this.activeContent.rotation.set(0, 0, 0)
      this.activeContent.scale.setScalar(responsiveScale)
    }
  }

  applyOpeningProgress(progress: number, responsiveScale: number) {
    if (progress <= 0) {
      return
    }

    const parallax = this.motionConfig.parallax
    this.root.visible = true
    this.root.position.set(
      0,
      THREE.MathUtils.lerp(parallax.textStartY, parallax.textFinalY, progress),
      THREE.MathUtils.lerp(parallax.textStartZ, parallax.textFinalZ, progress)
    )
    this.activeContent.scale.setScalar(
      responsiveScale * Math.max(this.config.reveal.minimumVisibleScale, progress)
    )
    this.activeContent.rotation.x = THREE.MathUtils.lerp(
      parallax.textStartRotationX,
      0,
      easeOutCubic(progress)
    )
    this.activeContent.rotation.y = THREE.MathUtils.lerp(
      parallax.textStartRotationY,
      0,
      easeOutCubic(progress)
    )
  }

  applyAnimatedOpeningProgress(progress: number, responsiveScale: number) {
    this.applyOpeningProgress(easeOutBack(progress), responsiveScale)
  }

  finalize(responsiveScale: number) {
    this.root.visible = true
    this.activeContent.rotation.set(0, 0, 0)
    this.activeContent.scale.setScalar(responsiveScale)
  }

  setResponsiveScale(responsiveScale: number) {
    this.activeContent.scale.setScalar(responsiveScale)
  }

  dispose() {
    this.root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
      }
    })
    this.materials.front.dispose()
    this.materials.side.dispose()
    this.root.removeFromParent()
  }
}

interface RevealMaterials {
  front: THREE.MeshPhysicalMaterial
  side: THREE.MeshStandardMaterial
}

async function loadFont(fontUrl: string) {
  const response = await fetch(fontUrl)

  if (!response.ok) {
    throw new Error('Unable to load the local 3D font.')
  }

  return opentype.parse(await response.arrayBuffer())
}

function createMaterials(sceneConfig: SceneConfig, themeConfig: ThemeConfig): RevealMaterials {
  return {
    front: new THREE.MeshPhysicalMaterial({
      color: themeConfig.scene.revealFront,
      roughness: sceneConfig.reveal.materials.frontRoughness,
      metalness: sceneConfig.reveal.materials.frontMetalness,
      clearcoat: sceneConfig.reveal.materials.frontClearcoat,
      clearcoatRoughness: sceneConfig.reveal.materials.frontClearcoatRoughness,
    }),
    side: new THREE.MeshStandardMaterial({
      color: themeConfig.scene.revealSide,
      roughness: sceneConfig.reveal.materials.sideRoughness,
      metalness: sceneConfig.reveal.materials.sideMetalness,
    }),
  }
}

function createTextContent(
  contentConfig: LocalizedContent,
  sceneConfig: SceneConfig,
  materials: RevealMaterials,
  font: opentype.Font
) {
  const content = new THREE.Group()
  const textLines = new THREE.Group()
  let maximumWidth = 0

  content.add(textLines)

  contentConfig.revealText.lines.forEach((line, lineIndex) => {
    const geometry = createTextLineGeometry(font, line, sceneConfig)
    geometry.computeBoundingBox()
    const bounds = geometry.boundingBox

    if (!bounds) {
      return
    }

    const width = bounds.max.x - bounds.min.x
    const height = bounds.max.y - bounds.min.y
    maximumWidth = Math.max(maximumWidth, width)
    geometry.translate(
      -(bounds.min.x + bounds.max.x) / 2,
      -(bounds.min.y + bounds.max.y) / 2,
      sceneConfig.reveal.textDepthOffset
    )
    const mesh = new THREE.Mesh(geometry, [materials.front, materials.side])
    mesh.position.y =
      sceneConfig.reveal.linePositionsY[lineIndex] +
      (1 - height) * sceneConfig.reveal.lineHeightAdjustment
    textLines.add(mesh)
  })

  textLines.scale.setScalar(
    maximumWidth > 0
      ? (contentConfig.revealText.maximumWidth ?? sceneConfig.reveal.maximumWidth) /
          maximumWidth
      : 1
  )
  return content
}

function getContent(contentByLocale: ReadonlyMap<Locale, THREE.Group>, locale: Locale) {
  const content = contentByLocale.get(locale)

  if (!content) {
    throw new Error(`Missing 3D content for locale: ${locale}`)
  }

  return content
}

function createTextLineGeometry(font: opentype.Font, text: string, sceneConfig: SceneConfig) {
  const fontPath = font.getPath(text, 0, 0, 1, { kerning: true })
  const shapePath = new THREE.ShapePath()

  fontPath.commands.forEach((command) => {
    if (command.type === 'M') {
      shapePath.moveTo(command.x, -command.y)
    } else if (command.type === 'L') {
      shapePath.lineTo(command.x, -command.y)
    } else if (command.type === 'C') {
      shapePath.bezierCurveTo(
        command.x1,
        -command.y1,
        command.x2,
        -command.y2,
        command.x,
        -command.y
      )
    } else if (command.type === 'Q') {
      shapePath.quadraticCurveTo(
        command.x1,
        -command.y1,
        command.x,
        -command.y
      )
    } else {
      shapePath.currentPath?.closePath()
    }
  })

  return new THREE.ExtrudeGeometry(shapePath.toShapes(false), sceneConfig.reveal.geometry)
}
