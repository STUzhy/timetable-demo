<template>
    <div>
        <h1>Course Selection</h1>
        <RequiredCourses />
        <ElectiveCourses />
        <ProgressBar />
        <WeeklyCalendar />
    </div>
</template>

<script setup>
    import RequiredCourses from './components/RequiredCourses.vue';
    import ElectiveCourses from './components/ElectiveCourses.vue';
    import ProgressBar from './components/ProgressBar.vue';
    import WeeklyCalendar from './components/WeeklyCalendar.vue';
</script>

<style scoped>
#app {
  padding: 2rem;
}
</style>
