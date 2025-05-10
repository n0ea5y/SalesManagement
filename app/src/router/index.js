import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    }
  ],
})

router.beforeEach((to, from, next) => {
  const auth = getAuth();

  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);

  onAuthStateChanged(auth, (user) => {
    if(authRequired && !user) {
      next('/login')
    }else{
      next();
    }
  })
})
export default router
