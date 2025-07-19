<script setup>
    import TimeSlot from './TimeSlot.vue'
import { useCourseStore } from '../store/courseStore.js'
import { computed } from 'vue'

const store = useCourseStore()
const selectedCourses = computed(() => store.selectedCourses)

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
]

const getGridPlacement = (course) => {
  // Normalize day to match grid
  const normalizedDay = course.day?.slice(0, 3).charAt(0).toUpperCase() + course.day?.slice(1, 2).toLowerCase()
  const column = days.indexOf(normalizedDay)

  if (column === -1 || course.startHour == null || course.duration == null) {
    return { display: 'none' }
  }

  const topOffset = 40
  const rowHeight = 60
  const gridLeftOffset = 80

  const top = topOffset + (course.startHour - 8) * rowHeight
  const height = course.duration * rowHeight
  const widthPerDay = `calc((100% - ${gridLeftOffset}px) / 7)`
  const left = `calc(${gridLeftOffset}px + ${column} * (${widthPerDay}))`

  return {
    position: 'absolute',
    top: `${top}px`,
    left,
    width: widthPerDay,
    height: `${height}px`,
    zIndex: 10,
    boxSizing: 'border-box'
  }
}
</script>

<template>
    <section class="section" id="weekly-calendar">
        <h2>Weekly Schedule</h2>
        <pre style="font-size: 12px; color: gray;">{{ selectedCourses }}</pre>
        <div class="calendar-container">
            <div class="calendar-grid">
                <div class="header-cell empty" />
                    <div v-for="day in days" :key="day" class="header-cell">{{ day }}</div>

                    <template v-for="hour in hours" :key="hour">
                        <div class="time-label">{{ hour }}</div>
                        <div v-for="day in days" :key="day + hour" class="grid-cell" />
                    </template>
                        </div>

                        <div
                                v-for="(course, index) in selectedCourses"
                                :key="index"
                                :style="getGridPlacement(course)"
                                class="absolute-course"
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
    grid-template-columns: 80px repeat(7, 1fr);
    grid-template-rows: 40px repeat(15, 60px);
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
    background-color: #cce5ff;
    border-left: 4px solid #004085;
    padding: 4px;
    box-sizing: border-box;
    overflow: hidden;
    font-size: 0.8rem;
    color: #004085;
    border-radius: 4px;
}
</style>
