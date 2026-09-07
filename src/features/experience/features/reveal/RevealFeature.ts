import * as THREE from 'three'
import * as opentype from 'opentype.js'
import type {
  ContentConfig,
  MotionConfig,
  SceneConfig,
  ThemeConfig,
} from '../../../../config/experience/types'
import { easeOutBack, easeOutCubic } from '../../domain/timeline'
import type { ExperienceFeature } from '../../domain/contracts'

export class RevealFeature implements ExperienceFeature {
  readonly root = new THREE.Group()

  private readonly content = new THREE.Group()
  private readonly config: SceneConfig
  private readonly motionConfig: MotionConfig

  private constructor(
    scene: THREE.Scene,
    config: SceneConfig,
    motionConfig: MotionConfig,
    content: THREE.Group
  ) {
    this.config = config
    this.motionConfig = motionConfig
    this.content = content
    this.root.add(content)
    this.root.visible = false
    scene.add(this.root)
  }

  static async create(
    scene: THREE.Scene,
    contentConfig: ContentConfig,
    sceneConfig: SceneConfig,
    themeConfig: ThemeConfig,
    motionConfig: MotionConfig
  ) {
    const content = await createTextContent(contentConfig, sceneConfig, themeConfig)
    return new RevealFeature(scene, sceneConfig, motionConfig, content)
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
    this.content.scale.setScalar(
      responsiveScale * Math.max(this.config.reveal.minimumVisibleScale, progress)
    )
    this.content.rotation.x = THREE.MathUtils.lerp(
      parallax.textStartRotationX,
      0,
      easeOutCubic(progress)
    )
    this.content.rotation.y = THREE.MathUtils.lerp(
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
    this.content.rotation.set(0, 0, 0)
    this.content.scale.setScalar(responsiveScale)
  }

  setResponsiveScale(responsiveScale: number) {
    this.content.scale.setScalar(responsiveScale)
  }

  dispose() {
    this.root.removeFromParent()
  }
}

async function createTextContent(
  contentConfig: ContentConfig,
  sceneConfig: SceneConfig,
  themeConfig: ThemeConfig
) {
  const response = await fetch(sceneConfig.reveal.fontUrl)

  if (!response.ok) {
    throw new Error('Impossible de charger la police 3D locale.')
  }

  const font = opentype.parse(await response.arrayBuffer())
  const content = new THREE.Group()
  const textLines = new THREE.Group()
  const frontMaterial = new THREE.MeshPhysicalMaterial({
    color: themeConfig.scene.revealFront,
    roughness: sceneConfig.reveal.materials.frontRoughness,
    metalness: sceneConfig.reveal.materials.frontMetalness,
    clearcoat: sceneConfig.reveal.materials.frontClearcoat,
    clearcoatRoughness: sceneConfig.reveal.materials.frontClearcoatRoughness,
  })
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: themeConfig.scene.revealSide,
    roughness: sceneConfig.reveal.materials.sideRoughness,
    metalness: sceneConfig.reveal.materials.sideMetalness,
  })
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
    const mesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial])
    mesh.position.y =
      sceneConfig.reveal.linePositionsY[lineIndex] +
      (1 - height) * sceneConfig.reveal.lineHeightAdjustment
    textLines.add(mesh)
  })

  textLines.scale.setScalar(
    maximumWidth > 0 ? sceneConfig.reveal.maximumWidth / maximumWidth : 1
  )
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
