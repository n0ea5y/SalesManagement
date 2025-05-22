import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/firebase'
import { useUserStatus } from './stores/userStatus'
import App from './App.vue'
import router from './router'

// アプリ作成と Pinia セットアップ
const app = createApp(App)
const pinia = createPinia()
let isAppMounted = false;
app.use(pinia)
const userStatus = useUserStatus();

// 認証状態の監視は Pinia 初期化後に！
onAuthStateChanged(auth, (user) => {
  if (user) {
    userStatus.setUser(user)
  } else {
    userStatus.clearUser()
  }

  if(!isAppMounted){
    // 認証チェック後に mount するようにすることで、表示チラつきを防げる
    app.use(router)
    app.mount('#app')
    isAppMounted = true;
  }
})
