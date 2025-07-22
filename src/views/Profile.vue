<template>
    <div class="profile">
        <AppHeader />
        
        <div class="profile-content">
            <h1>Student Profile</h1>
            
            <!-- Student Information Card -->
            <div class="student-card">
                <h2>Basic Information</h2>
                <div class="student-info">
                    <p><strong>Name:</strong> {{ currentStudent.name }}</p>
                    <p><strong>Student ID:</strong> {{ currentStudent.studentNumber }}</p>
                    <p><strong>Year:</strong> {{ currentStudent.year }}</p>
                    <p><strong>Major:</strong> {{ currentStudent.major }}</p>
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
            <div class="courses-card">
                <h2>My Pre-Enrollment Selections</h2>
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
                                    <span v-if="store.getWeight(course.code) > 0" class="course-weight">
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
                                    <span v-if="store.getWeight(course.code) > 0" class="course-weight">
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
                <router-link to="/planning" class="back-btn">
                    Back to Course Planning
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { useCourseStore } from '../store/courseStore.js'
import { currentStudent } from '../data/studentInfo.js'
import { requiredCourses, electiveCourses } from '../data/courses.js'

const store = useCourseStore()

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
    background: var(--nord5);
    color: var(--nord1);
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
    color: var(--nord1);
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
}

.student-card, .progress-card, .courses-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--nord4);
}

.student-card h2, .progress-card h2, .courses-card h2 {
    color: var(--nord1);
    margin-bottom: 1rem;
    border-bottom: 2px solid var(--nord4);
    padding-bottom: 0.5rem;
}

.student-info p {
    margin: 0.5rem 0;
    color: var(--nord2);
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
    color: var(--nord2);
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.no-courses {
    text-align: center;
    padding: 2rem;
    color: var(--nord2);
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
    color: var(--nord1);
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.course-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.course-item {
    border: 1px solid var(--nord4);
    border-radius: 8px;
    padding: 1rem;
    background: var(--nord6);
    transition: all 0.3s ease;
}

.course-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.course-code {
    font-weight: bold;
    color: var(--nord1);
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
    color: var(--nord1);
    margin-bottom: 0.5rem;
}

.course-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: var(--nord2);
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
}
</style>
