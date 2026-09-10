<script setup lang="ts">
import type { LanguageOption, Locale } from '../config/experience'
import UnderlinedAction from './UnderlinedAction.vue'

defineProps<{
    ariaLabel: string
    options: readonly LanguageOption[]
}>()

const emit = defineEmits<{
    select: [locale: Locale]
}>()
</script>

<template>
    <section class="loading-overlay language-selection-overlay">
        <nav
            class="language-selection-overlay__choices"
            :aria-label="ariaLabel"
        >
            <span
                v-for="(option, index) in options"
                :key="option.locale"
                class="language-selection-overlay__choice"
            >
                <span
                    v-if="index > 0"
                    class="language-selection-overlay__separator"
                    aria-hidden="true"
                >
                    /
                </span>
                <UnderlinedAction
                    class="language-selection-overlay__action"
                    @activate="emit('select', option.locale)"
                >
                    {{ option.label }}
                </UnderlinedAction>
            </span>
        </nav>
    </section>
</template>
