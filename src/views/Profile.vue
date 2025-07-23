<template>
    <div class="profile">
        <AppHeader />
        
        <div class="profile-content">
            <h1>Student Profile</h1>
            
            <!-- Login Warning -->
            <div v-if="!userStore.isLoggedIn" class="warning-card">
                <div class="warning-content">
                    <h2>⚠️ Please Login</h2>
                    <p>You need to login to view your profile and course selections.</p>
                    <router-link to="/" class="login-link">
                        Go to Home to Login
                    </router-link>
                </div>
            </div>
            
            <!-- Student Information Card -->
            <div v-if="userStore.isLoggedIn" class="student-card">
                <h2>Basic Information</h2>
                <div class="student-info">
                    <p><strong>Name:</strong> {{ userStore.currentUser.name }}</p>
                    <p><strong>Student ID:</strong> {{ userStore.currentUser.studentNumber }}</p>
                    <p><strong>Year:</strong> {{ userStore.currentUser.year }}</p>
                    <p><strong>Major:</strong> {{ userStore.currentUser.major }}</p>
                </div>
            </div>

            <!-- Academic Progress Statistics -->
            <div class="progress-card">
                <h2>Pre-Enrollment Progress</h2>
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-number">{{ store.savedCount }}</span>
                        <span class="stat-label">Selected Courses</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ requiredCoursesCount }}</span>
                        <span class="stat-label">Required Courses</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ electiveCoursesCount }}</span>
                        <span class="stat-label">Elective Courses</span>
                    </div>
                </div>
            </div>

            <!-- Saved Courses List -->
            <div v-if="userStore.isLoggedIn" class="courses-card">
                <h2>My Pre-Enrollment Selections</h2>
                <div class="courses-header">
                    <button @click="showClearDialog = true" class="clear-btn">
                        🗑️ Clear Record
                    </button>
                </div>
                <div v-if="store.savedCount === 0" class="no-courses">
                    <p>No courses selected yet</p>
                    <router-link to="/planning" class="planning-link">
                        Start Pre-Enrollment Planning
                    </router-link>
                </div>
                <div v-else>
                    <!-- Required Courses -->
                    <div v-if="savedRequiredCourses.length > 0" class="course-section">
                        <h3>Required Courses</h3>
                        <div class="course-list">
                            <div 
                                v-for="course in savedRequiredCourses" 
                                :key="course.code"
                                class="course-item required"
                            >
                                <div class="course-header">
                                    <span class="course-code">{{ course.code }}</span>
                                    <span class="course-badge required-badge">Required</span>
                                </div>
                                <div class="course-name">{{ course.name }}</div>
                                <div class="course-details">
                                    <span>{{ course.professor }}</span>
                                    <span>{{ course.location }}</span>
                                    <span>{{ course.day }} {{ course.startHour }}:00-{{ course.startHour + course.duration }}:00</span>
                                    <span class="course-weight">
                                        Weight: {{ store.getWeight(course.code) }} points
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Elective Courses -->
                    <div v-if="savedElectiveCourses.length > 0" class="course-section">
                        <h3>Elective Courses</h3>
                        <div class="course-list">
                            <div 
                                v-for="course in savedElectiveCourses" 
                                :key="course.code"
                                class="course-item elective"
                            >
                                <div class="course-header">
                                    <span class="course-code">{{ course.code }}</span>
                                    <span class="course-badge elective-badge">Elective</span>
                                </div>
                                <div class="course-name">{{ course.name }}</div>
                                <div class="course-details">
                                    <span>{{ course.professor }}</span>
                                    <span>{{ course.location }}</span>
                                    <span>{{ course.day }} {{ course.startHour }}:00-{{ course.startHour + course.duration }}:00</span>
                                    <span class="course-weight">
                                        Weight: {{ store.getWeight(course.code) }} points
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="actions">
                <router-link to="/" class="home-btn">
                    Back to Home
                </router-link>
                <router-link v-if="userStore.isLoggedIn" to="/planning" class="back-btn">
                    Back to Course Planning
                </router-link>
            </div>
        </div>
        
        <!-- Clear Record Dialog -->
        <div v-if="showClearDialog" class="dialog-overlay" @click="closeClearDialog">
            <div class="clear-dialog" @click.stop>
                <h2>Clear All Records</h2>
                <p>This will permanently delete all course selections and data for all students. This action cannot be undone.</p>
                
                <div class="form-group">
                    <label for="adminPassword">Admin Password:</label>
                    <input 
                        type="password" 
                        id="adminPassword"
                        v-model="adminPassword"
                        placeholder="Enter admin password"
                        @keyup.enter="clearAllRecords"
                    />
                </div>
                
                <div v-if="clearError" class="error-message">
                    {{ clearError }}
                </div>
                
                <div class="dialog-actions">
                    <button @click="closeClearDialog" class="btn-cancel">
                        Cancel
                    </button>
                    <button @click="clearAllRecords" class="btn-clear" :disabled="!adminPassword">
                        Clear All Records
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useCourseStore } from '../store/courseStore.js'
import { useUserStore } from '../store/userStore.js'
import { requiredCourses, electiveCourses } from '../data/courses.js'

const store = useCourseStore()
const userStore = useUserStore()

// Ensure weights are loaded when component mounts
onMounted(() => {
    if (userStore.isLoggedIn) {
        store.loadWeights()
    }
})

// Clear dialog state
const showClearDialog = ref(false)
const adminPassword = ref('')
const clearError = ref('')

const closeClearDialog = () => {
    showClearDialog.value = false
    adminPassword.value = ''
    clearError.value = ''
}

const clearAllRecords = () => {
    if (adminPassword.value !== '2025') {
        clearError.value = 'Invalid admin password'
        return
    }
    
    // Clear all user data
    userStore.clearAllUserData()
    
    // Clear current store data
    store.selectedCourses = []
    store.savedCourses = []
    store.courseWeights = {}
    
    // Force reload the store
    store.loadSavedCourses()
    
    alert('All records have been cleared successfully!')
    closeClearDialog()
}

// Calculate required and elective course counts
const savedRequiredCourses = computed(() => {
    const requiredCodes = requiredCourses.map(c => c.code)
    return store.savedCourses.filter(course => requiredCodes.includes(course.code))
})

const savedElectiveCourses = computed(() => {
    const electiveCodes = electiveCourses.map(c => c.code)
    return store.savedCourses.filter(course => electiveCodes.includes(course.code))
})

const requiredCoursesCount = computed(() => savedRequiredCourses.value.length)
const electiveCoursesCount = computed(() => savedElectiveCourses.value.length)
</script>

<style scoped>
.profile {
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    width: 100%;
    padding-bottom: 2rem;
}

.profile-content {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.profile h1 {
    color: var(--text);
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
}

.student-card, .progress-card, .courses-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 15px var(--shadow);
    border: 1px solid var(--border-color);
}

.student-card h2, .progress-card h2, .courses-card h2 {
    color: var(--text);
    margin-bottom: 1rem;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.student-info p {
    margin: 0.5rem 0;
    color: var(--text);
    opacity: 0.8;
    font-size: 1.1rem;
}

.stats {
    display: flex;
    justify-content: space-around;
    text-align: center;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: var(--nord10);
}

.stat-label {
    color: var(--text);
    opacity: 0.8;
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.no-courses {
    text-align: center;
    padding: 2rem;
    color: var(--text);
    opacity: 0.8;
}

.planning-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: var(--nord10);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s ease;
    font-weight: 600;
}

.planning-link:hover {
    background-color: var(--nord9);
    transform: translateY(-2px);
}

.course-section {
    margin-bottom: 2rem;
}

.course-section h3 {
    color: var(--text);
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.course-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.course-item {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    background: var(--bg);
    transition: all 0.3s ease;
}

.course-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px var(--shadow);
}

.course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.course-code {
    font-weight: bold;
    color: var(--text);
    font-size: 1.1rem;
}

.course-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
}

.required-badge {
    background-color: var(--nord12);
    color: white;
}

.elective-badge {
    background-color: var(--nord14);
    color: white;
}

.course-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.5rem;
}

.course-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--text);
    opacity: 0.8;
}

.course-weight {
    color: var(--nord10) !important;
    font-weight: 600;
    font-size: 0.9rem;
}

.actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
}

.home-btn, .back-btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.home-btn {
    background-color: var(--nord8);
}

.home-btn:hover {
    background-color: var(--nord7);
    transform: translateY(-2px);
}

.back-btn {
    background-color: var(--nord10);
}

.back-btn:hover {
    background-color: var(--nord9);
    transform: translateY(-2px);
}

.warning-card {
    background: var(--nord11);
    opacity: 0.9;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    box-shadow: 0 4px 15px var(--shadow);
}

.warning-content h2 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.warning-content p {
    color: white;
    opacity: 0.9;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
}

.login-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: var(--nord11);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.login-link:hover {
    background-color: #dc2626;
    transform: translateY(-2px);
}

.courses-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
}

.clear-btn {
    background: var(--nord11);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.clear-btn:hover {
    background: #dc2626;
    transform: translateY(-2px);
}

.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(4px);
}

.clear-dialog {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.clear-dialog h2 {
    color: var(--nord11);
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    text-align: center;
}

.clear-dialog p {
    color: var(--nord2);
    margin-bottom: 1.5rem;
    text-align: center;
    line-height: 1.5;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--nord1);
    font-weight: 600;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--nord4);
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--nord10);
    box-shadow: 0 0 0 3px rgba(94, 129, 172, 0.1);
}

.error-message {
    background: var(--nord11);
    color: white;
    padding: 0.75rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    text-align: center;
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.btn-cancel, .btn-clear {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-cancel {
    background: var(--nord4);
    color: var(--nord2);
}

.btn-cancel:hover {
    background: var(--nord3);
}

.btn-clear {
    background: var(--nord11);
    color: white;
}

.btn-clear:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
}

.btn-clear:disabled {
    background: var(--nord4);
    color: var(--nord3);
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .profile-content {
        padding: 1rem;
    }
    
    .stats {
        flex-direction: column;
        gap: 1rem;
    }
    
    .course-list {
        grid-template-columns: 1fr;
    }
    
    .actions {
        flex-direction: column;
        align-items: center;
    }
    
    .home-btn, .back-btn {
        width: 100%;
        max-width: 300px;
    }
    
    .clear-dialog {
        padding: 1.5rem;
        margin: 1rem;
    }
    
    .dialog-actions {
        flex-direction: column;
    }
    
    .btn-cancel, .btn-clear {
        width: 100%;
    }
}
</style>
