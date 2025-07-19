<template>
    <div class="progress-container">
        <div class="progress-bar">
            <div
                    class="progress-fill"
                    :style="{ width: progress + '%' }"
                    ></div>
        </div>
        <p>{{ count }} / 10 Courses Selected</p>
    </div>
</template>

<script setup>
    import { useCourseStore } from '../store/courseStore.js'
import { computed } from 'vue'

const store = useCourseStore()
const count = computed(() => store.selectedCount)
const progress = computed(() => (count.value / 10) * 100)
</script>

<style scoped>
.progress-container {
    margin-top: 1rem;
    width: 100%;
}
.progress-bar {
    height: 20px;
    background-color: var(--nord4);
    border-radius: 10px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    background-color: var(--nord10); /* Blue fill */
    transition: width 0.3s ease;
}
</style>
