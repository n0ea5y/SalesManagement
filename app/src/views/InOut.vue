<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmButton from '@/components/SmButton.vue';
  import SmTable from '../components/SmTable.vue';
  import SmText from '@/components/SmText.vue';
  import SmSelect from '@/components/SmSelect.vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, setDoc, updateDoc, doc, query, where, deleteDoc } from "firebase/firestore";
  import { onMounted, ref, watch } from 'vue';
  import { insertToast, updateToast, deleteToast } from './Tools/Toast';
  import { shallowRef } from 'vue'

  onMounted(async () => {
    await getDailySalesMaster(today.value);
    await getMediaAgentMaster();
    await getStaffMaster();
  });

  const TABLE_NAME = 'sales';
  const SUB_COLLECTION = 'records';

  const dailySales = ref([]);
  const todaySale = ref({});
  const mediaAgencies = ref([]);
  const staffMaster = ref([]);
  const totalAmount = ref(0);
  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const addMode = ref(true);
  const dialog = shallowRef(false)
  const count = ref(null);

  // 日付が変わったらデータの取得を行う
  watch(() => today.value, (newVal) => {
    getDailySalesMaster(newVal);
  })

  // 更新ボタンが押されたら処理
  const rowClick = (value) => {
    addMode.value = false;
    todaySale.value = { ...value };
    dialog.value = true;

    totalAmountSubmit();
  }

  // 登録処理
  const submit = async () => {
    await setDoc(doc(db, TABLE_NAME, today.value, SUB_COLLECTION, count.value), getSalePayload());
    await afterSubmitOrUpdate();
    await totalAmountSubmit();
    insertToast();
  }

  // 更新処理
  const update = async () => {
    await updateDoc(doc(db, TABLE_NAME, today.value, SUB_COLLECTION, todaySale.value.id), getSalePayload());
    await afterSubmitOrUpdate();
    await totalAmountSubmit();
    updateToast();
    addMode.value = true;
  }

  // 削除処理
  const remove = async (value) => {
    const result = confirm('本当に削除しても良いですか？');
    if (!result) return;
    await deleteDoc(doc(db, TABLE_NAME, today.value, SUB_COLLECTION, value.id));
    await afterSubmitOrUpdate();
    await totalAmountSubmit();
    deleteToast();
    addMode.value = true;
  };

  // 当日の売上登録
  const totalAmountSubmit = async () => {
    const [year, month, day] = today.value.split('-');
    await setDoc(doc(db, 'monthly_sales', `${year}-${month}`), {
      total_amount: totalAmount.value,
    });
  }

  // 登録データ
  const getSalePayload = () => ({
    'in_time': todaySale.value.in_time,
    'table_number': todaySale.value.table_number,
    'media_name': todaySale.value.media_name,
    'staff_name': todaySale.value.staff_name ?? null,
    'people_count': todaySale.value.people_count,
    'plan': todaySale.value.plan,
    'otoshi': todaySale.value.otoshi,
    'food': todaySale.value.food,
    'amount': todaySale.value.amount ?? null,
  })

  // 登録、更新後に行う処理
  const afterSubmitOrUpdate = async () => {
    todaySale.value = {}
    dialog.value = false;
    await getDailySalesMaster(today.value);
  }

  // 日別データ取得
  const getDailySalesMaster = async (today) => {
    const subCollection = collection(db, TABLE_NAME, today, SUB_COLLECTION);
    const querySnapshot = await getDocs(subCollection);
    count.value = (querySnapshot.size + 1).toString().padStart(3, '0');
    dailySales.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      staff_name: doc.data().staff_name ?? null,
    }));

    // 合計金額を計算
    totalAmount.value = dailySales.value.reduce((sum, sale) => {
      const amount = Number(sale.amount ?? 0);
      return sum + amount;
    }, 0);
  }

  // 媒体全取得
  const getMediaAgentMaster = async () => {
    const querySnapshot = await getDocs(collection(db, "media_agencies"));
    mediaAgencies.value = querySnapshot.docs.map((doc) => {
      return { 'key': doc.id, 'title': doc.data().name };
    });
  }

  // スタッフ取得
  const getStaffMaster = async () => {
    const q = query(collection(db, "staff"), where("type", "!=", "1"));
    const querySnapshot = await getDocs(q);
    staffMaster.value = querySnapshot.docs.map((doc) => {
      return { 'key': doc.id, 'title': doc.data().name };
    });
  }

  const headers = [
    { title: 'IN', key: 'in_time' },
    { title: '卓番', key: 'table_number', sortable: false },
    { title: '担当者', key: 'media_name', sortable: false },
    { title: 'スタッフ名', key: 'staff_name', sortable: false },
    { title: '人数', key: 'people_count', sortable: false },
    { title: 'プラン', key: 'plan', sortable: false },
    { title: 'お通し', key: 'otoshi', sortable: false },
    { title: 'F', key: 'food', sortable: false },
    { title: '金額', key: 'amount', sortable: false },
    { title: '', key: 'action', width: '10px', sortable: false },
  ];
</script>

<template>
  <AuthLayout>
    <div class="w-1/2 mx-auto m-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>
    <SmTable :headers="headers" :items="dailySales" height="800px" inout action w_overflow
      @rowClick="(item) => { rowClick(item) }" @deleteRow="(item) => { remove(item) }" />
    <SmButton label="新規登録" class="px-4 py-1 mt-5 mr-3 ml-2" @click="() => {
      addMode = true
      todaySale = {};
      dialog = true
    }" />

    <v-dialog v-model="dialog" max-width="80%">
      <v-card prepend-icon="mdi-account" title="インアウト表入力">
        <div class="w-full pb-5 px-2 mx-auto">
          <form @submit.prevent="addMode ? submit() : update()">
            <div class="flex flex-col w-full">
              <div class="flex gap-5 mb-4">
                <label for="timer" class="flex items-center">IN</label>
                <input id="timer" type="time" class="h-[60px] border rounded w-[180px]" v-model="todaySale.in_time"
                  required />
              </div>
              <SmSelect label="担当者" :items="mediaAgencies" itemValue="name" v-model="todaySale.media_name" required>
              </SmSelect>
              <SmSelect v-if="todaySale.media_name == '外販'" label="スタッフ名" :items="staffMaster"
                v-model="todaySale.staff_name" itemValue="name" :required="todaySale.media_name == '外販'"></SmSelect>
              <SmText label="プラン" v-model="todaySale.plan" required></SmText>
              <div class="flex flex-wrap">
                <div class="flex gap-2 w-full">
                  <SmText label="卓番" v-model="todaySale.table_number" required></SmText>
                  <SmText label="お通し" v-model="todaySale.otoshi" required></SmText>
                </div>
                <div class="flex gap-2 w-full">
                  <SmText label="F" v-model="todaySale.food" required></SmText>
                  <SmText label="人数" v-model="todaySale.people_count" required></SmText>
                </div>
              </div>
              <SmText label="金額" v-model="todaySale.amount"></SmText>
            </div>
            <SmButton label="閉じる" htmlType="button" type="none" class="px-4 py-1 mt-5 mr-3" @click="() => {
              addMode = true
              dialog = false
              todaySale = {};
            }" />
            <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
            <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
          </form>
        </div>
      </v-card>
    </v-dialog>
  </AuthLayout>
</template>
