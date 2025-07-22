import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/theme.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

// Apply dark theme on load if set
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme')
}
