import { createRouter, createWebHistory } from 'vue-router'
// import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta:{
        isPublic: true,
      },
    },
    {
      path: '/media-agent',
      name: 'mediaAgent',
      meta:{
        isPublic: true,
      },
      component: () => import('../views/Master/MediaAgent.vue')
    },
    {
      path: '/wholesaler',
      name: 'wholesaler',
      meta:{
        isPublic: true,
      },
      component: () => import('../views/Master/Wholesaler.vue')
    },
    {
      path: '/staff',
      name: 'staff',
      meta:{
        isPublic: true,
      },
      component: () => import('../views/Master/Staff.vue')
    },
    {
      path: '/inout',
      name: 'inout',
      meta:{
        isPublic: true,
      },
      component: () => import('../views/InOut.vue')
    },
    {
      path: '/store-wholesaler-sales',
      name: 'storeDailyDetail',
      meta:{
        isPublic: true,
      },
      component: () => import('../views/WholesalerSales.vue')
    },
    {
      path: '/store-monthly-detail',
      name: 'storeMonthlyDetail',
      meta:{
        isPublic: true,
      },
      component: () => import('../views/StoreMonthlyDetail.vue')
    },
    {
      path: '/staff-shift-input',
      name: 'staffShiftInput',
      meta:{
        isPublic: true,
      },
      component: () => import('../views/StaffShiftInput.vue')
    },
    // {
    //   path: '/login',
    //   name: 'login',
    //   component: LoginView,
    //   // meta:{
    //   //   isPublic: true,
    //   // }
    // },
  ],
})

export default router
