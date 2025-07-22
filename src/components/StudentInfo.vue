<template>
    <section class="section" id="student-info">
        <h2>Student Information</h2>
        <p><strong>Name:</strong> {{ info.name }}</p>
        <p><strong>Student Number:</strong> {{ info.studentNumber }}</p>
        <p><strong>Year:</strong> {{ info.year }}</p>
        <p><strong>Major:</strong> {{ info.major }}</p>
    </section>
</template>

<script setup>
    import { studentInfo as info } from '../data/studentInfo.js';
</script>

<style scoped>
.section {
    margin-bottom: 2rem;
}
</style>
