<template>
    <div class="home-page">
        <AppHeader />

        <main class="main-content">
            <section class="hero-section">
                <div class="hero-content">
                    <h1 class="hero-title">CityU Pre-Enrollment System</h1>
                    <p class="hero-description">The official City University pre-enrollment platform for students to indicate course preferences prior to formal registration. This system helps the university gather enrollment demand data and optimize course scheduling for the upcoming semester.</p>
                    <p class="purpose-description">
                        This tool allows students to preview available courses, indicate their preferences with priority weights, and submit their preliminary course selections. The information collected will be used by academic departments to plan course capacity and scheduling before the official enrollment period begins.
                    </p>
                    <button @click="showLogin" class="cta-button">Begin Pre-Enrollment</button>
                </div>
                <div class="hero-visual">
                    <div class="calendar-preview">
                        <div class="preview-header">Sample Weekly Schedule</div>
                        <div class="preview-grid">
                            <div class="preview-day">Mon</div>
                            <div class="preview-day">Tue</div>
                            <div class="preview-day">Wed</div>
                            <div class="preview-day">Thu</div>
                            <div class="preview-day">Fri</div>
                            <div class="preview-block green">CS3103</div>
                            <div class="preview-block blue">IS4420</div>
                            <div class="preview-block green">CS4514</div>
                            <div class="preview-block blue">IS6421</div>
                            <div class="preview-block green">CS5481</div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="disclaimer-section">
                <h2 class="section-title">Important Disclaimer</h2>
                <div class="disclaimer-content">
                    <div class="disclaimer-card">
                        <div class="disclaimer-icon">⚠️</div>
                        <h3>Pre-Enrollment Notice</h3>
                        <p>This is <strong>NOT</strong> the actual course registration system. This pre-enrollment tool is designed to gather student preferences and course demand data to assist the university in planning course offerings and capacity allocation.</p>
                    </div>
                    
                    <div class="disclaimer-card">
                        <div class="disclaimer-icon">📋</div>
                        <h3>No Guarantee Policy</h3>
                        <p>Submitting your preferences through this system does <strong>not guarantee</strong> enrollment in your selected courses. Your responses will be used as reference data for academic planning purposes only. All enrollment decisions remain at the university's discretion.</p>
                    </div>
                    
                    <div class="disclaimer-card">
                        <div class="disclaimer-icon">⏰</div>
                        <h3>First-Come, First-Served</h3>
                        <p>Pre-enrollment submissions are processed on a first-come, first-served basis. Submit your preferences as early as possible to ensure your responses are included in the planning process.</p>
                    </div>
                    
                    <div class="disclaimer-card">
                        <div class="disclaimer-icon">🔒</div>
                        <h3>Submission Policy</h3>
                        <p>Once submitted, changes to your pre-enrollment preferences will <strong>not be permitted</strong> until after the official registration period begins and required courses have been automatically assigned to eligible students.</p>
                    </div>
                    
                    <div class="disclaimer-card">
                        <div class="disclaimer-icon">📝</div>
                        <h3>Optional Participation</h3>
                        <p>This pre-enrollment system is <strong>optional</strong> for students before formal enrollment. If you wish to send your course preferences to the school, you may use this system. However, participation is <strong>not mandatory</strong> for enrollment eligibility.</p>
                    </div>
                    
                    <div class="disclaimer-card">
                        <div class="disclaimer-icon">⚖️</div>
                        <h3>Final Interpretation Rights</h3>
                        <p>City University reserves all rights for final interpretation and decision-making regarding course enrollment, scheduling, and pre-enrollment policies. All enrollment decisions and interpretations of system policies are at the sole discretion of the university administration.</p>
                    </div>
                </div>
            </section>


        </main>
        
        <!-- Login Dialog -->
        <LoginDialog 
            v-if="showLoginDialog" 
            @login-success="handleLoginSuccess" 
            @close="showLoginDialog = false" 
        />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import LoginDialog from '../components/LoginDialog.vue'
import { useUserStore } from '../store/userStore.js'
import { useCourseStore } from '../store/courseStore.js'

const router = useRouter()
const userStore = useUserStore()
const courseStore = useCourseStore()
const showLoginDialog = ref(false)

function showLogin() {
    showLoginDialog.value = true
}

function handleLoginSuccess(student) {
    console.log('Login successful for:', student.name)
    
    // Login the user in the store
    userStore.login(student)
    
    // Reload user-specific course data
    courseStore.loadUserCourses()
    courseStore.loadSavedCourses()
    
    router.push('/planning')
}
</script>

<style scoped>
.home-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    width: 100%;
    padding-bottom: 2rem;
}

.main-content {
    padding: 0 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.hero-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
    margin-bottom: 4rem;
    padding: 2rem 0;
}

.hero-content {
    text-align: left;
}

.hero-title {
    font-size: 2.4rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    color: var(--text);
}

.hero-description {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    color: var(--text);
    opacity: 0.8;
}

.purpose-description {
    font-size: 0.95rem;
    margin-bottom: 2rem;
    line-height: 1.6;
    color: var(--text);
    opacity: 0.9;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border-left: 4px solid var(--nord10);
}

.cta-button {
    display: inline-block;
    padding: 1rem 2rem;
    background: var(--nord10);
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(94, 129, 172, 0.2);
}

.cta-button:hover {
    background: var(--nord9);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(94, 129, 172, 0.3);
}

.hero-visual {
    display: flex;
    justify-content: center;
}

.calendar-preview {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 4px 20px var(--shadow);
    border: 1px solid var(--border-color);
}

.preview-header {
    text-align: center;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text);
    font-size: 0.95rem;
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
}

.preview-day {
    text-align: center;
    font-weight: 600;
    padding: 0.5rem;
    background: var(--border-color);
    border-radius: 6px;
    font-size: 0.8rem;
    color: var(--text);
}

.preview-block {
    padding: 0.75rem 0.5rem;
    border-radius: 6px;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
}

.preview-block.green {
    background: var(--nord14);
}

.preview-block.blue {
    background: var(--nord10);
}

.disclaimer-section,
.quick-actions {
    margin-bottom: 4rem;
}

.section-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--text);
}

.disclaimer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.disclaimer-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px var(--shadow);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.disclaimer-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px var(--shadow);
}

.disclaimer-icon {
    font-size: 2.2rem;
    margin-bottom: 1rem;
    text-align: center;
}

.disclaimer-card h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text);
    text-align: center;
}

.disclaimer-card p {
    color: var(--text);
    opacity: 0.8;
    line-height: 1.6;
    text-align: left;
    font-size: 0.95rem;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.action-button {
    background: var(--bg-secondary);
    padding: 2rem;
    border-radius: 12px;
    border: 2px solid transparent;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 4px 15px var(--shadow);
}

.action-button.primary {
    border-color: var(--nord10);
}

.action-button.secondary {
    border-color: var(--nord8);
}

.action-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px var(--shadow);
}

.action-button.primary:hover {
    background: var(--nord10);
    color: white;
}

.action-button.secondary:hover {
    background: var(--nord8);
    color: white;
}

.action-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.action-button h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: var(--text);
}

.action-button p {
    color: var(--text);
    opacity: 0.8;
    margin: 0;
    font-size: 0.95rem;
}

.action-button:hover h3,
.action-button:hover p {
    color: white;
}

@media (max-width: 768px) {
    .hero-section {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }

    .hero-title {
        font-size: 2rem;
    }

    .hero-description {
        font-size: 1rem;
    }

    .disclaimer-content,
    .actions-grid {
        grid-template-columns: 1fr;
    }

    .main-content {
        padding: 0 1rem;
    }
}

@media (max-width: 480px) {
    .hero-title {
        font-size: 1.6rem;
    }

    .hero-description {
        font-size: 0.95rem;
    }

    .section-title {
        font-size: 1.6rem;
    }
}
</style>
