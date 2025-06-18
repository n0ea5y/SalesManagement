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
watch(() => today.value, (newVal) => {
  getDailySalesMaster(newVal);
})

const getDailySalesMaster = async (today) => {
  const [year, month, day] = today.split('-');
  const yearMont = `${year}_${month}`;
  const docRef = await getDoc(doc(db, "daily_sales", yearMont, "days", day));

  if(docRef.exists()) {
    mediaTotals.value = docRef.data().media;
    totalAmount.value = docRef.data().total;
    totalCount.value = docRef.data().total_count;
  }else{
    mediaTotals.value = [];
    totalAmount.value = 0;
    totalCount.value = 0;
  }
}
  const headers = [
    { title: '媒体', key: 'title' },
    { title: '金額', key: 'value', sortable: false },
  ]
  const formatNumber = (num) => {
    if (num == null || num === '') return ''
    return '￥' + Number(num).toLocaleString() + '円'
  }
</script>

<template>
    <div class="flex gap-5">
      <p v-if="totalAmount" class="font-bold">日売：{{ formatNumber(totalAmount) }}</p>
      <p v-if="totalCount" class="font-bold">人数：{{ totalCount }}人</p>
    </div>
    <v-data-table
        :headers="headers"
        :items="mediaTotals"
        class="bg-transparent max-h-[300px]"
        hide-default-footer
      >
          <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.title }}</td>
            <td>{{ formatNumber(item.value) }}</td>
          </tr>
        </template>
    </v-data-table>
</template>
