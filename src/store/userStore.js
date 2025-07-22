import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { allStudents } from '../data/studentInfo.js'

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(null)
    const isLoggedIn = computed(() => currentUser.value !== null)

    const login = (student) => {
        currentUser.value = { ...student }
        // Store in localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(student))
        return true
    }

    const logout = () => {
        currentUser.value = null
        localStorage.removeItem('currentUser')
        // Clear all user-specific data
        clearUserData()
    }

    const loadUserFromStorage = () => {
        try {
            const stored = localStorage.getItem('currentUser')
            if (stored) {
                const userData = JSON.parse(stored)
                // Verify user still exists in system
                const userExists = allStudents.find(s => 
                    s.studentNumber === userData.studentNumber && 
                    s.name === userData.name
                )
                if (userExists) {
                    currentUser.value = userData
                    return true
                } else {
                    // User no longer exists, clear storage
                    localStorage.removeItem('currentUser')
                }
            }
        } catch (error) {
            console.error('Failed to load user from storage:', error)
            localStorage.removeItem('currentUser')
        }
        return false
    }

    const clearUserData = () => {
        if (currentUser.value) {
            const userKey = `user_${currentUser.value.studentNumber}`
            localStorage.removeItem(`${userKey}_selectedCourses`)
            localStorage.removeItem(`${userKey}_savedCourses`)
            localStorage.removeItem(`${userKey}_courseWeights`)
            localStorage.removeItem(`${userKey}_courseSelectionLocked`)
        }
    }

    const clearAllUserData = () => {
        // Admin function to clear all user data
        const userKeys = Object.keys(localStorage).filter(key => key.startsWith('user_'))
        userKeys.forEach(key => localStorage.removeItem(key))
        
        // Also clear legacy data
        localStorage.removeItem('selectedCourses')
        localStorage.removeItem('savedCourses')
        localStorage.removeItem('courseWeights')
        localStorage.removeItem('courseSelectionLocked')
    }

    // Initialize user from storage
    loadUserFromStorage()

    return {
        currentUser,
        isLoggedIn,
        login,
        logout,
        loadUserFromStorage,
        clearUserData,
        clearAllUserData
    }
})
