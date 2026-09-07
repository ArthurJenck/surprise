<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ExperienceConfig } from '../config/experience'
import type { ExperienceController } from '../experience/createExperience'
import type { ExperienceState } from '../features/experience/domain/contracts'

const props = defineProps<{
  config: ExperienceConfig
}>()

const emit = defineEmits<{
  ready: []
  'state-change': [state: ExperienceState]
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let controller: ExperienceController | undefined
let cancelled = false

onMounted(async () => {
  const element = canvas.value

  if (!element) {
    emit('state-change', 'fallback')
    return
  }

  try {
    const { createExperience } = await import('../experience/createExperience')

    if (cancelled) {
      return
    }

    controller = await createExperience(
      element,
      {
        onReady: () => emit('ready'),
        onStateChange: (state) => emit('state-change', state),
        onFallback: () => emit('state-change', 'fallback'),
      },
      props.config
    )
  } catch {
    emit('state-change', 'fallback')
  }
})

onBeforeUnmount(() => {
  cancelled = true
  controller?.destroy()
})
</script>

<template>
  <canvas
    ref="canvas"
    class="experience-canvas"
    tabindex="0"
    role="button"
    aria-label="Cadeau interactif. Faites-le tourner ou appuyez pour l’ouvrir."
  />
</template>
