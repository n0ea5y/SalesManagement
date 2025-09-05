<script setup>
  import DailyView from './components/DailyView.vue';
  import MonthlyView from './components/MonthlyView.vue';
  import CacheDay from './components/CacheDay.vue';
  import SmText from '@/components/SmText.vue';
  import LineBtn from '@/components/LineBtn.vue';
  import EmployeeView from './components/EmployeeView.vue';
  import DailyWhole from './components/DailyWhole.vue';
  import DailySalary from './components/DailySalary.vue';
  import { formatNumber } from './Tools/format';
  import { computed, onMounted, ref, watch } from 'vue';
  import { db } from '@/assets/firebase.init';
  import { addDoc, collection, updateDoc, where, doc, onSnapshot, query, limit} from "firebase/firestore";
  import SmExcelBtn from '@/components/SmExcelBtn.vue';
  import axios from 'axios'
  import SmButton from '@/components/SmButton.vue';
  import { insertToast, updateToast } from './Tools/Toast';
  
  const props = defineProps({
    parentDate: String
  })

  onMounted(() => {
    getDailySalesTarget()
  })

  const text = ref('')

  const dailySalesTarget = ref({today: props.parentDate})
  const dailySale = ref({});
  const dialog = ref(false);
  const addMode = computed(() => {
  return !dailySale.value[0]?.target_sales;
});

  watch(() => props.parentDate, (newVal) => {
    dailySalesTarget.value.today = newVal
    getDailySalesTarget();
  })

  // 当日の売上目標登録
  const submit = async () => {
    await addDoc(collection(db, 'daily_sales_target'), dailySalesTarget.value);
    dialog.value = false;
    insertToast();
  }

  // 更新処理
  const update = async () => {
    const docRef = doc(db, "daily_sales_target", dailySalesTarget.value.id);
    await updateDoc(docRef, dailySalesTarget.value);
    dialog.value = false;
    updateToast();
  }

  const getDailySalesTarget = () => {
    const docRef = collection(db, "daily_sales_target");
    const q = query(
      docRef,
      where("today", "==", props.parentDate),
      limit(1),
    );
    // リアルタイム監視
    const unsubscribe = onSnapshot(q, (snapshot) => {
      dailySale.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });

    return unsubscribe;
  }

  watch(() => dailySale.value , (newVal) => {
    if(newVal.length == 0)return;
    dailySalesTarget.value = { ...newVal[0]};
  })

  const test = async () => {
      if(!text.value) {
        text.value = '文言が未設定です'
      }
  try {
    const res = await axios.post(
      'https://hw185yp245.execute-api.us-east-1.amazonaws.com/yokkoisho_omiya_api_line_bot/yokkoisho',
      { message: text.value }
    );
  } catch (error) {
    console.error(error);
  }
};

</script>

<template>
      <v-card class="w-[98%] px-4 py-2 mx-auto mb-5">
        <EmployeeView v-bind:parent-date="parentDate"></EmployeeView>
      </v-card>

      <v-card class="w-[98%] px-4 py-2 mx-auto mb-5">
        <div class="flex justify-between items-center">
            <p>日別売上目標：<span :class="dailySale[0]?.target_sales ? '' : 'text-red-500'">{{ dailySale[0]?.target_sales ? formatNumber(dailySale[0]?.target_sales) : '未入力' }}</span></p>
            <SmButton :type="addMode ? 'store' : 'update'" :label="addMode ? '登録' : '更新'" @click="() => dialog = !dialog"></SmButton>
        </div>
      </v-card>

    <v-dialog v-model="dialog" max-width="80%">
      <v-card prepend-icon="mdi-account" title="日別売上設定">
        <div class="w-full pb-5 px-2 mx-auto">
          <form @submit.prevent="addMode ? submit() : update()">
            <SmText label="日別売上目標" v-model="dailySalesTarget.target_sales" required></SmText>
            <SmButton label="閉じる" htmlType="button" type="none" class="px-4 py-1 mt-5 mr-3" @click="() => { dialog = false }" />
            <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
            <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
          </form>
        </div>
      </v-card>
    </v-dialog>

    <v-card class="w-[98%] mx-auto mb-5 py-2">
      <div class="flex flex-col gap-4">
        <CacheDay v-bind:parent-date="parentDate"></CacheDay>
        <DailyView v-bind:parent-date="parentDate"/>
        <DailyWhole v-bind:parent-date="parentDate"></DailyWhole>
        <DailySalary v-bind:parent-date="parentDate"></DailySalary>
      </div>
    </v-card>
    
    <div class="mb-10">
      <MonthlyView v-bind:parent-date="parentDate"/>
    </div>

    <div class="flex justify-around pb-5">
      <SmExcelBtn v-bind:parent-date="parentDate"></SmExcelBtn>
      <LineBtn v-bind:parent-date="parentDate"></LineBtn>
    </div>
</template>