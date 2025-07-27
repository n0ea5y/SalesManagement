<script setup>
  import { onMounted, ref } from 'vue';
  import { collection, doc, getDoc, getDocs, onSnapshot} from "firebase/firestore";
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
  let unsubscribeMonthly = [];

const getDailySales = () => {
  const staffSummary = {};
  totalAmount.value = 0;
  totalGuestCount.value = 0;
  totalCount.value = 0;

  // 前回の監視を解除
  unsubscribeMonthly.forEach(unsub => unsub());
  unsubscribeMonthly = [];

  // 各日の records コレクションに onSnapshot を設定
  numbers.forEach((num) => {
    const colRef = collection(db, "daily_sales", year.value, month.value, num, "records");

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      // 初期化
      const tempStaffSummary = {};
      let tempTotalAmount = 0;
      let tempGuestCount = 0;
      let tempTotalCount = 0;

      // 各日分の snapshot を集計
      snapshot.forEach(doc => {
        const data = doc.data();
        const staffId = data.staff_in_charge;

        if (!tempStaffSummary[staffId]) {
          tempStaffSummary[staffId] = { amount: 0, guest_count: 0, count: 0 };
        }

        tempStaffSummary[staffId].amount += Number(data.amount) || 0;
        tempStaffSummary[staffId].guest_count += Number(data.guest_count) || 0;
        tempStaffSummary[staffId].count += 1;

        tempTotalAmount += Number(data.amount) || 0;
        tempGuestCount += Number(data.guest_count) || 0;
        tempTotalCount++;
      });

      // 全体に反映（注意：ここでは日ごとに更新されるため、他日との合算には向かない）
      // → なので全体を再集計する別関数を呼び出すように変更しても良い
      Object.entries(tempStaffSummary).forEach(([id, data]) => {
        if (!staffSummary[id]) {
          staffSummary[id] = { amount: 0, guest_count: 0, count: 0 };
        }
        staffSummary[id].amount += data.amount;
        staffSummary[id].guest_count += data.guest_count;
        staffSummary[id].count += data.count;
      });

      totalAmount.value += tempTotalAmount;
      totalGuestCount.value += tempGuestCount;
      totalCount.value += tempTotalCount;

      mediaAgenciesMonth.value = Object.entries(staffSummary).map(([staff_in_charge, data]) => ({
        staff_in_charge,
        ...data
      }));
    });

    unsubscribeMonthly.push(unsubscribe);
  });
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
