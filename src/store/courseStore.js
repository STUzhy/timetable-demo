// src/store/courseStore.js
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useUserStore } from './userStore.js'

export const useCourseStore = defineStore('course', () => {
    // ✅ Use `ref` for array reactivity
    const selectedCourses = ref([])
    const savedCourses = ref([])
    const courseWeights = ref({}) // Store course weights (100-point distribution)

    // Get user-specific storage key
    const getUserStorageKey = (key) => {
        const userStore = useUserStore()
        if (userStore.currentUser) {
            return `user_${userStore.currentUser.studentNumber}_${key}`
        }
        return key // Fallback for non-logged-in users
    }

    // 加载已保存的课程
    const loadSavedCourses = () => {
        try {
            const savedKey = getUserStorageKey('savedCourses')
            const saved = localStorage.getItem(savedKey)
            if (saved) {
                savedCourses.value = JSON.parse(saved)
            } else {
                savedCourses.value = []
            }
            // Also load weights when loading courses
            loadWeights()
        } catch (error) {
            console.error('Failed to load saved courses:', error)
            savedCourses.value = []
        }
    }

    // 保存当前选中的课程
    const saveCourses = () => {
        const userStore = useUserStore()
        if (!userStore.isLoggedIn) {
            alert('Please login first to save your course selections.')
            return false
        }
        
        try {
            const coursesToSave = selectedCourses.value.map(course => ({
                ...course,
                savedAt: new Date().toISOString(),
                weights: courseWeights.value
            }))
            
            const savedKey = getUserStorageKey('savedCourses')
            const weightsKey = getUserStorageKey('courseWeights')
            
            localStorage.setItem(savedKey, JSON.stringify(coursesToSave))
            localStorage.setItem(weightsKey, JSON.stringify(courseWeights.value))
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
        const userStore = useUserStore()
        if (!userStore.isLoggedIn) {
            alert('Please login first to select courses.')
            return
        }
        
        // Check if in view-only mode
        const lockedKey = getUserStorageKey('courseSelectionLocked')
        const isViewOnly = localStorage.getItem(lockedKey) === 'true'
        if (isViewOnly) {
            alert('Course selection is locked. You cannot modify your selections at this time.')
            return
        }
        
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
        
        // Auto-save selected courses
        saveSelectedCourses()
    }

    // Weight management functions
    const saveWeights = (weights) => {
        try {
            courseWeights.value = { ...weights }
            const weightsKey = getUserStorageKey('courseWeights')
            localStorage.setItem(weightsKey, JSON.stringify(weights))
            return true
        } catch (error) {
            console.error('Failed to save weights:', error)
            return false
        }
    }

    const loadWeights = () => {
        try {
            const weightsKey = getUserStorageKey('courseWeights')
            const saved = localStorage.getItem(weightsKey)
            if (saved) {
                courseWeights.value = JSON.parse(saved)
            } else {
                courseWeights.value = {}
            }
        } catch (error) {
            console.error('Failed to load weights:', error)
            courseWeights.value = {}
        }
    }
    
    // Load user's selected courses when user changes
    const loadUserCourses = () => {
        try {
            const selectedKey = getUserStorageKey('selectedCourses')
            const saved = localStorage.getItem(selectedKey)
            if (saved) {
                selectedCourses.value = JSON.parse(saved)
            } else {
                selectedCourses.value = []
            }
        } catch (error) {
            console.error('Failed to load selected courses:', error)
            selectedCourses.value = []
        }
    }
    
    // Save selected courses when they change
    const saveSelectedCourses = () => {
        try {
            const selectedKey = getUserStorageKey('selectedCourses')
            localStorage.setItem(selectedKey, JSON.stringify(selectedCourses.value))
        } catch (error) {
            console.error('Failed to save selected courses:', error)
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

    // Watch for user changes and reload data
    const userStore = useUserStore()
    watch(() => userStore.currentUser, (newUser, oldUser) => {
        if (newUser?.studentNumber !== oldUser?.studentNumber) {
            // User changed, reload their data
            selectedCourses.value = []
            savedCourses.value = []
            courseWeights.value = {}
            
            if (newUser) {
                loadUserCourses()
                loadSavedCourses()
                loadWeights()
            }
        }
    }, { immediate: false })
    
    // 初始化时加载已保存的课程和权重
    if (userStore.currentUser) {
        loadUserCourses()
        loadSavedCourses()
        loadWeights()
    }

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
        loadUserCourses,
        saveSelectedCourses,
        isSaved,
        // Weight management
        saveWeights,
        loadWeights,
        getWeight,
        getTotalWeight,
        isValidWeightDistribution,
        // Helper for user-specific storage keys
        getUserStorageKey
    }
})
