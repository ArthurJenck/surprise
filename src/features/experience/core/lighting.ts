import * as THREE from 'three'
import type { SceneConfig, ThemeConfig } from '../../../config/experience/types'

export function createSceneLights(
  scene: THREE.Scene,
  sceneConfig: SceneConfig,
  themeConfig: ThemeConfig
) {
  const hemisphere = new THREE.HemisphereLight(
    themeConfig.scene.hemisphereSky,
    themeConfig.scene.hemisphereGround,
    sceneConfig.lighting.hemisphereIntensity
  )
  const key = new THREE.DirectionalLight(themeConfig.scene.keyLight, sceneConfig.lighting.key.intensity)
  const redRim = new THREE.PointLight(
    themeConfig.scene.redRimLight,
    sceneConfig.lighting.redRim.intensity,
    sceneConfig.lighting.redRim.distance,
    sceneConfig.lighting.redRim.decay
  )
  const violetFill = new THREE.PointLight(
    themeConfig.scene.violetFillLight,
    sceneConfig.lighting.violetFill.intensity,
    sceneConfig.lighting.violetFill.distance,
    sceneConfig.lighting.violetFill.decay
  )

  key.position.fromArray(sceneConfig.lighting.key.position)
  redRim.position.fromArray(sceneConfig.lighting.redRim.position)
  violetFill.position.fromArray(sceneConfig.lighting.violetFill.position)
  scene.add(hemisphere, key, redRim, violetFill)
}
