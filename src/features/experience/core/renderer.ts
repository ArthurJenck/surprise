import * as THREE from 'three'
import type { EffectsConfig, SceneConfig } from '../../../config/experience/types'

export function createRenderer(
  canvas: HTMLCanvasElement,
  sceneConfig: SceneConfig,
  effectsConfig: EffectsConfig,
  coarsePointer: boolean
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true,
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = sceneConfig.renderer.toneMappingExposure
  renderer.setClearColor(sceneConfig.renderer.clearColor, sceneConfig.renderer.clearAlpha)
  renderer.setPixelRatio(initialPixelRatio(effectsConfig, coarsePointer))
  return renderer
}

export function initialPixelRatio(effectsConfig: EffectsConfig, coarsePointer: boolean) {
  const maximumPixelRatio = coarsePointer
    ? effectsConfig.performance.coarsePointerMaxPixelRatio
    : effectsConfig.performance.finePointerMaxPixelRatio
  return Math.min(window.devicePixelRatio || 1, maximumPixelRatio)
}
