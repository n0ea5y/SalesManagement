import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/firebase.init'
import { userStatus } from './stores/userStatus'
// Vuetify 関連
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Vuetify インスタンス作成
const vuetify = createVuetify({
  components,
  directives,
    icons: {
    defaultSet: 'mdi',
  },
})

// リロードしたときにログイン情報が消えるため下記でfirebaseから再取得している

const app = createApp(App)
let isAppInitialized = false

app.use(createPinia())
const auth = getAuth();
const store = userStatus();

// 認証状態が確定してからマウント＆ルーター利用
onAuthStateChanged(auth, (user) => {
  store.setUser(user)

  if (!isAppInitialized) {
    isAppInitialized = true

    // ルーターガード登録
    router.beforeEach((to, from, next) => {
      if (to.matched.some(record => !record.meta.isPublic) && !store.isLoggedIn) {
        next('/login')
      } else {
        next()
      }
    })

    app.use(router)
    app.use(vuetify)
    app.mount('#app')
  }
})

