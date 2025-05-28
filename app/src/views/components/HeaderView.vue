<script setup>
  import { getAuth, signOut } from 'firebase/auth';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const logout = () => {
    const auth = getAuth();
    signOut(auth);
    router.push('/login');

  }
</script>

<template>
  <nav class="p-4 bg-gray-200 flex gap-5">
    <router-link to="/" class="">Home</router-link>
    <router-link to="/about" class="">About</router-link>
    <router-link to="/media-agencies" class="">集客媒体</router-link>
    <button class="ml-auto text-xs border border-solid border-gray-500 rounded py-1 px-2" @click="logout">ログアウト</button>
  </nav>
</template>
