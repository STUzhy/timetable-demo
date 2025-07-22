<template>
    <div class="home-page">
        <header class="main-header">
            <div class="logo">
                <div class="logo-icon">📚</div>
                <h2>Course<span class="accent">Plan</span></h2>
            </div>
            <nav class="main-nav">
                <RouterLink to="/" class="nav-link active">Home</RouterLink>
                <RouterLink to="/planning" class="nav-link">Course Planning</RouterLink>
                <RouterLink to="/profile" class="nav-link">Profile</RouterLink>
            </nav>
            <button class="theme-toggle" @click="toggleTheme">
                <span v-if="isDark">🌙</span>
                <span v-else>☀️</span>
            </button>
        </header>

        <main class="main-content">
            <section class="hero-section">
                <div class="hero-content">
                    <h1 class="hero-title">Welcome to Your Course Planner</h1>
                    <p class="hero-description">Easily plan, manage, and visualize your academic journey with our intuitive course selection system.</p>
                    <RouterLink class="cta-button" to="/planning">Start Planning</RouterLink>
                </div>
                <div class="hero-visual">
                    <div class="calendar-preview">
                        <div class="preview-header">Weekly Schedule</div>
                        <div class="preview-grid">
                            <div class="preview-day">Mon</div>
                            <div class="preview-day">Tue</div>
                            <div class="preview-day">Wed</div>
                            <div class="preview-day">Thu</div>
                            <div class="preview-day">Fri</div>
                            <div class="preview-block green">Analytics</div>
                            <div class="preview-block blue">Database</div>
                            <div class="preview-block green">JAVA</div>
                            <div class="preview-block blue">Systems</div>
                            <div class="preview-block green">Data Viz</div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="features-section">
                <h2 class="section-title">Powerful Features</h2>
                <div class="features-grid">
                    <div class="feature-card" v-for="(feature, index) in features" :key="index">
                        <div class="feature-icon">{{ feature.icon }}</div>
                        <h3 class="feature-title">{{ feature.title }}</h3>
                        <p class="feature-description">{{ feature.text }}</p>
                    </div>
                </div>
            </section>

            <section class="quick-actions">
                <h2 class="section-title">Quick Actions</h2>
                <div class="actions-grid">
                    <RouterLink to="/planning" class="action-card primary">
                        <div class="action-icon">📅</div>
                        <h3>Plan Courses</h3>
                        <p>Start planning your course schedule</p>
                    </RouterLink>
                    <RouterLink to="/profile" class="action-card secondary">
                        <div class="action-icon">👤</div>
                        <h3>View Profile</h3>
                        <p>Check your academic profile</p>
                    </RouterLink>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.body.classList.toggle('dark-theme', isDark.value)
}

const features = [
    { 
        icon: '📅', 
        title: 'Visual Calendar', 
        text: 'See all your courses on an intuitive weekly calendar with smart conflict detection.' 
    },
    { 
        icon: '⚖️', 
        title: 'Weight Assignment', 
        text: 'Assign priority weights to courses for optimal scheduling and preference tracking.' 
    },
    { 
        icon: '🎯', 
        title: 'Smart Limits', 
        text: 'Intelligent 6-course limit system with primary/backup course management.' 
    },
    { 
        icon: '🔄', 
        title: 'Real-time Updates', 
        text: 'Instant feedback on course selection with live conflict detection and validation.' 
    }
]
</script>

<style scoped>
.home-page {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: transparent;
    color: white;
    min-height: 100vh;
    width: 100%;
}

.main-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    margin-bottom: 2rem;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo-icon {
    font-size: 2rem;
}

.logo h2 {
    font-weight: 700;
    color: white;
    margin: 0;
    font-size: 1.5rem;
}

.logo .accent {
    color: var(--nord11);
}

.main-nav {
    display: flex;
    gap: 2rem;
}

.nav-link {
    text-decoration: none;
    color: white;
    font-weight: 500;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
    background: var(--nord12);
    color: white;
    transform: translateY(-2px);
}

.theme-toggle {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.theme-toggle:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.main-content {
    padding: 0 2rem;
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
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.2;
    background: linear-gradient(135deg, white, var(--nord13));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-description {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
}

.cta-button {
    display: inline-block;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, var(--nord10), var(--nord8));
    color: white;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(94, 129, 172, 0.3);
}

.cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(94, 129, 172, 0.4);
}

.hero-visual {
    display: flex;
    justify-content: center;
}

.calendar-preview {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 1.5rem;
    width: 100%;
    max-width: 400px;
}

.preview-header {
    text-align: center;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
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
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 0.9rem;
}

.preview-block {
    padding: 0.75rem 0.5rem;
    border-radius: 8px;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 500;
    color: white;
}

.preview-block.green {
    background: var(--nord14);
}

.preview-block.blue {
    background: var(--nord10);
}

.features-section,
.quick-actions {
    margin-bottom: 4rem;
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: white;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 16px;
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
}

.feature-description {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.action-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 16px;
    text-decoration: none;
    color: white;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.action-card.primary {
    border-color: var(--nord10);
}

.action-card.secondary {
    border-color: var(--nord8);
}

.action-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.action-card.primary:hover {
    border-color: var(--nord8);
    box-shadow: 0 15px 35px rgba(94, 129, 172, 0.3);
}

.action-card.secondary:hover {
    border-color: var(--nord7);
    box-shadow: 0 15px 35px rgba(143, 188, 187, 0.3);
}

.action-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.action-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: white;
}

.action-card p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
}

@media (max-width: 768px) {
    .main-header {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }

    .main-nav {
        gap: 1rem;
    }

    .hero-section {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .features-grid,
    .actions-grid {
        grid-template-columns: 1fr;
    }

    .main-content {
        padding: 0 1rem;
    }
}

@media (max-width: 480px) {
    .hero-title {
        font-size: 2rem;
    }

    .hero-description {
        font-size: 1.1rem;
    }

    .section-title {
        font-size: 2rem;
    }
}
</style>
