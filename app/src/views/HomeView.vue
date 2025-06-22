<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import DailyView from './components/DailyView.vue';
  import MonthlyView from './components/MonthlyView.vue';
  import SmText from '@/components/SmText.vue';
  import DailySalesTarget from './components/DailySalesTarget.vue';
  import { onMounted, ref, watch } from 'vue';
  import { getDailyTargetSum } from './Tools/getData';

  onMounted(async () => {
    dailyTargetTotal.value = await getDailyTargetSum(yearMonth.value)
  })

  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const [year, month] = today.value.split('-');
  const yearMonth = ref(`${year}_${month}`);
  const dailyTargetTotal = ref(null);

  watch(() => today.value, (newVal) => {
    const [year, month] = newVal.split('-');
    yearMonth.value = (`${year}_${month}`);
  })

  const action = async () => {
    dailyTargetTotal.value = await getDailyTargetSum(yearMonth.value)
  }

  const formatNumber = (num) => {
      if (num == null || num === '') return ''
      return '￥' + Number(num).toLocaleString() + '円'
  }
</script>

<template>
  <AuthLayout>
    <div class="w-[50%] mx-auto mt-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>
    <v-card class="w-[95%] px-2 py-2 mb-10 mx-auto">
    <!-- 日別売上 -->
      <DailySalesTarget :today="today" @action="action"></DailySalesTarget>
      <DailyView  v-model:today="today"/>
    </v-card>

    <v-card class="w-[95%] px-2 py-2 mx-auto">
    <!-- つき売上 -->
      <div class="relative w-full py-2">
        <p class="mr-auto">月売上目標：{{ dailyTargetTotal ? formatNumber(dailyTargetTotal) : '登録されていません' }}</p>

      </div>
      <MonthlyView v-model:yearMonth="yearMonth"/>
    </v-card>
  </AuthLayout>
</template>
