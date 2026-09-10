<script setup lang="ts">
import type {
    LanguageOption,
    Locale,
    LocalizedContent,
} from '../config/experience'
import UnderlinedAction from './UnderlinedAction.vue'

defineProps<{
    content: LocalizedContent
    locale: Locale
    languageOptions: readonly LanguageOption[]
    visible: boolean
}>()

const emit = defineEmits<{
    'locale-change': [locale: Locale]
}>()
</script>

<template>
    <section
        v-if="visible"
        class="reveal-overlay reveal-overlay--visible"
        aria-live="polite"
    >
        <p class="reveal-signature">{{ content.overlay.signature }}</p>
        <p class="reveal-availability">{{ content.overlay.availability }}</p>
        <p class="reveal-contact">
            {{ content.overlay.contact.label }} :
            <UnderlinedAction
                class="reveal-contact-link"
                :href="`mailto:${content.overlay.contact.email}`"
            >
                {{ content.overlay.contact.email }}
            </UnderlinedAction>
        </p>
        <nav
            class="reveal-links"
            :aria-label="content.overlay.professionalLinksLabel"
        >
            <span
                v-for="(link, index) in content.overlay.links"
                :key="link.href"
                class="reveal-link-item"
                :style="{ '--link-index': index }"
            >
                <UnderlinedAction
                    class="reveal-link"
                    :href="link.href"
                    external
                >
                    {{ link.label }}
                </UnderlinedAction>
            </span>
        </nav>
        <nav
            class="reveal-language-switcher"
            :aria-label="content.accessibility.languageSwitcherLabel"
        >
            <span
                v-for="(option, index) in languageOptions"
                :key="option.locale"
                class="reveal-language-choice"
                :style="{ '--language-index': index }"
            >
                <span
                    v-if="index > 0"
                    class="reveal-language-separator"
                    aria-hidden="true"
                >
                    /
                </span>
                <UnderlinedAction
                    class="reveal-language-action"
                    :ariaPressed="locale === option.locale ? 'true' : 'false'"
                    @activate="emit('locale-change', option.locale)"
                >
                    {{ option.compactLabel }}
                </UnderlinedAction>
            </span>
        </nav>
    </section>
</template>
