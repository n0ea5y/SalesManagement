<script setup>
  import { RouterView } from 'vue-router'
  import AuthLayout from './layouts/AuthLayout.vue';
  import HeaderView from '@/views/components/HeaderView.vue';
  const vModel = defineModel();
  const now = new Date();
  let targetDate = new Date(now);

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

</script>

<template>
  <AuthLayout>
    <HeaderView />
    <div class="w-[180px] mx-auto mt-5">
      <v-text-field
        label="日付"
        type="date"
        variant="underlined"
        density="compact"
        v-model="vModel"
      />
    </div>
  </AuthLayout>
  <RouterView v-slot="{ Component }">
    <component :is="Component" :parentDate="vModel" />
  </RouterView>
</template>