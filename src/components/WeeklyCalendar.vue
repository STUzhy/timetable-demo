<script setup>
    import TimeSlot from './TimeSlot.vue';
import { requiredCourses, electiveCourses } from '../data/courses.js';
import { useCourseStore } from '../store/courseStore.js';
import { computed } from 'vue';

const store = useCourseStore();
const allCourses = [...requiredCourses, ...electiveCourses];

const selectedCourses = computed(() =>
  allCourses.filter(course => store.isSelected(course.code))
);

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

const getGridPlacement = (course) => {
  const column = days.indexOf(course.day);
  const topOffset = 40;         // Header height
  const rowHeight = 60;         // Each hour height
  const gridLeftOffset = 80;    // Time column width

  const top = topOffset + (course.startHour - 8) * rowHeight;
  const height = course.duration * rowHeight;

  const widthPerDay = `calc((100% - ${gridLeftOffset}px) / 7)`;
  const left = `calc(${gridLeftOffset}px + ${column} * (${widthPerDay}))`;

  return {
    position: 'absolute',
    top: `${top}px`,
    left,
    width: widthPerDay,
    height: `${height}px`,
    padding: '2px',
    boxSizing: 'border-box',
    zIndex: 10,
  };
};
</script>

<template>
    <section class="section" id="weekly-calendar">
        <h2>Weekly Schedule</h2>
        <div class="calendar-container">
            <div class="calendar-grid">
                <div class="header-cell empty" />
                    <div v-for="day in days" :key="day" class="header-cell">{{ day }}</div>

                    <template v-for="hour in hours" :key="hour">
                        <div class="time-label">{{ hour }}</div>
                        <div v-for="day in days" :key="day + hour" class="grid-cell" />
                    </template>
                        </div>

                        <!-- Render absolute positioned TimeSlot components -->
                        <div
                                v-for="(course, index) in selectedCourses"
                                :key="index"
                                class="absolute-course"
                                :style="getGridPlacement(course)"
                                >
                                <TimeSlot :course="course" />
                        </div>
                </div>
    </section>
</template>

<style scoped>
.section {
    margin-top: 2rem;
}

.calendar-container {
    position: relative;
}

.calendar-grid {
    display: grid;
    grid-template-columns: 80px repeat(7, 1fr);   /* Time + days */
    grid-template-rows: 40px repeat(15, 60px);    /* 40px for header + 15 rows of 60px */
    position: relative;
    width: 100%;
    box-sizing: border-box;
}

.header-cell {
    background-color: #f0f0f0;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
    box-sizing: border-box;
}

.header-cell.empty {
    background-color: #fff;
    border: none;
}

.time-label {
    background-color: #f9f9f9;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
    font-size: 0.9rem;
    box-sizing: border-box;
}

.grid-cell {
    border: 1px solid #ddd;
    box-sizing: border-box;
}

.absolute-course {
    position: absolute;
    padding: 2px;
    box-sizing: border-box;
}
</style>
