<script setup>
  import SmInput from '@/components/SmInput.vue';
  import SmButton from '@/components/SmButton.vue';
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
      console.log(errorCode)
      console.log(errorMessage)
    });
  }

</script>
<template>
  <DefaultLayout>
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="flex flex-col w-[80%] max-w-md p-6 rounded">
        <form @submit.prevent="submit" class="flex flex-col gap-4">
          <SmInput label="メールアドレス" v-model="email" />
          <SmInput label="パスワード" type="password" v-model="password" />
          <SmButton label="ログイン" />
        </form>
      </div>
    </div>
  </DefaultLayout>
</template>
