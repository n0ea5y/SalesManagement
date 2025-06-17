<script setup>
import AuthLayout from '@/layouts/AuthLayout.vue';
import SmButton from '@/components/SmButton.vue';
import SmTable from '../components/SmTable.vue';
import SmText from '@/components/SmText.vue';
import SmSelect from '@/components/SmSelect.vue';
import { db } from '@/assets/firebase.init';
import { collection, getDocs, setDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { onMounted, ref, watch } from 'vue';
import { insertToast, updateToast } from './Tools/Toast';
import { shallowRef } from 'vue'

onMounted(async () => {
  await getDailySalesMaster(today.value);
  await getMediaAgentMaster();
  await getStaffMaster();
});

const dailySales = ref([]);
const todaySale = ref({});
const mediaAgencies = ref([]);
const staffMaster = ref([]);
const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
const addMode = ref(true);
const dialog = shallowRef(false)
const count = ref(null);

watch(() => today.value, (newVal) => {
  getDailySalesMaster(newVal);
})

const rowClick = (value) => {
  addMode.value = false;
  todaySale.value = { ...value };
  dialog.value = true;
}

const submit = async () => {
  const [year, month, day] = today.value.split('-');
  const year_month = `${year}-${month}`;
  const subCollectionNameDay = day;
  await setDoc(doc(db, `daily_sales`, year_month, subCollectionNameDay, count.value), {
    'in_time': todaySale.value.in_time,
    'table_number': todaySale.value.table_number,
    'media_name': todaySale.value.media_name,
    'staff_name': todaySale.value.staff_name ?? null,
    'people_count': todaySale.value.people_count,
    'plan': todaySale.value.plan,
    'otoshi': todaySale.value.otoshi,
    'food': todaySale.value.food,
    'amount': todaySale.value.amount ?? null,
  });
  todaySale.value = {}
  dialog.value = false;
  insertToast();
  getDailySalesMaster(today.value);
}

const update = async () => {
  const [year, month, day] = today.value.split('-');
  const year_month = `${year}-${month}`;
  await updateDoc(doc(db, `daily_sales`, year_month, day, todaySale.value.id), {
    'in_time': todaySale.value.in_time,
    'table_number': todaySale.value.table_number,
    'media_name': todaySale.value.media_name,
    'staff_name': todaySale.value.staff_name ?? null,
    'people_count': todaySale.value.people_count,
    'plan': todaySale.value.plan,
    'otoshi': todaySale.value.otoshi,
    'food': todaySale.value.food,
    'amount': todaySale.value.amount,
  });
  todaySale.value = {}
  dialog.value = false;
  getDailySalesMaster(today.value);
  updateToast();
  addMode.value = true;
}

const getMediaAgentMaster = async () => {
  const querySnapshot = await getDocs(collection(db, "media_agencies"));
  mediaAgencies.value = querySnapshot.docs.map((doc) => {
    return { 'key': doc.id, 'title': doc.data().name };
  });
}

const getDailySalesMaster = async (today) => {
const [year, month, day] = today.split('-');
const year_month = `${year}-${month}`;
const subCollectionRef = collection(db, "daily_sales", year_month, day);
const q = query(subCollectionRef);
const querySnapshot = await getDocs(q);
count.value = (querySnapshot.size + 1).toString().padStart(3, '0');
  dailySales.value = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      in_time: data.in_time,
      table_number: data.table_number,
      media_name: data.media_name,
      staff_name: data.staff_name ?? null,
      people_count: data.people_count,
      plan: data.plan,
      otoshi: data.otoshi,
      food: data.food,
      amount: data.amount,
    };
  });
}

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
    <SmTable :headers="headers" :items="dailySales" inout action w_overflow @rowClick="(item) => { rowClick(item) }" />
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
                <input id="timer" type="time" class="h-[60px] border rounded w-[180px]" v-model="todaySale.in_time" />
              </div>
              <SmSelect label="担当者" :items="mediaAgencies" itemValue="name" v-model="todaySale.media_name" require>
              </SmSelect>
              <SmSelect v-if="todaySale.media_name == '外販'" label="スタッフ名" :items="staffMaster"
                v-model="todaySale.staff_name" itemValue="name" :require="todaySale.media_name == '外販'"></SmSelect>
              <SmText label="プラン" v-model="todaySale.plan" require></SmText>
              <div class="flex flex-wrap">
                <div class="flex gap-2 w-full">
                  <SmText label="卓番" v-model="todaySale.table_number" require></SmText>
                  <SmText label="お通し" v-model="todaySale.otoshi" require></SmText>
                </div>
                <div class="flex gap-2 w-full">
                  <SmText label="F" v-model="todaySale.food" require></SmText>
                  <SmText label="人数" v-model="todaySale.people_count" require></SmText>
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
