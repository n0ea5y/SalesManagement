<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav class="bg-red-200 flex justify-around">
        <RouterLink to="/" v-slot="{ isActive}">
          <span :class="isActive ? 'text-blue-600 underline font-bold' : ''">ホーム</span>
        </RouterLink>
        <RouterLink to="/login" v-slot="{ isActive}">
          <span :class="isActive ? 'text-blue-600 underline font-bold' : ''">ログイン</span>
        </RouterLink>
        <RouterLink to="/register" v-slot="{ isActive}">
          <span :class="isActive ? 'text-blue-600 underline font-bold' : ''">新規作成</span>
        </RouterLink>
      </nav>
    </div>
  </header>
  <RouterView />
</template>
