<script setup>
  import SmInput from '@/components/icons/SmInput.vue';
  import SmButton from '@/components/icons/SmButton.vue';
  import { ref } from 'vue';
  import { createAccount } from '@/firebase/firebaseAccount';

  const email = ref('');
  const password = ref('');

  const createAccountFunc= () => { // we also renamed this method
    createAccount(email.value, password.value, (res) => {
      console.log(res);
    })
  }
</script>

<template>
  <h1>ログイン画面</h1>
  <div class="flex flex-col w-[50%] mx-auto">
    <SmInput label="メールアドレス" v-model="email" />
    <SmInput label="パスワード" type="password" v-model="password" />
    <SmButton @click="createAccountFunc" />
  </div>
</template>
