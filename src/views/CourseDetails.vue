<template>
    <div class="course-details-page">
        <AppHeader />
        
        <main class="main-content">
            <div class="page-header">
                <h1 class="page-title">Course Details</h1>
                <div class="search-container">
                    <input 
                        v-model="searchQuery" 
                        type="text" 
                        placeholder="Search courses by code, name, professor, or major..."
                        class="search-input"
                    />
                    <div class="filter-container">
                        <select v-model="selectedMajor" class="filter-select">
                            <option value="">All Majors</option>
                            <option v-for="major in uniqueMajors" :key="major" :value="major">
                                {{ major }}
                            </option>
                        </select>
                        <select v-model="selectedDay" class="filter-select">
                            <option value="">All Days</option>
                            <option value="Mon">Monday</option>
                            <option value="Tue">Tuesday</option>
                            <option value="Wed">Wednesday</option>
                            <option value="Thu">Thursday</option>
                            <option value="Fri">Friday</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="course-sections">
                <div class="course-section">
                    <h2 class="section-title">Required Courses</h2>
                    <div class="course-grid">
                        <div 
                            v-for="course in filteredRequiredCourses" 
                            :key="course.code" 
                            class="course-card required"
                        >
                            <div class="course-header">
                                <h3 class="course-code">{{ course.code }}</h3>
                                <span class="course-type">Required</span>
                            </div>
                            <h4 class="course-name">{{ course.name }}</h4>
                            <div class="course-details">
                                <div class="detail-item">
                                    <span class="detail-label">Professor:</span>
                                    <span class="detail-value">{{ course.professor }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Location:</span>
                                    <span class="detail-value">{{ course.location }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Schedule:</span>
                                    <span class="detail-value">{{ formatSchedule(course) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Duration:</span>
                                    <span class="detail-value">{{ course.duration }} hours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="course-section">
                    <h2 class="section-title">Elective Courses</h2>
                    <div class="course-grid">
                        <div 
                            v-for="course in filteredElectiveCourses" 
                            :key="course.code" 
                            class="course-card elective"
                        >
                            <div class="course-header">
                                <h3 class="course-code">{{ course.code }}</h3>
                                <span class="course-type">Elective</span>
                            </div>
                            <h4 class="course-name">{{ course.name }}</h4>
                            <div class="course-details">
                                <div class="detail-item">
                                    <span class="detail-label">Professor:</span>
                                    <span class="detail-value">{{ course.professor }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Location:</span>
                                    <span class="detail-value">{{ course.location }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Schedule:</span>
                                    <span class="detail-value">{{ formatSchedule(course) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Duration:</span>
                                    <span class="detail-value">{{ course.duration }} hours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="course-section">
                    <h2 class="section-title">All School Courses</h2>
                    <div class="course-grid">
                        <div 
                            v-for="course in filteredAllSchoolCourses" 
                            :key="course.code" 
                            class="course-card other"
                        >
                            <div class="course-header">
                                <h3 class="course-code">{{ course.code }}</h3>
                                <span class="course-type">{{ course.major }}</span>
                            </div>
                            <h4 class="course-name">{{ course.name }}</h4>
                            <div class="course-details">
                                <div class="detail-item">
                                    <span class="detail-label">Professor:</span>
                                    <span class="detail-value">{{ course.professor }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Location:</span>
                                    <span class="detail-value">{{ course.location }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Schedule:</span>
                                    <span class="detail-value">{{ formatSchedule(course) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Duration:</span>
                                    <span class="detail-value">{{ course.duration }} hours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="totalFilteredCourses === 0" class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No courses found</h3>
                <p>Try adjusting your search criteria or filters</p>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import { requiredCourses, electiveCourses, allSchoolCourses } from '../data/courses.js'

const searchQuery = ref('')
const selectedMajor = ref('')
const selectedDay = ref('')

const uniqueMajors = computed(() => {
    const majors = new Set()
    majors.add('Information Systems')
    allSchoolCourses.forEach(course => {
        if (course.major) majors.add(course.major)
    })
    return Array.from(majors).sort()
})

const filteredRequiredCourses = computed(() => {
    return filterCourses(requiredCourses)
})

const filteredElectiveCourses = computed(() => {
    return filterCourses(electiveCourses)
})

const filteredAllSchoolCourses = computed(() => {
    return filterCourses(allSchoolCourses)
})

const totalFilteredCourses = computed(() => {
    return filteredRequiredCourses.value.length + 
           filteredElectiveCourses.value.length + 
           filteredAllSchoolCourses.value.length
})

function filterCourses(courses) {
    return courses.filter(course => {
        const matchesSearch = searchQuery.value === '' || 
            course.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            course.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            course.professor.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (course.major && course.major.toLowerCase().includes(searchQuery.value.toLowerCase()))
        
        const matchesMajor = selectedMajor.value === '' || 
            (course.major === selectedMajor.value) ||
            (selectedMajor.value === 'Information Systems' && !course.major)
        
        const matchesDay = selectedDay.value === '' || course.day === selectedDay.value
        
        return matchesSearch && matchesMajor && matchesDay
    })
}

function formatSchedule(course) {
    const dayNames = {
        'Mon': 'Monday',
        'Tue': 'Tuesday', 
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday'
    }
    
    const formatTime = (hour) => {
        if (hour >= 12) {
            return hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`
        }
        return `${hour}:00 AM`
    }
    
    const startTime = formatTime(course.startHour)
    const endTime = formatTime(course.startHour + course.duration)
    
    return `${dayNames[course.day]} ${startTime} - ${endTime}`
}
</script>

<style scoped>
.course-details-page {
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
}

.main-content {
    padding: 0 2rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 2rem;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text);
    text-align: center;
}

.search-container {
    max-width: 800px;
    margin: 0 auto;
}

.search-input {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    background: var(--bg-secondary);
    color: var(--text);
    margin-bottom: 1rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: var(--nord10);
    box-shadow: 0 0 0 3px rgba(94, 129, 172, 0.1);
}

.filter-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.filter-select {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text);
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-select:focus {
    outline: none;
    border-color: var(--nord10);
}

.course-sections {
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

.course-section {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px var(--shadow);
    border: 1px solid var(--border-color);
}

.section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text);
    border-bottom: 3px solid var(--nord10);
    padding-bottom: 0.5rem;
}

.course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.course-card {
    background: var(--bg);
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.course-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px var(--shadow);
}

.course-card.required {
    border-left: 4px solid var(--nord11);
}

.course-card.elective {
    border-left: 4px solid var(--nord14);
}

.course-card.other {
    border-left: 4px solid var(--nord10);
}

.course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.course-code {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text);
    margin: 0;
}

.course-type {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
}

.course-card.required .course-type {
    background: var(--nord11);
}

.course-card.elective .course-type {
    background: var(--nord14);
}

.course-card.other .course-type {
    background: var(--nord10);
}

.course-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 1rem 0;
    line-height: 1.3;
}

.course-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.detail-label {
    font-weight: 600;
    color: var(--text);
    min-width: 70px;
    font-size: 0.8rem;
}

.detail-value {
    color: var(--text);
    font-size: 0.8rem;
    opacity: 0.8;
}

.no-results {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text);
}

.no-results-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.no-results h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text);
}

.no-results p {
    color: var(--text);
    opacity: 0.7;
}

@media (max-width: 768px) {
    .main-content {
        padding: 0 1rem 2rem;
    }
    
    .page-title {
        font-size: 2rem;
    }
    
    .filter-container {
        flex-direction: column;
    }
    
    .course-grid {
        grid-template-columns: 1fr;
    }
    
    .course-section {
        padding: 1.5rem;
    }
    
    .section-title {
        font-size: 1.5rem;
    }
}

@media (max-width: 480px) {
    .course-card {
        padding: 1rem;
    }
    
    .course-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .detail-item {
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .detail-label {
        min-width: auto;
    }
}
</style>