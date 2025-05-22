<script setup>
  import SmInput from '@/components/icons/SmInput.vue';
  import SmButton from '@/components/icons/SmButton.vue';
  import { ref } from 'vue';
  import { signIn } from '@/firebase/firebaseAccount';
  import { useUserStatus } from '@/stores/userStatus';
  import { useRouter } from 'vue-router';

  const userStatus = useUserStatus();
  const router = useRouter(); // ✅ ルーター取得
  const email = ref('');
  const password = ref('');

  const singInFunc = () => { // we also renamed this method
    signIn(email.value, password.value, (res) => {
      if(res.user){
        userStatus.setUser(res.user);
        router.push({ name: 'home' }); // ✅ ホームにリダイレクト
      }else{
        console.error(res);
      }
    })
  }
</script>

<template>
  <h1>ログイン画面</h1>
  <div class="flex flex-col w-[50%] mx-auto">
    <SmInput label="メールアドレス" v-model="email" />
    <SmInput label="パスワード" type="password" v-model="password" />
    <SmButton @click="singInFunc" />
  </div>
</template>
