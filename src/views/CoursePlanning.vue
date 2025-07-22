<template>
    <div class="course-planning">
        <AppHeader />
        
        <div class="planning-content">
            <h1>Course Pre-Enrollment Planning</h1>
            <p>Select courses from the calendar below and assign priority weights to indicate your preferences for the upcoming semester.</p>

            <!-- View-Only Mode Warning -->
            <div v-if="isViewOnly" class="view-only-warning">
                <div class="warning-content">
                    <span class="warning-icon">🔒</span>
                    <div class="warning-text">
                        <strong>View-Only Mode</strong>
                        <p>Your course selections have been saved and are now locked. You cannot make changes until the next enrollment period.</p>
                    </div>
                </div>
            </div>

            <!-- Weekly Calendar - Most Important Function, Moved to Top -->
            <WeeklyCalendar :show-all-courses="showAllCourses" />
            
            <!-- Credit Limit Warning - MUST HAVE MoSCoW Requirement -->
            <CreditLimitWarning />
            
            <!-- Course Weight Assignment - MUST HAVE MoSCoW Requirement -->
            <CourseWeightAssignment />
            
            <!-- Course Selection Options -->
            <div class="course-options">
                <h2>Course Selection Options</h2>
                <div class="options-content">
                    <button 
                        @click="toggleAllCourses" 
                        class="toggle-courses-btn"
                        :class="{ 'active': showAllCourses }"
                    >
                        {{ showAllCourses ? 'Show My Major Courses Only' : 'Include All School Courses' }}
                    </button>
                    <p class="option-description">
                        {{ showAllCourses 
                            ? 'Currently showing all courses from the university. Click to show only your major courses.' 
                            : 'Currently showing only courses from your major. Click to include courses from other departments.'
                        }}
                    </p>
                    <div class="scroll-hint">
                        💡 <strong>Tip:</strong> You can scroll horizontally in the timetable to see all days of the week.
                    </div>
                </div>
            </div>
            
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
                    {{ store.isSaved ? 'Saved' : 'Save Pre-Enrollment Selection' }}
                </button>
                
                <button 
                    @click="goToProfile" 
                    class="profile-btn"
                >
                    View My Profile
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import CreditLimitWarning from '../components/CreditLimitWarning.vue'
import CourseWeightAssignment from '../components/CourseWeightAssignment.vue'
import WeeklyCalendar from '../components/WeeklyCalendar.vue'
import { useCourseStore } from '../store/courseStore.js'
import { useRouter } from 'vue-router'

const store = useCourseStore()
const router = useRouter()
const showAllCourses = ref(false)
const isViewOnly = ref(false)

const toggleAllCourses = () => {
    showAllCourses.value = !showAllCourses.value
}

const handleSave = () => {
    // Show warning dialog
    const confirmSave = confirm(
        'Warning: Once you save your pre-enrollment selections, this page will become view-only. You will not be able to make changes until the next enrollment period. \n\nAre you sure you want to continue?'
    )
    
    if (confirmSave) {
        if (store.saveCourses()) {
            // Update isViewOnly state and store it
            isViewOnly.value = true
            localStorage.setItem('courseSelectionLocked', 'true')
            alert('Pre-enrollment selection saved successfully! The page is now in view-only mode.')
            // Navigate to profile to show the saved selections
            router.push('/profile')
        } else {
            alert('Failed to save. Please try again.')
        }
    }
}

const goToProfile = () => {
    router.push('/profile')
}

// Check if the course selection is locked (view-only mode)
const checkViewOnlyMode = () => {
    const locked = localStorage.getItem('courseSelectionLocked')
    isViewOnly.value = locked === 'true'
}

// Initialize view-only mode check
checkViewOnlyMode()
</script>

<style scoped>
.course-planning {
    background: var(--nord5);
    color: var(--nord1);
    min-height: 100vh;
    width: 100%;
}

.planning-content {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.course-planning h1 {
    color: var(--nord1);
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
}

.course-planning p {
    text-align: center;
    color: var(--nord2);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
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
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.home-btn {
    background-color: var(--nord8);
    color: white;
}

.home-btn:hover {
    background-color: var(--nord7);
    transform: translateY(-2px);
}

.save-btn {
    background-color: var(--nord10);
    color: white;
}

.save-btn:hover:not(:disabled) {
    background-color: var(--nord9);
    transform: translateY(-2px);
}

.save-btn:disabled {
    background-color: var(--nord4);
    color: var(--nord3);
    cursor: not-allowed;
}

.save-btn.saved {
    background-color: var(--nord14);
    opacity: 0.8;
}

.profile-btn {
    background-color: var(--nord12);
    color: white;
}

.profile-btn:hover {
    background-color: var(--nord11);
    transform: translateY(-2px);
}

.course-options {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--nord4);
}

.course-options h2 {
    color: var(--nord1);
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
    border-bottom: 2px solid var(--nord4);
    padding-bottom: 0.5rem;
}

.options-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.toggle-courses-btn {
    align-self: flex-start;
    padding: 0.75rem 1.5rem;
    background: var(--nord4);
    color: var(--nord1);
    border: 2px solid var(--nord4);
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.toggle-courses-btn:hover {
    background: var(--nord10);
    border-color: var(--nord10);
    color: white;
    transform: translateY(-2px);
}

.toggle-courses-btn.active {
    background: var(--nord14);
    border-color: var(--nord14);
    color: white;
}

.toggle-courses-btn.active:hover {
    background: var(--nord15);
    border-color: var(--nord15);
}

.option-description {
    color: var(--nord2);
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
}

.scroll-hint {
    background: var(--nord6);
    border: 1px solid var(--nord4);
    border-radius: 8px;
    padding: 0.75rem;
    color: var(--nord1);
    font-size: 0.9rem;
    border-left: 4px solid var(--nord12);
}

.view-only-warning {
    background: var(--nord12);
    border: 1px solid var(--nord11);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 2rem;
    color: white;
}

.warning-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.warning-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.warning-text strong {
    display: block;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
}

.warning-text p {
    margin: 0;
    opacity: 0.9;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .planning-content {
        padding: 1rem;
    }
    
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .home-btn, .save-btn, .profile-btn {
        width: 100%;
        max-width: 300px;
    }
    
    .toggle-courses-btn {
        align-self: stretch;
    }
}
</style>
