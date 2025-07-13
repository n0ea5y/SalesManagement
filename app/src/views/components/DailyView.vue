<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { getDocs, collection, getDoc, setDoc, doc } from "firebase/firestore";
  import { db } from '@/assets/firebase.init';
  import SmText from '@/components/SmText.vue';
  import SmButton from '@/components/SmButton.vue';
  import { insertToast, updateToast } from '../Tools/Toast';
  import { formatNumber } from '../Tools/format';

  onMounted(() => {
    getMediaAgent();
    getDailySales();
    getDailySalesTarget();
  })

  const emit = defineEmits(['actions']);

  const year = defineModel('year');
  const month = defineModel('month');
  const day = defineModel('day');

  const salesRecordItems = ref([]); // mediaAgentのキーでまとめて格納
  const todaySalesTarget = ref(null);
  const outPutSalesTarget = ref(null);
  const mediaAgentItems = ref([]);  // 媒体一覧の取得
  const totalCount = ref(0);  // 日別の組数
  const totalGuestCount = ref(0);  // 日別の来客数
  const totalAmount = ref(0);  // 日別の金額
  const dialog = ref(false);
  const addMode = ref(true);

  watch([year, month, day], () => {
    getDailySales();
    getDailySalesTarget();
  });

  // 媒体取得
  const getMediaAgent = async () => {
    const docRef = collection(db, 'media_agencies');
    const querySnapshot = await getDocs(docRef);
    mediaAgentItems.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  // 当日の売上目標登録
  const submit = async () => {
    await setDoc(doc(db, 'daily_sales_target', year.value, month.value, day.value), {
      day_sales: todaySalesTarget.value,
    });
    addMode.value ? insertToast() : updateToast();
    dialog.value = false;
    getDailySalesTarget()
    emit('actions');
  }

  // 当日の売上目標取得
  const getDailySalesTarget = async () => {
    const docRef = doc(db, 'daily_sales_target', year.value, month.value, day.value);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      todaySalesTarget.value = docSnap.data().day_sales;
      outPutSalesTarget.value = docSnap.data().day_sales;
      addMode.value = false;
    }
  }

  // 日別売上一覧取得
  const getDailySales = async () => {
    resetData();
    // daily_salesテーブルからデータを取得
    const docRef = collection(db, 'daily_sales', year.value, month.value, day.value, 'records');
    const querySnapshot = await getDocs(docRef);

    // データの加工
    let mediaAgencies = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const mediaId = doc.data().staff_in_charge;
      totalGuestCount.value += Number(data.guest_count);
      totalAmount.value += Number(data.amount);
      totalCount.value++;

      // すでに存在する場合は加算、なければ初期化
      mediaAgencies[mediaId] = mediaAgencies[mediaId] || {
        amount: 0,
        guest_count: 0,
        count: 0,
      };

      mediaAgencies[mediaId].amount += Number(data.amount);
      mediaAgencies[mediaId].guest_count += Number(data.guest_count);
      mediaAgencies[mediaId].count += 1;
    });
    // Object.values で配列化して代入
    salesRecordItems.value = Object.entries(mediaAgencies).map(([mediaId, info]) => ({
      staff_in_charge: mediaId,
      ...info
    }));
  }

  // 初期化関数
  const resetData = () => {
    salesRecordItems.value = []
    totalCount.value = 0
    totalGuestCount.value = 0
    totalAmount.value = 0
    todaySalesTarget.value = 0
    outPutSalesTarget.value = 0
    addMode.value = true;
  }

  // メディア担当者の名前を取得。該当がなければ空文字を返す
  const mediaAgentMapping = (v) => {
    const item = mediaAgentItems.value.find(item => item.id === v)
    return item?.name || '';
  }

</script>

<template>
  <div class="flex justify-between items-center">
    <p>日別売上目標<span :class="outPutSalesTarget ? '' : 'text-red-500'">{{ outPutSalesTarget ? '：' + formatNumber(outPutSalesTarget) : '：設定されていません' }}</span></p>
    <SmButton :type="addMode ? 'store' : 'update'" :label="addMode ? '登録' : '更新'" @click="() => dialog = !dialog">
    </SmButton>

    <v-dialog v-model="dialog" max-width="80%">
      <v-card prepend-icon="mdi-account" title="日別売上設定">
        <div class="w-full pb-5 px-2 mx-auto">
          <form @submit.prevent="submit()">
            <SmText label="目標" v-model="todaySalesTarget" required></SmText>
            <SmButton label="閉じる" htmlType="button" type="none" class="px-4 py-1 mt-5 mr-3"
              @click="() => { dialog = false }" />
            <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
            <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
          </form>
        </div>
      </v-card>
    </v-dialog>
  </div>
  <p></p>
  <v-data-table :items="salesRecordItems" hide-default-header hide-default-footer
    class="bg-transparent max-h-[300px] w-full">
    <template v-slot:item="{ item }">
      <tr class="text-sm text-center border-b">
        <td class="py-1 px-3 w-2/12">{{ mediaAgentMapping(item.staff_in_charge) }}</td>
        <td class="py-1 px-3 w-2/12">{{ item.count }}組</td>
        <td class="py-1 px-3 w-2/12">{{ item.guest_count }}人</td>
        <td class="py-1 px-3 w-4/12">{{ formatNumber(item.amount) }}</td>
      </tr>
    </template>
  </v-data-table>

  <table class="w-full mt-5 mb-5 text-sm text-center">
    <tr class="font-bold">
      <th class="py-1 px-3 w-2/12">合計</th>
      <th class="py-1 px-3 w-2/12">{{ totalCount }}組</th>
      <th class="py-1 px-3 w-2/12">{{ totalGuestCount }}人</th>
      <th class="py-1 px-3 w-4/12">{{ formatNumber(totalAmount) }}</th>
    </tr>
  </table>

</template>