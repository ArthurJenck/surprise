<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ExperienceConfig } from '../config/experience'
import type { ExperienceController } from '../experience/createExperience'
import type {
    ExperienceState,
    ModelLoadProgress,
} from '../features/experience/domain/contracts'

const props = defineProps<{
    config: ExperienceConfig
}>()

const emit = defineEmits<{
    ready: []
    'load-progress': [progress: ModelLoadProgress]
    'state-change': [state: ExperienceState]
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let controller: ExperienceController | undefined
let cancelled = false

onMounted(async () => {
    const element = canvas.value

    if (!element) {
        emit('state-change', 'failed')
        return
    }

    try {
        const { createExperience } =
            await import('../experience/createExperience')

        if (cancelled) {
            return
        }

        controller = await createExperience(
            element,
            {
                onReady: () => emit('ready'),
                onLoadProgress: (progress) => emit('load-progress', progress),
                onStateChange: (state) => emit('state-change', state),
                onFailure: () => emit('state-change', 'failed'),
            },
            props.config
        )

        if (cancelled) {
            controller.destroy()
        }
    } catch {
        if (!cancelled) {
            emit('state-change', 'failed')
        }
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
        aria-label="Scène 3D de cadeau, appuyez pour l’ouvrir."
    />
</template>
