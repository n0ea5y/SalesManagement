<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import DailyView from './components/DailyView.vue';
  import MonthlyView from './components/MonthlyView.vue';
  import SmText from '@/components/SmText.vue';
  import { ref } from 'vue';

  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const [year, month] = today.value.split('-');

  const yearMonth = ref(`${year}_${month}`);
</script>

<template>
  <AuthLayout>
    <div class="w-[50%] mx-auto mt-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>
    <v-card class="w-[95%] px-2 py-2 mb-10 mx-auto">
    <!-- 日別売上 -->
      <DailyView  v-model:today="today"/>
    </v-card>

    <v-card class="w-[95%] px-2 py-2 mx-auto">
    <!-- つき売上 -->
      <MonthlyView v-model:yearMonth="yearMonth"/>
    </v-card>
  </AuthLayout>
</template>
