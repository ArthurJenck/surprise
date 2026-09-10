<script setup lang="ts">
const props = defineProps<{
    href?: string
    external?: boolean
    ariaPressed?: 'true' | 'false'
}>()

const emit = defineEmits<{
    activate: []
}>()
</script>

<template>
    <component
        :is="props.href ? 'a' : 'button'"
        class="underlined-action"
        :class="{ 'underlined-action--pressed': props.ariaPressed === 'true' }"
        :href="props.href"
        :target="props.external ? '_blank' : undefined"
        :rel="props.external ? 'noopener noreferrer' : undefined"
        :type="props.href ? undefined : 'button'"
        :aria-pressed="props.href ? undefined : props.ariaPressed"
        @click="emit('activate')"
    >
        <slot />
    </component>
</template>
