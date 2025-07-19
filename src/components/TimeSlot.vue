<template>
    <div class="time-slot">
        <strong>{{ course.code }}</strong><br />
        {{ course.name }}<br />
        {{ course.professor }}<br />
        {{ course.location }}
    </div>
</template>

<script setup>
    defineProps({
  course: Object
});
</script>

<style scoped>
.time-slot {
    background-color: #90ee90;
    border: 1px solid #333;
    border-radius: 4px;
    font-size: 0.75rem;
    text-align: center;
    word-break: break-word;
    white-space: normal;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>
