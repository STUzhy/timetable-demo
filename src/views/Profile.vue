<template>
    <div class="profile">
        <h1>Student Profile</h1>
        
        <!-- 学生信息卡片 -->
        <div class="student-card">
            <h2>Basic Information</h2>
            <div class="student-info">
                <p><strong>Name:</strong> {{ studentInfo.name }}</p>
                <p><strong>Student ID:</strong> {{ studentInfo.studentNumber }}</p>
                <p><strong>Year:</strong> {{ studentInfo.year }}</p>
                <p><strong>Major:</strong> {{ studentInfo.major }}</p>
            </div>
        </div>

        <!-- 学习进度统计 -->
        <div class="progress-card">
            <h2>Academic Progress</h2>
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

        <!-- 已保存的课程列表 -->
        <div class="courses-card">
            <h2>My Courses</h2>
            <div v-if="store.savedCount === 0" class="no-courses">
                <p>No courses saved yet</p>
                <router-link to="/planning" class="planning-link">
                    Go to Course Planning
                </router-link>
            </div>
            <div v-else>
                <!-- 必修课程 -->
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
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 选修课程 -->
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 返回按钮 -->
        <div class="actions">
            <router-link to="/" class="home-btn">
                Back to Home
            </router-link>
            <router-link to="/planning" class="back-btn">
                Back to Course Planning
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCourseStore } from '../store/courseStore.js'
import { studentInfo } from '../data/studentInfo.js'
import { requiredCourses, electiveCourses } from '../data/courses.js'

const store = useCourseStore()

// 计算必修课和选修课数量
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
    padding: 2rem 2rem 4rem 2rem;
    background-color: transparent;
    color: var(--nord0);
    min-height: 100vh;
    overflow-y: auto;
    max-height: 100vh;
}

.profile h1 {
    color: white;
    font-size: 2rem;
    margin-bottom: 2rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    text-align: center;
}

.student-card, .progress-card, .courses-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.student-card h2, .progress-card h2, .courses-card h2 {
    color: #333;
    margin-bottom: 1rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
}

.student-info p {
    margin: 0.5rem 0;
    color: #555;
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
    color: #2196F3;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.no-courses {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.planning-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #2196F3;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition: background-color 0.3s;
}

.planning-link:hover {
    background-color: #1976D2;
}

.course-section {
    margin-bottom: 2rem;
}

.course-section h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
}

.course-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.course-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    background: white;
    transition: transform 0.2s, box-shadow 0.2s;
}

.course-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.course-code {
    font-weight: bold;
    color: #333;
}

.course-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
}

.required-badge {
    background-color: #ff9800;
    color: white;
}

.elective-badge {
    background-color: #4CAF50;
    color: white;
}

.course-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #222;
    margin-bottom: 0.5rem;
}

.course-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.9rem;
    color: #666;
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
    background-color: #28a745;
}

.home-btn:hover {
    background-color: #218838;
    transform: translateY(-2px);
}

.back-btn {
    background-color: #6c757d;
}

.back-btn:hover {
    background-color: #5a6268;
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .profile {
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