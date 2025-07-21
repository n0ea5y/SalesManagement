<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import DailyView from './components/DailyView.vue';
  import MonthlyView from './components/MonthlyView.vue';
  import SmText from '@/components/SmText.vue';
  import { computed, ref, watch } from 'vue';
  import SmExcelBtn from '@/components/SmExcelBtn.vue';

  const monthlyViewRef = ref(null)
  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const year = computed(() => today.value.split('-')[0])
  const month = computed(() => today.value.split('-')[1])
  const day = computed(() => today.value.split('-')[2])

  watch(month, async ()  => {
   await monthlyViewRef.value.getTodaySalesTarget(year.value, month.value);
  })

  const actions = async () => {
   await monthlyViewRef.value.getTodaySalesTarget(year.value, month.value);
  }
</script>

<template>
  <AuthLayout>
    <SmExcelBtn label="ExcelDL" :year=year :month="month"></SmExcelBtn>
    <div class="w-[50%] mx-auto mt-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>
    <v-card class="w-[95%] px-2 py-2 mb-10 mx-auto">
    <!-- 日別売上 -->
      <DailyView  v-model:year="year" v-model:month="month" v-model:day="day" @actions="actions()"/>
    </v-card>

    <v-card class="w-[95%] px-2 py-2 mx-auto">
    <!-- つき売上 -->
      <MonthlyView ref="monthlyViewRef" v-model:year="year" v-model:month="month"/>
    </v-card>
  </AuthLayout>
</template>
