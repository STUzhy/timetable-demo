// src/store/courseStore.js
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCourseStore = defineStore('course', () => {
    // ✅ Use `ref` for array reactivity
    const selectedCourses = ref([])
    const savedCourses = ref([])

    // 加载已保存的课程
    const loadSavedCourses = () => {
        try {
            const saved = localStorage.getItem('savedCourses')
            if (saved) {
                savedCourses.value = JSON.parse(saved)
            }
        } catch (error) {
            console.error('Failed to load saved courses:', error)
        }
    }

    // 保存当前选中的课程
    const saveCourses = () => {
        try {
            const coursesToSave = selectedCourses.value.map(course => ({
                ...course,
                savedAt: new Date().toISOString()
            }))
            localStorage.setItem('savedCourses', JSON.stringify(coursesToSave))
            savedCourses.value = [...coursesToSave]
            return true
        } catch (error) {
            console.error('Failed to save courses:', error)
            return false
        }
    }

    // 检查当前选择是否已保存
    const isSaved = computed(() => {
        if (selectedCourses.value.length === 0 && savedCourses.value.length === 0) return true
        if (selectedCourses.value.length !== savedCourses.value.length) return false
        
        const selectedCodes = selectedCourses.value.map(c => c.code).sort()
        const savedCodes = savedCourses.value.map(c => c.code).sort()
        return JSON.stringify(selectedCodes) === JSON.stringify(savedCodes)
    })

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
    const savedCount = computed(() => savedCourses.value.length)

    // 初始化时加载已保存的课程
    loadSavedCourses()

    return {
        selectedCourses,
        savedCourses,
        toggleCourse,
        isSelected,
        hasConflict,
        selectedCount,
        savedCount,
        saveCourses,
        loadSavedCourses,
        isSaved
    }
})
