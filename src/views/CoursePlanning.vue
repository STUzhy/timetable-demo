<template>
    <div class="course-planning">
        <h1>Course Planning</h1>
        <p>This is where you can select required and elective courses.</p>

        <RequiredCourses />
        <ElectiveCourses />
        <ProgressBar />
        
        <div class="action-buttons">
            <router-link to="/" class="home-btn">
                Back to Home
            </router-link>
            
            <button 
                @click="handleSave" 
                :disabled="store.selectedCount === 0"
                class="save-btn"
                :class="{ 'saved': store.isSaved }"
            >
                {{ store.isSaved ? 'Saved' : 'Save Course Selection' }}
            </button>
            
            <button 
                @click="goToProfile" 
                class="profile-btn"
            >
                View My Profile
            </button>
        </div>
        
        <WeeklyCalendar />
    </div>
</template>

<script setup>
import RequiredCourses from '../components/RequiredCourses.vue'
import ElectiveCourses from '../components/ElectiveCourses.vue'
import ProgressBar from '../components/ProgressBar.vue'
import WeeklyCalendar from '../components/WeeklyCalendar.vue'
import { useCourseStore } from '../store/courseStore.js'
import { useRouter } from 'vue-router'

const store = useCourseStore()
const router = useRouter()

const handleSave = () => {
    if (store.saveCourses()) {
        alert('Course selection saved successfully!')
    } else {
        alert('Failed to save. Please try again.')
    }
}

const goToProfile = () => {
    router.push('/profile')
}
</script>

<style scoped>
.course-planning {
    padding: 2rem 2rem 2rem 2rem;
    background-color: transparent; /* 让App.vue的渐变背景显示 */
    color: var(--nord0);
    min-height: 100vh;
    overflow-y: auto;
}

.course-planning h1 {
    color: white; /* 在渐变背景上使用白色 */
    font-size: 2rem;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3); /* 添加阴影提高可读性 */
}

.action-buttons {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
    justify-content: center;
    flex-wrap: wrap;
}

.home-btn, .save-btn, .profile-btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-shadow: none;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.home-btn {
    background-color: #28a745;
    color: white;
}

.home-btn:hover {
    background-color: #218838;
    transform: translateY(-2px);
}

.save-btn {
    background-color: #4CAF50;
    color: white;
}

.save-btn:hover:not(:disabled) {
    background-color: #45a049;
    transform: translateY(-2px);
}

.save-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.save-btn.saved {
    background-color: #28a745;
    opacity: 0.8;
}

.profile-btn {
    background-color: #2196F3;
    color: white;
}

.profile-btn:hover {
    background-color: #1976D2;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .home-btn, .save-btn, .profile-btn {
        width: 100%;
        max-width: 300px;
    }
}
</style>
