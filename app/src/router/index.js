import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/media-agencies',
      name: 'mediaAgencies',
      component: () => import('../views/MediaAgencies.vue')    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta:{
        isPublic: true,
      }
    },
  ],
})

export default router
