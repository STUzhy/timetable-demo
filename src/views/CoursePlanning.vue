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
    background-color: transparent; /* 让App.vue的渐变背景显示 */
    color: var(--nord0);
    min-height: 100vh;
    overflow-y: auto;
}

.course-planning h1 {
    color: white; /* 在渐变背景上使用白色 */
    font-size: 2rem;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3); /* 添加阴影提高可读性 */
}
</style>
