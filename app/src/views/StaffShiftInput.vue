<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmButton from '@/components/SmButton.vue';
  import SmSelect from '@/components/SmSelect.vue';
  import SmText from '@/components/SmText.vue';
  import { onMounted, ref, watch } from 'vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, query, where, addDoc, updateDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
  import { insertToast, updateToast, deleteToast } from './Tools/Toast';

  onMounted(async () => {
    await getStaffMaster();
    await getStaffHoulyWagePayload(today.value);

  })
  const TABLE_NAME = 'staff_hourly_wage';
  const SUB_COLLECTION = 'records';
  const count = ref("001");

  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const dialog = ref(false);
  const staffhourlywage = ref({});
  const staffhourlywageItems = ref([]);
  const staffMaster = ref([]);
  const selectStaff = ref(null)
  const addMode = ref(true);
  const headers = [
    { title: 'スタッフ名', key: 'name' },
    { title: '通常勤務', key: 'before22' },
    { title: '深夜勤務', key: 'after22' },
    { title: '給与', key: 'hourlyWage' },
    { title: '' },
  ];

  watch(today, async (newVal, oldVal) => {
    await getStaffHoulyWagePayload(today.value);
  })
  

  // 更新ボタンが押されたら処理
  const rowClick = (value) => {
    addMode.value = false;
    staffhourlywage.value = { ...value };
    dialog.value = true;

    selectStaff.value = staffMaster.value.find((item) => {
      return item.key === value.name;
    })
  }
  
  const getStaffHoulyWagePayload = async (today) => {
    const subCollection = collection(db, TABLE_NAME, today, SUB_COLLECTION);
    const querySnapshot = await getDocs(subCollection);
    count.value = (querySnapshot.size + 1).toString().padStart(3, '0');
    staffhourlywageItems.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
  
  const submit = async () => {
    await setDoc(doc(db, TABLE_NAME, today.value, SUB_COLLECTION, count.value), setStaffHoulyWagePayload());
    await afterSubmitOrUpdate(today.value);
    insertToast();
  }

  const update = async () => {
    await setDoc(doc(db, TABLE_NAME, today.value, SUB_COLLECTION, staffhourlywage.value.id), setStaffHoulyWagePayload());
    await afterSubmitOrUpdate(today.value);
    updateToast();
  }
  // 削除処理
  const remove = async (value) => {
    const result = confirm('本当に削除しても良いですか？');
    if (!result) return;
    await deleteDoc(doc(db, TABLE_NAME, today.value, SUB_COLLECTION, value.id));
    await afterSubmitOrUpdate();
    deleteToast();
    addMode.value = true;
  };

  // 登録、更新後に行う処理
  const afterSubmitOrUpdate = async () => {
    staffhourlywage.value = {}
    selectStaff.value = []
    dialog.value = false;
    await getStaffHoulyWagePayload(today.value);
  }

  const setStaffHoulyWagePayload = () => ({
    'name': staffhourlywage.value.name ?? null,
    'before22': staffhourlywage.value.before22 ?? null,
    'after22': staffhourlywage.value.after22 ?? null,
  })

  watch(() => selectStaff.value, (newVal) => {
    if (!newVal) return;

    staffhourlywage.value.name = newVal.key;
    staffhourlywage.value.hourly_wage = newVal.hourly_wage ?? 0;

    const hourly = staffhourlywage.value.hourly_wage;
    const before = parseFloat(staffhourlywage.value.before22) || 0;
    const after = parseFloat(staffhourlywage.value.after22) || 0;

    staffhourlywage.value.salary = (before * hourly) + (after * hourly * 1.25);
  }, { immediate: true });

watch(
  () => [staffhourlywage.value.before22, staffhourlywage.value.after22],
  ([before, after]) => {
    const b = parseFloat(before) || 0;
    const a = parseFloat(after) || 0;
    const h = parseFloat(staffhourlywage.value.hourly_wage) || 0;

    staffhourlywage.value.salary = (b * h) + (a * h * 1.25);
  }
);

const times = Array.from({ length: 41 }, (_, i) => {
  const time = (i * 0.25).toFixed(2);
  const numTime = parseFloat(time); // for accurate math
  const hours = Math.floor(numTime);
  const minutes = Math.round((numTime - hours) * 60);

  let display;
  if (i === 0) {
    display = '0分';
  } else {
    display = minutes === 0
      ? `${hours}時間`
      : `${hours > 0 ? `${hours}時間` : ''}${minutes}分`;
  }

  return { title: `${time} (${display})`, key: time };
});
  const getStaffMaster = async () => {
    const q = query(collection(db, "staff"), where("type", "!=", "2"));
    const querySnapshot = await getDocs(q);
    staffMaster.value = querySnapshot.docs.map((doc) => {
      return { 'key': doc.id, 'name': doc.data().name, 'title': doc.data().name, 'hourly_wage': doc.data().hourly_wage };
    });
  }
  const formatNumber = (num) => {
    if (num == null || num === '') return ''
    return '￥' + Number(num).toLocaleString() + '円'
  }
  const test = (item) => {
    console.log(item);
  }

  const staffMapping = (v) => {
    if (!staffMaster.value) return ''

    const list = Object.values(staffMaster.value)
    const match = list.find(item => item.key === v)
    return match ? match.name : ''
  }
</script>

<template>
  <AuthLayout>
    <div class="w-1/2 mx-auto m-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>
    <div class=" overflow-x-auto">
      <v-data-table 
        :headers="headers" 
        :items="staffhourlywageItems"
        class="min-w-[620px]"
        fixed-header  
        hide-default-footer
      >
      <template v-slot:item="{ item }">
        <tr>
          <td class="w-[1/4]">{{ staffMapping(item.name) }}</td>
          <td class="w-[1/4]">{{ item.before22}}</td>
          <td class="w-[1/4]">{{ item.after22 }}</td>
          <td class="w-[1/4]">{{ formatNumber((item.before22 * 1000) + (item.after22 * (1000 * 1.25)))}}</td>
          <td class="flex gap-4 items-center w-[110px]">
              <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="error" @click="() => { remove(item) }">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M6 7h12M9 7v10a2 2 0 0 0 4 0V7M5 7h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7zM10 4h4m-3 0V3a1 1 0 1 0-2 0v1m6 0V3a1 1 0 1 0-2 0v1" />
                </svg>
              </v-btn>

              <!-- 更新ボタン -->
              <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="#fef08a" @click="() => { rowClick(item) }">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </v-btn>
          </td>
        </tr>

      </template>
      </v-data-table>
    </div>
      <SmButton label="新規登録" class="px-4 py-1 mt-5 mr-3 ml-2" @click="() => {
        addMode = true
        staffhourlywage = {};
        dialog = true
      }" />
      <v-dialog v-model="dialog" max-width="80%">
        <v-card prepend-icon="mdi-account" title="勤務時間入力">
          <div class="w-full pb-5 px-2 mx-auto">
            <form @submit.prevent="addMode ? submit() : update()">
              <div class="flex flex-col w-full">
                <SmSelect label="スタッフ" v-model="selectStaff" :items="staffMaster" return-obj @change="test"></SmSelect>
                <SmSelect label="通常勤務" v-model="staffhourlywage.before22" :items="times"></SmSelect>
                <SmSelect label="深夜勤務" v-model="staffhourlywage.after22" :items="times"></SmSelect>
              </div>
              <SmButton label="閉じる" htmlType="button" type="none" class="px-4 py-1 mt-5 mr-3" @click="() => {
                dialog = false
                addMode = true
                staffhourlywage = {};
                selectStaff = [];
              }" />
              <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
              <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
            </form>
          </div>
        </v-card>
      </v-dialog>
  </AuthLayout>
</template>