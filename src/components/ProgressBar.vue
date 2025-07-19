<template>
    <section class="section" id="progress-section">
        <h2>Course Selection Progress</h2>
        <div class="progress-bar">
            <div class="fill" :style="{ width: percentage + '%' }">
                {{ percentage }}%
            </div>
        </div>
    </section>
</template>

<script setup>
    import { computed } from 'vue';
import { useCourseStore } from '../store/courseStore.js';
import { requiredCourses, electiveCourses } from '../data/courses.js';

const store = useCourseStore();
const total = requiredCourses.length + electiveCourses.length;

const percentage = computed(() =>
  Math.floor((store.selectedCourses.size / total) * 100)
);
</script>

<style scoped>
.section {
    margin-top: 2rem;
}
.progress-bar {
    width: 100%;
    height: 24px;
    border: 1px solid #333;
    position: relative;
}
.fill {
    height: 100%;
    background-color: #4caf50;
    color: white;
    text-align: center;
    line-height: 24px;
    transition: width 0.3s;
}
</style>
