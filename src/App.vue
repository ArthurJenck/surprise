<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { experienceConfig } from './config/experience'
import ExperienceCanvas from './components/ExperienceCanvas.vue'
import RevealOverlay from './components/RevealOverlay.vue'
import type { ExperienceState } from './features/experience/domain/contracts'

const state = ref<ExperienceState>('idle')

function handleReady() {
    document.documentElement.classList.add('experience-ready')
}

function handleStateChange(nextState: ExperienceState) {
    state.value = nextState

    if (nextState === 'fallback') {
        document.documentElement.classList.remove('experience-ready')
    }
}

onBeforeUnmount(() => {
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
            @state-change="handleStateChange"
        />
        <RevealOverlay
            :signature="experienceConfig.content.overlay.signature"
            :links="experienceConfig.content.overlay.links"
            :visible="state === 'revealed'"
        />
    </main>
</template>
