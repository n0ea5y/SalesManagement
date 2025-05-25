<script setup>
  import SmInput from '@/components/icons/SmInput.vue';
  import SmButton from '@/components/icons/SmButton.vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { ref } from 'vue';
  import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
  import { useRouter } from 'vue-router';
  import { userStatus } from '@/stores/userStatus';

  const email = ref('');
  const password = ref('');
  const auth = getAuth();
  const router = useRouter();
  const status = userStatus();

  const submit = () =>{
    signInWithEmailAndPassword(auth, email.value, password.value)
    .then((res) => {
      status.setUser(res);
      router.push('/');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  }

</script>

<template>
  <DefaultLayout>
    <h1>ログイン画面</h1>
    <div class="flex flex-col w-[50%] mx-auto">
      <form @submit.prevent="submit">
        <SmInput label="メールアドレス" v-model="email" />
        <SmInput label="パスワード" type="password" v-model="password" />
        <SmButton  type="submit"/>
      </form>
    </div>
  </DefaultLayout>
</template>
