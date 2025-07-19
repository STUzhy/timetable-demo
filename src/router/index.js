import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CoursePlanning from '../views/CoursePlanning.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/planning',
        name: 'CoursePlanning',
        component: CoursePlanning
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
