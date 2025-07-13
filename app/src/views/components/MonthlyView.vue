<script setup>
  import { onMounted, ref } from 'vue';
  import { collection, doc, getDoc, getDocs} from "firebase/firestore";
  import { db } from '@/assets/firebase.init';
  import { formatNumber } from '../Tools/format';	

  onMounted(() => {
    getTodaySalesTarget(year.value, month.value);
    getDailySales()
    getMediaAgent()
  })

  const mediaAgenciesMonth = ref([]);
  const mediaAgentItems = ref([]);  // 媒体一覧の取得
  const numbers = [...Array(31).keys()].map(i => String(i + 1).padStart(2, '0')); // '01' 〜 '31'
  const year = defineModel('year');      // 親から年を受け取る
  const month = defineModel('month');    // 親から月を受け取る
  const todaySalesTargetAll = ref(null); // 日別売上目標金額の合計格納

  const totalAmount = ref(0);
  const totalGuestCount = ref(0);
  const totalCount = ref(0);

  // 日別売上を月単位で取得
  const getDailySales = async () => {
    const staffSummary = {};

    // 全日のドキュメント取得を並列で実行
    const promises = numbers.map(async (num) => {
      const colRef = collection(db, "daily_sales", year.value, month.value, num, 'records');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => doc.data());
    });

    // 全日のデータが揃うのを待つ
    const allDaysData = await Promise.all(promises);

    // 平坦化して一気に集計
    allDaysData.flat().forEach(data => {
      const staffId = data.staff_in_charge;
      if (!staffSummary[staffId]) {
        staffSummary[staffId] = { amount: 0, guest_count: 0, count: 0 };
      }
      staffSummary[staffId].amount += Number(data.amount) || 0;
      staffSummary[staffId].guest_count += Number(data.guest_count) || 0;
      staffSummary[staffId].count++;


      totalAmount.value += Number(data.amount) || 0;
      totalGuestCount.value += Number(data.guest_count) || 0;
      totalCount.value ++;
    });

    mediaAgenciesMonth.value = Object.entries(staffSummary).map(([staff_in_charge, data]) => ({
      staff_in_charge,
      ...data
    }));
  };

  // 日別売上目標一覧を取得
  const getTodaySalesTarget = async (year, month) => {
    resetData();
    const colRef = collection(db, 'daily_sales_target', year, month);
    const querySnapshot = await getDocs(colRef);

    // 取得した日別売上目標を合計する
    querySnapshot.forEach(doc => {
      todaySalesTargetAll.value += Number(doc.data().day_sales); 
    });
  }

  // 媒体取得
  const getMediaAgent = async () => {
    const docRef = collection(db, 'media_agencies');
    const querySnapshot = await getDocs(docRef);
    mediaAgentItems.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  defineExpose({
    getTodaySalesTarget,
  });
  
  // メディア担当者の名前を取得。該当がなければ空文字を返す
  const mediaAgentMapping = (v) => {
    const item = mediaAgentItems.value.find(item => item.id === v)
    return item?.name || '';
  }
  // 初期化
  const resetData = () => {
    todaySalesTargetAll.value = 0;
  }
</script>

<template>
    <p>月売上目標<span>{{ todaySalesTargetAll ? '：' + formatNumber(todaySalesTargetAll) : '' }}</span></p>
    <v-data-table :items="mediaAgenciesMonth" class="bg-transparent max-h-[300px]" hide-default-header hide-default-footer>
        <template v-slot:item="{ item }">
            <tr class="text-sm text-center border-b">
                <td class="py-1 px-3 w-2/12">{{ mediaAgentMapping(item.staff_in_charge)}}</td>
                <td class="py-1 px-3 w-2/12">{{ item.count}}組</td>
                <td class="py-1 px-3 w-2/12">{{ item.guest_count}}人</td>
                <td class="py-1 px-3 w-4/12">{{ formatNumber(item.amount) }}</td>
            </tr>
        </template>
    </v-data-table>

    <table class="w-full mt-5 mb-5 text-sm text-center">
            <tr class="font-bold">
                <th class="py-1 px-3 w-2/12">合計</th>
                <th class="py-1 px-3 w-2/12">{{ totalCount }}組</th>
                <th class="py-1 px-3 w-2/12">{{ totalGuestCount}}人</th>
                <th class="py-1 px-3 w-4/12">{{ formatNumber(totalAmount) }}</th>
            </tr>
    </table>
</template>
