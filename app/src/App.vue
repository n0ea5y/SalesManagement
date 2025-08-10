<script setup>
import { RouterView, useRoute } from 'vue-router'
import AuthLayout from './layouts/AuthLayout.vue';
import HeaderView from '@/views/components/HeaderView.vue';
import { computed } from 'vue';
const vModel = defineModel();
const now = new Date();
let targetDate = new Date(now);
const route = useRoute();
const isHiddenPage = computed(() => {
  return route.path === '/login' || route.path === '/catch-staff-sales';
});
if (now.getHours() < 5) {
  targetDate.setDate(targetDate.getDate() - 1);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
vModel.value = formatDate(targetDate);

function incrementDate() {
  if (!vModel.value) {
    vModel.value = formatDate(new Date());
    return;
  }
  const date = new Date(vModel.value);
  date.setDate(date.getDate() + 1);
  vModel.value = formatDate(date);
}
function decrementDate() {
  if (!vModel.value) {
    vModel.value = formatDate(new Date());
    return;
  }
  const date = new Date(vModel.value);
  date.setDate(date.getDate() - 1);
  vModel.value = formatDate(date);
}
</script>

<template>
  <AuthLayout>
    <HeaderView />
    <div v-if="!isHiddenPage" class="w-[250px] gap-4 mx-auto mt-5 flex">
      <button @click="decrementDate" class="pb-[10px]"><span class="mdi mdi-arrow-left text-[25px]"></span></button>
      <v-text-field label="日付" type="date" variant="underlined" density="compact" v-model="vModel" />
      <button @click="incrementDate" class="pb-[10px]"><span class="mdi mdi-arrow-right text-[25px]"></span></button>
    </div>
  </AuthLayout>
  <RouterView v-slot="{ Component }">
    <component :is="Component" :parentDate="vModel" />
  </RouterView>
</template>