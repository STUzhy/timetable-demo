<template>
    <div class="home-page">
        <header>
            <div class="logo">
                <img src="https://via.placeholder.com/40" alt="Placeholder Logo" />
                <h2>Course<span class="accent">Plan</span></h2>
            </div>
            <nav>
                <RouterLink to="/" class="active">Home</RouterLink>
                <RouterLink to="/planning">Course Planning</RouterLink>
                <RouterLink to="/profile">Profile</RouterLink>
            </nav>
            <button class="theme-toggle" @click="toggleTheme">
                <span v-if="isDark">🌙</span>
                <span v-else>☀️</span>
            </button>
        </header>

        <main>
            <section class="hero">
                <h1>Welcome to Your Course Planner</h1>
                <p>Easily plan, manage, and visualize your academic journey.</p>
                <RouterLink class="cta" to="/planning">Start Planning</RouterLink>
            </section>

            <section class="features">
                <div class="card" v-for="(f, i) in features" :key="i">
                    <span class="material-icons-sharp">{{ f.icon }}</span>
                    <h3>{{ f.title }}</h3>
                    <p>{{ f.text }}</p>
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
  { icon: 'calendar_today', title: 'Visual Calendar', text: 'See all your courses on a weekly calendar.' },
  { icon: 'search', title: 'Smart Search', text: 'Search and filter master course offerings.' },
  { icon: 'person', title: 'Profile Sync', text: 'Manage your academic info and sync across devices.' },
]
</script>

<style scoped>
.home-page {
    font-family: 'Poppins', sans-serif;
    background-color: var(--bg);
    color: var(--text);
    min-height: 100vh;
}

header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background-color: var(--nord1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.logo {
    display: flex;
    align-items: center;
}
.logo img {
    width: 32px;
    margin-right: 0.5rem;
}
.logo h2 {
    font-weight: bold;
    color: var(--nord6);
}
.logo .accent {
    color: var(--nord11); /* red for logo pop */
}
nav {
    display: flex;
    gap: 1.5rem;
}
nav a {
    text-decoration: none;
    color: var(--nord6);
    font-weight: 500;
}
nav a.active {
    color: var(--nord12); /* orange */
    border-bottom: 2px solid var(--nord12);
}

.theme-toggle {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.hero {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(145deg, var(--nord15), var(--nord6));
    color: var(--nord0);
}
.hero h1 {
    font-size: 2.8rem;
    margin-bottom: 1rem;
    color: var(--nord11); /* aurora red headline */
}
.hero .cta {
    margin-top: 2rem;
    display: inline-block;
    padding: 0.8rem 1.5rem;
    background-color: var(--nord12); /* orange */
    color: white;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.3s ease;
}
.hero .cta:hover {
    background-color: var(--nord11); /* red on hover */
}

.features {
    display: flex;
    justify-content: space-around;
    padding: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
}
.card {
    background: var(--nord6);
    padding: 1.5rem;
    border-radius: 1rem;
    width: 260px;
    text-align: center;
    color: var(--nord1);
    box-shadow: 0 0.5rem 1.5rem var(--nord15);
    transition: transform 0.2s ease;
}
.card:hover {
    transform: scale(1.03);
}
.card span {
    font-size: 2rem;
    color: var(--nord15); /* purple/pink */
}
</style>
