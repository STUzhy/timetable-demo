// src/store/courseStore.js
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCourseStore = defineStore('course', () => {
    // ✅ Use `ref` for array reactivity
    const selectedCourses = ref([])
    const savedCourses = ref([])
    const courseWeights = ref({}) // Store course weights (100-point distribution)

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
            // Check credit limit (6 courses max: 5 primary + 1 backup)
            if (selectedCourses.value.length >= 6) {
                alert('Maximum 6 courses allowed (5 primary + 1 backup). Please remove a course first.')
                return
            }
            selectedCourses.value.push(course)
        }
    }

    // Weight management functions
    const saveWeights = (weights) => {
        try {
            courseWeights.value = { ...weights }
            localStorage.setItem('courseWeights', JSON.stringify(weights))
            return true
        } catch (error) {
            console.error('Failed to save weights:', error)
            return false
        }
    }

    const loadWeights = () => {
        try {
            const saved = localStorage.getItem('courseWeights')
            if (saved) {
                courseWeights.value = JSON.parse(saved)
            }
        } catch (error) {
            console.error('Failed to load weights:', error)
        }
    }

    const getWeight = (courseCode) => {
        return courseWeights.value[courseCode] || 0
    }

    const getTotalWeight = computed(() => {
        return Object.values(courseWeights.value).reduce((sum, weight) => sum + (weight || 0), 0)
    })

    const isValidWeightDistribution = computed(() => {
        return getTotalWeight.value === 100 && selectedCourses.value.length > 0
    })

    const selectedCount = computed(() => selectedCourses.value.length)
    const savedCount = computed(() => savedCourses.value.length)

    // 初始化时加载已保存的课程和权重
    loadSavedCourses()
    loadWeights()

    return {
        selectedCourses,
        savedCourses,
        courseWeights,
        toggleCourse,
        isSelected,
        hasConflict,
        selectedCount,
        savedCount,
        saveCourses,
        loadSavedCourses,
        isSaved,
        // Weight management
        saveWeights,
        loadWeights,
        getWeight,
        getTotalWeight,
        isValidWeightDistribution
    }
})
