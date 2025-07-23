<template>
    <div class="course-planning">
        <AppHeader />
        
        <div class="planning-content">
            <h1>Course Pre-Enrollment Planning</h1>
            <p>Select courses from the calendar below and assign priority weights to indicate your preferences for the upcoming semester.</p>

            <!-- Login Warning -->
            <div v-if="!userStore.isLoggedIn" class="login-warning">
                <div class="warning-content">
                    <span class="warning-icon">🔒</span>
                    <div class="warning-text">
                        <strong>Please Login</strong>
                        <p>You need to log in to select and save courses. Your course selections will not be saved without logging in first.</p>
                    </div>
                </div>
            </div>

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

            <!-- Course Toggle Button -->
            <div class="course-toggle-section">
                <div class="toggle-actions">
                    <button 
                        @click="toggleAllCourses" 
                        class="toggle-courses-btn"
                        :class="{ 'active': showAllCourses }"
                        :disabled="isViewOnly"
                    >
                        {{ showAllCourses ? 'Show My Major Courses Only' : 'Include All School Courses' }}
                    </button>
                    <button 
                        @click="openSimpleEntry" 
                        class="simple-entry-btn top-btn"
                        :disabled="isViewOnly"
                    >
                        📝 Simple Course Entry
                    </button>
                </div>
                <p class="toggle-description">
                    {{ showAllCourses 
                        ? 'Currently showing all courses from the university. Click to show only your major courses.' 
                        : 'Currently showing only courses from your major. Click to include courses from other departments.'
                    }}
                </p>
            </div>

            <!-- Weekly Calendar - Most Important Function, Moved to Top -->
            <WeeklyCalendar :show-all-courses="showAllCourses" :is-view-only="isViewOnly" />
            
            <!-- Credit Limit Warning - MUST HAVE MoSCoW Requirement -->
            <CreditLimitWarning />
            
            <!-- Course Weight Assignment - MUST HAVE MoSCoW Requirement -->
            <CourseWeightAssignment :is-view-only="isViewOnly" />
            
            <div class="action-buttons">
                <router-link to="/" class="home-btn">
                    Back to Home
                </router-link>
                
                <button 
                    @click="handleSave" 
                    :disabled="store.selectedCount === 0 || isViewOnly"
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
        
        <!-- Simple Entry Dialog -->
        <SimpleEntryDialog 
            v-if="showSimpleEntryDialog" 
            @close="showSimpleEntryDialog = false"
            @courses-entered="handleCoursesEntered"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import CreditLimitWarning from '../components/CreditLimitWarning.vue'
import CourseWeightAssignment from '../components/CourseWeightAssignment.vue'
import WeeklyCalendar from '../components/WeeklyCalendar.vue'
import SimpleEntryDialog from '../components/SimpleEntryDialog.vue'
import { useCourseStore } from '../store/courseStore.js'
import { useUserStore } from '../store/userStore.js'
import { useRouter } from 'vue-router'
import { requiredCourses, electiveCourses } from '../data/courses.js'

const store = useCourseStore()
const userStore = useUserStore()
const router = useRouter()
const showAllCourses = ref(false)
const isViewOnly = ref(false)
const showSimpleEntryDialog = ref(false)

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

const openSimpleEntry = () => {
    showSimpleEntryDialog.value = true
}

const handleCoursesEntered = (enteredCourses) => {
    const allCourses = [...requiredCourses, ...electiveCourses]
    
    enteredCourses.forEach(entry => {
        const course = allCourses.find(c => c.code === entry.code)
        if (course && !store.isSelected(course.code)) {
            store.toggleCourse(course)
        }
        
        // Set the weight for the course
        if (course) {
            store.courseWeights[course.code] = entry.weight
        }
    })
    
    // Save weights to localStorage
    localStorage.setItem('courseWeights', JSON.stringify(store.courseWeights))
    
    alert(`Successfully added ${enteredCourses.length} courses with their weights!`)
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
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    width: 100%;
}

.planning-content {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.course-planning h1 {
    color: var(--text);
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
}

.course-planning p {
    text-align: center;
    color: var(--text);
    opacity: 0.8;
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

.home-btn, .save-btn, .profile-btn, .simple-entry-btn {
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

.simple-entry-btn {
    background-color: var(--nord15);
    color: white;
}

.simple-entry-btn:hover:not(:disabled) {
    background-color: var(--nord12);
    transform: translateY(-2px);
}

.simple-entry-btn:disabled {
    background-color: var(--border-color);
    color: var(--text);
    opacity: 0.5;
    cursor: not-allowed;
}

.simple-entry-btn.top-btn {
    margin: 0;
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
    background-color: var(--border-color);
    color: var(--text);
    opacity: 0.5;
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

.course-toggle-section {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 15px var(--shadow);
    border: 1px solid var(--border-color);
    text-align: center;
}

.toggle-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.toggle-description {
    color: var(--text);
    opacity: 0.8;
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 1rem 0 0 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.toggle-courses-btn {
    padding: 0.75rem 1.5rem;
    background: var(--border-color);
    color: var(--text);
    border: 2px solid var(--border-color);
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

.toggle-courses-btn:disabled {
    background: var(--border-color);
    border-color: var(--border-color);
    color: var(--text);
    cursor: not-allowed;
    opacity: 0.4;
}

.toggle-courses-btn:disabled:hover {
    background: var(--border-color);
    border-color: var(--border-color);
    transform: none;
}


.login-warning {
    background: var(--nord13);
    border: 1px solid var(--nord12);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 2rem;
    color: var(--nord1);
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
    
    .home-btn, .save-btn, .profile-btn, .simple-entry-btn {
        width: 100%;
        max-width: 300px;
    }
    
    .course-toggle-section {
        padding: 1rem;
    }
    
    .toggle-actions {
        flex-direction: column;
        gap: 0.75rem;
    }
}
</style>
