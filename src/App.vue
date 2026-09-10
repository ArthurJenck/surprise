<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { experienceConfig } from './config/experience'
import ExperienceCanvas from './components/ExperienceCanvas.vue'
import LanguageSelectionOverlay from './components/LanguageSelectionOverlay.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import RevealOverlay from './components/RevealOverlay.vue'
import type { Locale } from './config/experience'
import type {
    ExperienceState,
    ModelLoadProgress,
} from './features/experience/domain/contracts'
import {
    getBrowserLocaleStorage,
    persistLocale,
    readPersistedLocale,
} from './features/experience/domain/locale'

const state = ref<ExperienceState>('idle')
const ready = ref(false)
const slowLoading = ref(false)
const modelProgress = ref<ModelLoadProgress>()
const localeStorage = getBrowserLocaleStorage()
const selectedLocale = ref<Locale | undefined>(
    readPersistedLocale(localeStorage)
)
const activeLocale = computed<Locale>(() => selectedLocale.value ?? 'fr')
const content = computed(
    () => experienceConfig.content.locales[activeLocale.value]
)
const experienceCanvas = ref<{
    setLocale(locale: Locale): void
}>()
let slowLoadingTimer: number | undefined

function selectLocale(locale: Locale) {
    selectedLocale.value = locale
    persistLocale(locale, localeStorage)
    void nextTick(() => experienceCanvas.value?.setLocale(locale))
}

watch(
    activeLocale,
    (locale) => {
        const localizedContent = experienceConfig.content.locales[locale]
        document.documentElement.lang = locale
        document.title = localizedContent.document.title
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute('content', localizedContent.document.description)
    },
    { immediate: true }
)

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
        :lang="activeLocale"
    >
        <ExperienceCanvas
            ref="experienceCanvas"
            :config="experienceConfig"
            :locale="activeLocale"
            :content="content"
            @ready="handleReady"
            @load-progress="handleLoadProgress"
            @state-change="handleStateChange"
        />
        <LanguageSelectionOverlay
            v-if="!selectedLocale"
            :ariaLabel="experienceConfig.content.languageSelection.ariaLabel"
            :options="experienceConfig.content.languageSelection.options"
            @select="selectLocale"
        />
        <LoadingOverlay
            v-else-if="!ready || state === 'failed'"
            :content="content"
            :failed="state === 'failed'"
            :progress="modelProgress"
            :slow="slowLoading"
        />
        <RevealOverlay
            :content="content"
            :locale="activeLocale"
            :language-options="experienceConfig.content.languageSelection.options"
            :visible="state === 'revealed'"
            @locale-change="selectLocale"
        />
    </main>
</template>
