<script setup lang="ts">
import type { ProfessionalLink } from '../config/experience'

defineProps<{
    signature: string
    availability: string
    contact: {
        label: string
        email: string
    }
    links: readonly ProfessionalLink[]
    visible: boolean
}>()
</script>

<template>
    <section
        v-if="visible"
        class="reveal-overlay reveal-overlay--visible"
        aria-live="polite"
    >
        <p class="reveal-signature">{{ signature }}</p>
        <p class="reveal-availability">{{ availability }}</p>
        <p class="reveal-contact">
            {{ contact.label }} :
            <a class="reveal-contact-link" :href="`mailto:${contact.email}`">
                {{ contact.email }}
            </a>
        </p>
        <nav class="reveal-links" aria-label="Liens professionnels">
            <span
                v-for="(link, index) in links"
                :key="link.href"
                class="reveal-link-item"
                :style="{ '--link-index': index }"
            >
                <a
                    class="reveal-link"
                    :href="link.href"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {{ link.label }}
                </a>
            </span>
        </nav>
    </section>
</template>
