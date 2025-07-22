<script setup>
    import { useCourseStore } from '../store/courseStore.js';
import { requiredCourses } from '../data/courses.js';

const store = useCourseStore();
</script>

<template>
    <section class="section" id="required-courses">
        <h2>Required Courses</h2>
        <div class="course-list">
            <div
                    v-for="course in requiredCourses"
                    :key="course.code"
                    class="course"
                    :class="{ selected: store.isSelected(course.code) }"
                    @click="store.toggleCourse(course)"
                    >
                    {{ course.code }} - {{ course.name }}
            </div>
        </div>
    </section>
</template>

<style scoped>
.section {
    margin-bottom: 2rem;
}
.course-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.course {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f4f4f4;
    cursor: pointer;
}
.course.selected {
    background-color: #cce5ff;
}
</style>
