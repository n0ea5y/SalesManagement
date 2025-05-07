<script setup>
  import { ref } from 'vue';
  import SmInput from '@/components/icons/SmInput.vue';
  import SmButton from '@/components/icons/SmButton.vue';

  const email = ref('');
  const password = ref('');

  const test = () => {
    console.log('クリックされました');
  }
</script>

<template>
  <h1>ログイン画面</h1>
  <div class="flex flex-col w-[50%] mx-auto">
    <SmInput label="メールアドレス" v-model="email" />
    <SmInput label="パスワード" type="password" v-model="password" />
    <SmButton @click="test" />
  </div>
</template>
