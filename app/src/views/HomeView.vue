<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue';
import SmText from '@/components/SmText.vue';
import { onMounted, ref, watch } from 'vue';
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/assets/firebase.init';

onMounted(() => {
  getDailySalesMaster(today.value);
})

const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
const mediaTotals = ref({});
watch(() => today.value, (newVal) => {
  getDailySalesMaster(newVal);
})

const getDailySalesMaster = async (today) => {
  mediaTotals.value = {};
  const [year, month, day] = today.split('-');
  const yearMonth = `${year}-${month}`;
  const dayCollectionRef = collection(db, 'daily_sales', yearMonth, day);
  const snapshot = await getDocs(dayCollectionRef);


  snapshot.forEach(doc => {
    const data = doc.data();
    const mediaName = data.media_name;
    const amount = Number(data.amount ?? 0);

    if (!mediaTotals.value[mediaName]) {
      mediaTotals.value[mediaName] = 0;
    }

    mediaTotals.value[mediaName] += amount;
  });
}


</script>

<template>
  <AuthLayout>
    <div class="w-[50%] mx-auto mt-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>
    <v-card class="w-[95%] px-2 py-2 mx-auto">
      <p class="text-center mb-4">日別売上</p>
      <div v-if="Object.keys(mediaTotals).length !== 0">
        <template v-for="(total, media) in mediaTotals" :key="media">
          <p>{{ media }} : {{ total.toLocaleString() }}</p>
        </template>
      </div>
      <div v-else>
        <p class="text-center text-red">データが登録されていません</p>
      </div>
    </v-card>
  </AuthLayout>
</template>
