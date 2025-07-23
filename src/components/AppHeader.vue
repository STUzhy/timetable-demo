<template>
    <header class="main-header">
        <div class="logo">
            <div class="logo-icon">🏛️</div>
            <h2>CityU <span class="accent">Pre-Enrollment</span></h2>
        </div>
        <nav class="main-nav">
            <RouterLink to="/" class="nav-link" :class="{ active: $route.path === '/' }">Home</RouterLink>
            <RouterLink to="/courses" class="nav-link" :class="{ active: $route.path === '/courses' }">Course Details</RouterLink>
            <RouterLink to="/planning" class="nav-link" :class="{ active: $route.path === '/planning' }">Course Planning</RouterLink>
            <RouterLink to="/profile" class="nav-link" :class="{ active: $route.path === '/profile' }">Profile</RouterLink>
        </nav>
        <div class="header-actions">
            <div v-if="userStore.isLoggedIn" class="user-info">
                <span class="welcome-text">Welcome, {{ userStore.currentUser.name }}</span>
                <button @click="handleLogout" class="logout-btn">Logout</button>
            </div>
            <button class="theme-toggle" @click="toggleTheme">
                <span v-if="isDark">☀️</span>
                <span v-else>🌙</span>
            </button>
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../store/userStore.js'
import { useCourseStore } from '../store/courseStore.js'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const courseStore = useCourseStore()
const router = useRouter()
const isDark = ref(localStorage.getItem('theme') === 'dark')

function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.body.classList.toggle('dark-theme', isDark.value)
}

// Initialize theme on component mount
onMounted(() => {
    document.body.classList.toggle('dark-theme', isDark.value)
})

function handleLogout() {
    userStore.logout()
    // Clear course data
    courseStore.selectedCourses = []
    courseStore.savedCourses = []
    courseStore.courseWeights = {}
    router.push('/')
}
</script>

<style scoped>
.main-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    background: var(--bg-secondary);
    box-shadow: 0 2px 10px var(--shadow);
    border-bottom: 1px solid var(--border-color);
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
    color: var(--text);
    margin: 0;
    font-size: 1.5rem;
}

.logo .accent {
    color: var(--nord10);
}

.main-nav {
    display: flex;
    gap: 2rem;
}

.nav-link {
    text-decoration: none;
    color: var(--text);
    opacity: 0.8;
    font-weight: 500;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
    background: var(--nord10);
    color: white;
    transform: translateY(-2px);
}

.theme-toggle {
    background: var(--border-color);
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
    background: var(--nord10);
    transform: scale(1.1);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    background: var(--bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.welcome-text {
    color: var(--text);
    font-size: 0.9rem;
    font-weight: 500;
}

.logout-btn {
    background: var(--nord11);
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.logout-btn:hover {
    background: #dc2626;
    transform: translateY(-1px);
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
    
    .header-actions {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .user-info {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
        padding: 0.75rem;
    }
    
    .welcome-text {
        font-size: 0.8rem;
    }
}
</style>
