<script setup>
  import { ref } from 'vue'
  import { getAuth, signOut } from "firebase/auth";
  import { useRouter } from 'vue-router';
  import { userStatus } from '../../stores/userStatus'

  const adminOpen = ref(false)
  const router = useRouter();
  const store = userStatus();
  const toggleAdmin = () => {
    adminOpen.value = !adminOpen.value
  }

  const menuOpen = ref(false)
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
  }

  const closeMenu = () => {
    menuOpen.value = false
  }

const logout = () => {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      router.push('/login');
    })
    .catch((error) => {
      console.error('ログアウト失敗:', error);
      alert('ログアウトに失敗しました');
    });
}
</script>

<template>
  <nav class="p-4 bg-gray-200 flex gap-5 items-center relative">
    <!-- Always visible -->
     <p  v-if="!store.isLoggedIn" style="background-color: rgb(229, 231, 235); color: black; border-bottom: none; font-weight: bold;" class="text-xl">ラクシメ</p>
      <router-link
      style="background-color: rgb(229, 231, 235); color: black; border-bottom: none; font-weight: bold;"
      v-if="store.isLoggedIn"
      to="/"
      class="px-2 bg-gray-200"><p class="text-xl">ラクシメ</p></router-link>

    <!-- Hamburger or Close icon -->
    <button
      v-if="store.isLoggedIn"
      class="ml-auto md:hidden z-50 relative"
      @click="toggleMenu"
    >
      <span v-if="!menuOpen">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
          <path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
        </svg>
      </span>
      <span v-else>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </span>
    </button>

    <!-- PC用メニュー -->
    <div v-if="store.isLoggedIn" class="hidden md:flex gap-5 ml-5 relative">
      <!-- 管理画面ドロップダウン -->
      <div class="relative" @mouseleave="adminOpen = false">
        <button
          class="hover:underline"
          @click="toggleAdmin"
        >
          管理画面
        </button>

        <!-- ドロップダウンメニュー -->
        <transition name="fade">
          <div
            v-if="adminOpen"
            class="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg py-2 px-2 w-[150px] flex flex-col items-center gap-5 z-10"
          >
            <router-link to="/media-agent" class="hover:underline">集客媒体</router-link>
            <router-link to="/wholesaler" class="hover:underline">卸売業者</router-link>
            <router-link to="/staff" class="hover:underline">スタッフ</router-link>
          </div>
        </transition>
      </div>
    </div>

    <!-- Logout Button (PCのみ) -->
    <button
      v-if="store.isLoggedIn"
      class="ml-auto text-xs border border-solid border-gray-500 rounded py-1 px-2 hidden md:block"
      @click="logout"
    >
      ログアウト
    </button>

    <!-- マスクとモバイルメニュー -->
    <transition v-if="store.isLoggedIn" name="slide">
      <div v-if="menuOpen" class="fixed inset-0 z-40 md:hidden">
        <!-- 黒いマスク -->
        <div
          class="absolute inset-0 bg-black/70"
          @click="closeMenu"
        ></div>

        <!-- メニュー本体 -->
        <div class="absolute top-0 right-0 h-full w-2/4 bg-white flex flex-col shadow-lg z-50">
          <p class="text-center mt-14 text-lg bg-gray-200 py-2 font-bold">管理画面</p>
          <div class="flex flex-col text-center gap-5 px-5 mt-[30px]">
            <router-link class="" to="/media-agent" @click="closeMenu">集客媒体</router-link>
            <router-link to="/wholesaler" @click="closeMenu">卸売業者</router-link>
            <router-link to="/staff" @click="closeMenu">スタッフ</router-link>
          </div>

          <div class="mt-auto mb-10 mx-auto">
            <button class="text-xs border border border-gray-500 rounded py-1 px-10 mt-auto" @click="logout">ログアウト</button>
          </div>

        </div>
      </div>
    </transition>
  </nav>
<div class="flex justify-around text-xs space-x-2 py-1">
  <router-link
    v-if="store.isLoggedIn"
    to="/inout"
    class="px-2 py-1 rounded text-gray-700 border border-gray-300"
  >
    インアウト表
  </router-link>
  <router-link
    v-if="store.isLoggedIn"
    to="/store-wholesaler-sales"
    class="px-2 py-1 rounded text-gray-700 border border-gray-300"
  >
    支払い関連
  </router-link>
  <router-link
    v-if="store.isLoggedIn"
    to="/staff-shift-input"
    class="px-2 py-1 rounded text-gray-700 border border-gray-300"
  >
    勤怠
  </router-link>
  <router-link
    v-if="store.isLoggedIn"
    to="/catch-staff-sales"
    class="px-2 py-1 rounded text-gray-700 border border-gray-300"
  >
    外販売上
  </router-link>
</div>

</template>


<style scoped>
/* フェードイン・アウト用のトランジション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}


/* Transition animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-enter-to {
  transform: translateX(0%);
}
.slide-leave-from {
  transform: translateX(0%);
}
.slide-leave-to {
  transform: translateX(100%);
}

.router-link-active {
  font-weight: bold;
  background-color: gray;
  border-bottom: 2px solid gray; /* タブ感を出すならこれも */
  color: white;
}

</style>
