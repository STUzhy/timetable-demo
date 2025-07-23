import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CoursePlanning from '../views/CoursePlanning.vue'
import Profile from '../views/Profile.vue'
import CourseDetails from '../views/CourseDetails.vue'

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
    },
    {
        path: '/courses',
        name: 'CourseDetails',
        component: CourseDetails
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
