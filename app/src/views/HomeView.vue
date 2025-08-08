<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import DailyView from './components/DailyView.vue';
  import MonthlyView from './components/MonthlyView.vue';
  import SmText from '@/components/SmText.vue';
  import { computed, ref, watch } from 'vue';
  import SmExcelBtn from '@/components/SmExcelBtn.vue';
  import axios from 'axios'

  const text = ref('')

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

  const test = async () => {
      if(!text.value) {
        text.value = '文言が未設定です'
      }
  try {
    const res = await axios.post(
      'https://hw185yp245.execute-api.us-east-1.amazonaws.com/yokkoisho_omiya_api_line_bot/yokkoisho',
      { message: text.value }
    );
    console.log(res.data);
  } catch (error) {
    console.error(error);
  }
};

</script>

<template>
  <AuthLayout>
    <div>
      <v-text-field label="line botで送信する文言設定して" v-model="text"></v-text-field>
      <v-btn @click="test">SEND</v-btn>
    </div>
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
    <div class="text-end w-[98%] px-2 mt-[20px]">
      <SmExcelBtn label="ExcelDL" :year=year :month="month"></SmExcelBtn>
    </div>
  </AuthLayout>
</template>
