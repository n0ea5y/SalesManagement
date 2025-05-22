import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import { useUserStatus } from '@/stores/userStatus'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresAuth: false,
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    }
  ],
})

router.beforeEach((to, from, next) => {
  const userStatus = useUserStatus(); // Pinia から状態を取得
  const isLoggedIn = userStatus.isLoggedIn; // 状態をチェック

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 🔐 ログインが必要で未ログイン → ログイン画面へ
    next({ name: 'login' })
  } else if ((to.name === 'login') && isLoggedIn) {
    // ✅ ログイン済みならログイン・登録画面に行かせない → ホームにリダイレクト
    next({ name: 'home' })
  } else {
    // 👍 通常通り遷移
    next()
  }
});

export default router
