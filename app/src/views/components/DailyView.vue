<script setup>
import { onMounted, ref, watch } from 'vue';
import { getDoc, doc } from "firebase/firestore";
import { db } from '@/assets/firebase.init';

onMounted(() => {
  getDailySalesMaster(today.value);
})

const today = defineModel('today')
const mediaTotals = ref([]);
const totalAmount = ref(0);
const totalCount = ref(0);
const totalMediaCount = ref(0);
watch(() => today.value, (newVal) => {
  getDailySalesMaster(newVal);
})

const getDailySalesMaster = async (today) => {
  const [year, month, day] = today.split('-');
  const yearMont = `${year}_${month}`;
  const docRef = await getDoc(doc(db, "daily_sales", yearMont, "days", day));

  if (docRef.exists()) {
    mediaTotals.value = docRef.data().media;
    totalAmount.value = docRef.data().total;
    totalCount.value = docRef.data().total_count;
    totalMediaCount.value = docRef.data().total_media_count;
  } else {
    mediaTotals.value = [];
    totalAmount.value = 0;
    totalCount.value = 0;
    totalMediaCount.value = 0;
  }
}
const formatNumber = (num) => {
  if (num == null || num === '') return ''
  return '￥' + Number(num).toLocaleString() + '円'
}
</script>
<template>
  <div class="relative w-full py-2">
    <p class="text-center">日別売上</p>
    <router-link to="/store-daily-detail"
      class="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500 hover:underline">
      日別目標設定
    </router-link>
  </div>
  <v-data-table :items="mediaTotals" hide-default-header hide-default-footer
    class="bg-transparent max-h-[300px] w-full">
    <template v-slot:item="{ item }">
      <tr class="text-sm text-center border-b">
        <td class="py-1 px-3 w-2/12">{{ item.media_name }}</td>
        <td class="py-1 px-3 w-2/12">{{ item.media_count }}組</td>
        <td class="py-1 px-3 w-2/12">{{ item.people_count }}人</td>
        <td class="py-1 px-3 w-4/12">{{ formatNumber(item.media_amount) }}</td>
      </tr>
    </template>
  </v-data-table>

  <table class="w-full mt-5 mb-5 text-sm text-center">
      <tr class="font-bold">
        <th class="py-1 px-3 w-2/12">合計</th>
        <th class="py-1 px-3 w-2/12">{{ totalMediaCount }}組</th>
        <th class="py-1 px-3 w-2/12">{{ totalCount }}人</th>
        <th class="py-1 px-3 w-4/12">{{ formatNumber(totalAmount) }}</th>
      </tr>
  </table>

</template>