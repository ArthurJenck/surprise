<script setup lang="ts">
import { computed } from 'vue'
import type { LocalizedContent } from '../config/experience'
import { resolveModelLoadPercent } from '../features/experience/domain/loading'
import type { ModelLoadProgress } from '../features/experience/domain/contracts'

const props = defineProps<{
    content: LocalizedContent
    failed: boolean
    progress?: ModelLoadProgress
    slow: boolean
}>()

const percent = computed(() => resolveModelLoadPercent(props.progress))

const message = computed(() => {
    if (props.failed) {
        return props.content.loading.failureMessage
    }

    return props.content.loading.message
})

function reloadExperience() {
    window.location.reload()
}
</script>

<template>
    <section
        class="loading-overlay"
        :class="{ 'loading-overlay--failed': failed }"
        :aria-busy="!failed"
        aria-live="polite"
    >
        <div class="loading-overlay__content">
            <h1 class="loading-overlay__message">{{ message }}</h1>

            <template v-if="failed">
                <p class="loading-overlay__detail">
                    {{ content.loading.failureDetail }}
                </p>
                <button
                    class="loading-overlay__retry"
                    type="button"
                    @click="reloadExperience"
                >
                    {{ content.loading.retryLabel }}
                </button>
            </template>

            <template v-else>
                <div
                    class="loading-overlay__meter"
                    :class="{
                        'loading-overlay__meter--indeterminate':
                            percent === undefined,
                    }"
                    role="progressbar"
                    :aria-label="message"
                    :aria-valuemax="percent === undefined ? undefined : 100"
                    :aria-valuemin="percent === undefined ? undefined : 0"
                    :aria-valuenow="percent"
                >
                    <span
                        class="loading-overlay__meter-fill"
                        :style="{
                            transform:
                                percent === undefined
                                    ? undefined
                                    : `scaleX(${percent / 100})`,
                        }"
                    />
                </div>
                <p
                    v-if="percent !== undefined"
                    class="loading-overlay__percent"
                >
                    {{ percent }} %
                </p>
                <button
                    v-if="slow"
                    class="loading-overlay__retry"
                    type="button"
                    @click="reloadExperience"
                >
                    {{ content.loading.reloadLabel }}
                </button>
            </template>
        </div>
    </section>
</template>
