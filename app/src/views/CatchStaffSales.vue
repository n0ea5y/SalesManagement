<script setup>
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
  import { formatNumber } from './Tools/format';
  import { onMounted, ref } from 'vue';

  const props = defineProps({
    parentDate: String
  })

  onMounted(() => {
    getCatchWorkList();
    // getDailySales();
    getStaff()
  })

  const cacheList = ref([]);    // キャッチ一覧変数
  const catchWorkList = ref([]) // キャッチ実績変数
  const CATCHID = 'SiBHolMYOW9dzytgYzPW'

  // 登録データ一覧取得
  const getCatchWorkList = async () => {
    const startDay = props.parentDate.substring(0, 8) + "01";
    const parts = startDay.split('-');
    const dateObj = new Date(parts[0], parts[1], parts[2]); //翌月の日付を取得
    dateObj.setDate(dateObj.getDate() - 1); // 1日前
    const lastDay = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)}-${dateObj.getDate()}`

    const q = query(collection(db, "daily_sales"),
      where("staff_in_charge", "==", CATCHID),
      where("today", ">=", startDay),
      where("today", "<=", lastDay)
    );

    // リアルタイム監視
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffMap = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const id = data.staff_id;

        if (!staffMap[id]) {
          staffMap[id] = {
            staff_id: id,
            count: 0,
            guest_count: 0,
            amount: 0
          };
        }

        // ここで集計（例：guest_countの合計）
        staffMap[id].guest_count += data.guest_count || 0;
        staffMap[id].amount += parseInt(data.amount) || 0;
        staffMap[id].count++;
      });

      // 最終的に配列として reactive にセット
      catchWorkList.value = Object.values(staffMap);
    });
    return unsubscribe;
  }

  const getStaff = async () => {
    const q = query(collection(db, "staff"), where("type", "!=", "1"));
    const querySnapshot = await getDocs(q);
    // 結果を配列に変換して格納
    cacheList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  const staffMapping = (v) => {
    if (!v) return;
    const staff = cacheList.value.find((item) => item.id === v);
    return staff ? staff.name : '';
  }
  const staffReteMapping = (v) => {
    if (!v) return;
    const staff = cacheList.value.find((item) => item.id === v);
    return staff ? staff.commissionRate : '';
  }

  const amountTest = (amount, rateStr) => {
    if (!amount || !rateStr) return;
    const rate = Number(rateStr.replace('%', '')) / 100;
    const result = amount * rate;
    return formatNumber(Math.floor(result));
  }

  const headers = [
    { title: '名前', key: 'staff_id' },
    { title: '人数', key: 'guest_count' },
    { title: '組数', key: 'count' },
    { title: '歩合', key: 'guest_count' },
    { title: '月売上', key: '' },
    { title: '給料', key: 'plan' },
  ];
</script>

<template>
  <div class="overflow-x-auto">
    <v-data-table :items="catchWorkList" :headers="headers" :items-per-page="-1" hide-default-footer
      class="bg-transparent max-h-[300px] w-full min-w-[600px]">
      <template v-slot:item="{ item }">
        <tr class="text-sm border-b">
          <td class="text-xs">{{ staffMapping(item.staff_id) }}</td>
          <td class="">{{ item.guest_count }}人</td>
          <td class="">{{ item.count }}組</td>
          <td class="text-xs">{{ staffReteMapping(item.staff_id) }}</td>
          <td class="">{{ formatNumber(item.amount) }}</td>
          <td class="text-xs">{{ amountTest(item.amount, staffReteMapping(item.staff_id)) }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>
