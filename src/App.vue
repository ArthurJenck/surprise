<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { experienceConfig } from './config/experience'
import ExperienceCanvas from './components/ExperienceCanvas.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import RevealOverlay from './components/RevealOverlay.vue'
import type {
    ExperienceState,
    ModelLoadProgress,
} from './features/experience/domain/contracts'

const state = ref<ExperienceState>('idle')
const ready = ref(false)
const slowLoading = ref(false)
const modelProgress = ref<ModelLoadProgress>()
let slowLoadingTimer: number | undefined

function handleReady() {
    ready.value = true
    slowLoading.value = false
    window.clearTimeout(slowLoadingTimer)
    document.documentElement.classList.add('experience-ready')
}

function handleStateChange(nextState: ExperienceState) {
    state.value = nextState

    if (nextState === 'failed') {
        ready.value = false
        document.documentElement.classList.remove('experience-ready')
    }
}

function handleLoadProgress(progress: ModelLoadProgress) {
    modelProgress.value = progress
}

onMounted(() => {
    document.documentElement.classList.add('app-mounted')
    slowLoadingTimer = window.setTimeout(() => {
        if (!ready.value && state.value !== 'failed') {
            slowLoading.value = true
        }
    }, 20_000)
})

onBeforeUnmount(() => {
    window.clearTimeout(slowLoadingTimer)
    document.documentElement.classList.remove('app-mounted')
    document.documentElement.classList.remove('experience-ready')
})
</script>

<template>
    <main
        class="experience-shell"
        :data-state="state"
        :style="experienceConfig.theme.cssVariables"
    >
        <ExperienceCanvas
            :config="experienceConfig"
            @ready="handleReady"
            @load-progress="handleLoadProgress"
            @state-change="handleStateChange"
        />
        <LoadingOverlay
            v-if="!ready || state === 'failed'"
            :failed="state === 'failed'"
            :progress="modelProgress"
            :slow="slowLoading"
        />
        <RevealOverlay
            :signature="experienceConfig.content.overlay.signature"
            :links="experienceConfig.content.overlay.links"
            :visible="state === 'revealed'"
        />
    </main>
</template>
