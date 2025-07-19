<template>
    <div class="course-planning">
        <h1>Course Planning</h1>
        <p>This is where you can select required and elective courses.</p>

        <RequiredCourses />
        <ElectiveCourses />
        <ProgressBar />
        <WeeklyCalendar />
    </div>
</template>

<script setup>
    import RequiredCourses from '../components/RequiredCourses.vue'
import ElectiveCourses from '../components/ElectiveCourses.vue'
import ProgressBar from '../components/ProgressBar.vue'
import WeeklyCalendar from '../components/WeeklyCalendar.vue'
</script>

<style scoped>
.course-planning {
    padding: 2rem;
    background-color: var(--nord6);
    color: var(--nord0);
}

.course-planning h1 {
    color: var(--nord11); /* Red accent */
    font-size: 2rem;
    margin-bottom: 1rem;
}
</style>
