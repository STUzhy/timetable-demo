// src/store/courseStore.js
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCourseStore = defineStore('course', () => {
    // ✅ Use `ref` for array reactivity
    const selectedCourses = ref([])

    const isSelected = (code) => {
        return selectedCourses.value.some(c => c.code === code)
    }

    const hasConflict = (newCourse) => {
        return selectedCourses.value.some(course => {
            return course.day === newCourse.day &&
                course.startHour < newCourse.startHour + newCourse.duration &&
                newCourse.startHour < course.startHour + course.duration
        })
    }

    const toggleCourse = (course) => {
        if (isSelected(course.code)) {
            selectedCourses.value = selectedCourses.value.filter(c => c.code !== course.code)
        } else {
            if (selectedCourses.value.length >= 10) {
                alert('You can only select up to 10 courses.')
                return
            }
            selectedCourses.value.push(course)
        }
    }

    const selectedCount = computed(() => selectedCourses.value.length)

    return {
        selectedCourses, // ✅ Not nested
        toggleCourse,
        isSelected,
        hasConflict,
        selectedCount
    }
})
