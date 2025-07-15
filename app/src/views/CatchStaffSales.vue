<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmText from '@/components/SmText.vue';
  import { db } from '@/assets/firebase.init';
  import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
  import { formatNumber } from './Tools/format';
  import { onMounted, ref,computed, watch } from 'vue';

  onMounted(() => {
    getDailySales();
    getStaff()
  })
  const numbers = [...Array(31).keys()].map(i => String(i + 1).padStart(2, '0')); // '01' 〜 '31'
  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const year = computed(() => today.value.split('-')[0])
  const month = computed(() => today.value.split('-')[1])
  const day = computed(() => today.value.split('-')[2])
  const catchAmountList = ref([]);
  const staffItems = ref([])

  watch(month, ()  => {
    getDailySales()
  })

  const getStaff = async ()  => {
    const q = query(collection(db, "staff"), where("type", "!=", "1"));
    const querySnapshot = await getDocs(q);
      // 結果を配列に変換して格納
    staffItems.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  const staffMapping = (v) => {
    if(!v) return;
    const staff = staffItems.value.find((item) => item.id === v);
    return staff ? staff.name : '' ;
  }
  const staffReteMapping = (v) => {
    if(!v) return;
    const staff = staffItems.value.find((item) => item.id === v);
    return staff ? staff.commissionRate : '' ;
  }

const amountTest = (amount, rateStr) => {
  if(!amount || !rateStr) return; 
  const rate = Number(rateStr.replace('%', '')) / 100;
  const result = amount * rate;

  console.log('金額:', amount);        // 16000
  console.log('割合:', rateStr);       // "25%"
  console.log('計算結果:', result);    // 4000
  return formatNumber(result);
}
  // 日別売上を月単位で取得
  const getDailySales = async () => {
    const staffSummary = {};

    // 全日のドキュメント取得を並列で実行
    const promises = numbers.map(async (num) => {
      const colRef = query(
      collection(db, "daily_sales", year.value, month.value, num, 'records'), where('staff_in_charge', '==', 'SiBHolMYOW9dzytgYzPW'));
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => doc.data());
    });

    // 全日のデータが揃うのを待つ
    const allDaysData = await Promise.all(promises);

    // 平坦化して一気に集計
    allDaysData.flat().forEach(data => {
      const staffId = data.staff_id;
      if (!staffSummary[staffId]) {
        staffSummary[staffId] = { amount: 0, guest_count: 0, count: 0 };
      }
      staffSummary[staffId].amount += Number(data.amount) || 0;
      staffSummary[staffId].guest_count += Number(data.guest_count) || 0;
      staffSummary[staffId].count++;
    });

    catchAmountList.value = Object.entries(staffSummary).map(([staff_id, data]) => ({
      staff_id,
      ...data
    }));
  };

</script>

<template>
  <AuthLayout>
    <div class="w-[50%] mx-auto mt-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>

  <div class="overflow-x-auto">
    <v-data-table :items="catchAmountList" hide-default-header hide-default-footer class="bg-transparent max-h-[300px] w-full min-w-[500px]">
      <template v-slot:item="{ item }">
        <tr class="text-sm border-b">
          <td class="text-xs">{{ staffMapping(item.staff_id) }}</td>
          <td class="">{{ item.count }}組</td>
          <td class="">{{ item.guest_count }}人</td>
          <td class="">{{ formatNumber(item.amount) }}</td>
          <td class="text-xs">{{ staffReteMapping(item.staff_id) }}</td>
          <td class="text-xs">{{ amountTest(item.amount, staffReteMapping(item.staff_id)) }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
  </AuthLayout>
</template>
