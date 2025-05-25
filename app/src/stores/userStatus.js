import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const userStatus = defineStore('userStatus', () => {
  const user = ref(null);

  const isLoggedIn = computed(() => user.value !== null);

  function setUser(u) {
    user.value = u;
  }

  function clearUser() {
    user.value = null;
  }

  return { user, isLoggedIn, setUser, clearUser };
});
