// import { fileURLToPath, URL } from 'node:url'
// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//     vueDevTools(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     },
//   },
// })
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue-vendor'
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor' // firebase系は別に
            }
            if (id.includes('lodash')) {
              return 'lodash-vendor'
            }
            // それ以外のnpmパッケージはさらに細分化可
            const directories = id.split('node_modules/')[1].split('/')
            const pkgName = directories[0].startsWith('@')
              ? directories.slice(0, 2).join('/')
              : directories[0]
            return `vendor-${pkgName.replace('@', '')}`
          }
        },
      },
    },
    // chunkSizeWarningLimit: 500, // ワーニング閾値を1MBに引き上げ（任意）
  },
})
