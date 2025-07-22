<template>
    <header class="main-header">
        <div class="logo">
            <div class="logo-icon">🏛️</div>
            <h2>CityU <span class="accent">Pre-Enrollment</span></h2>
        </div>
        <nav class="main-nav">
            <RouterLink to="/" class="nav-link" :class="{ active: $route.path === '/' }">Home</RouterLink>
            <RouterLink to="/planning" class="nav-link" :class="{ active: $route.path === '/planning' }">Course Planning</RouterLink>
            <RouterLink to="/profile" class="nav-link" :class="{ active: $route.path === '/profile' }">Profile</RouterLink>
        </nav>
        <button class="theme-toggle" @click="toggleTheme">
            <span v-if="isDark">🌙</span>
            <span v-else>☀️</span>
        </button>
    </header>
</template>

<script setup>
import { ref } from 'vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.body.classList.toggle('dark-theme', isDark.value)
}
</script>

<style scoped>
.main-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid var(--nord4);
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
    color: var(--nord1);
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
    color: var(--nord2);
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
    background: var(--nord4);
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
    background: var(--nord3);
    transform: scale(1.1);
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
}
</style>
