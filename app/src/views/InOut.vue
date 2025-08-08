<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmButton from '@/components/SmButton.vue';
  import SmSelect from '@/components/SmSelect.vue';
  import SmText from '@/components/SmText.vue';
  import { TABLE_NUMBER, GAIHAN_ID, GET_NUMBER, paymentMethods } from './Tools/constants';
  import { db } from '@/assets/firebase.init';
  import { addDoc, collection, getDocs, setDoc, updateDoc, where, doc, onSnapshot, query, deleteDoc } from "firebase/firestore";
  import { computed, onMounted, ref, watch } from 'vue';
  import { insertToast, updateToast, deleteToast } from './Tools/Toast';

  onMounted(() => {
    getMediaAgencies();
    getSalesRecordsRealtime();
    getStaff();
  })
  let unsubscribeSalesRecords = null;

  const dialog = ref(false)         //ダイアログ開閉フラグ
  const salesRecords = ref({});     // 登録データ格納
  const salesRecordItems = ref([]); // 登録データ一覧格納
  const mediaAgencies = ref([]);    // 担当者格納
  const staffItem = ref([]);        // スタッフ一覧格納
  const count = ref(0);             // 登録数格納
  const addMode = ref(true);
  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const year = computed(() => today.value.split('-')[0])
  const month = computed(() => today.value.split('-')[1])
  const day = computed(() => today.value.split('-')[2])

  watch(today, (newVal, oldVal) => {
    getSalesRecordsRealtime();
  })
  
  // テーブルヘッダー
  const headers = [
    {title: '入店時間', key: 'entry_time'},
    {title: '卓番', key: 'table_number'},
    {title: '担当者', key: 'staff_in_charge'},
    {title: 'スタッフ名', key: 'staff_id'},
    {title: '人数', key: 'guest_count'},
    {title: 'プラン', key: 'plan'},
    {title: '支払い方法', key: 'pyment_method'},
    {title: 'ポイント', key: 'point'},
    {title: '金額', key: 'amount'},
    {title: '', key: 'btn-area'},
  ];

  // テーブルrowクリック時
  const rowClick = (item) => {
    salesRecords.value = { ...item }
    dialog.value = true
    addMode.value = false
  }

  // 登録処理
  const submit = async () => {
    await addDoc(collection(db, "daily_sales", year.value, month.value, day.value, 'records'), salesRecords.value);
    getSalesRecordsRealtime();
    dialog.value = false
    insertToast();
  }

  // 更新処理
  const update = async () => {
    const docRef = doc(db, "daily_sales", year.value, month.value, day.value, 'records', salesRecords.value.id);
    await updateDoc(docRef, salesRecords.value);
    getSalesRecordsRealtime();
    dialog.value = false
    updateToast();
  }
  
  // 削除処理
  const remove = async (v) => {
    const deleteFlag = confirm('本当に削除しても良いですか？')
    if(deleteFlag){
      const docRef = doc(db, "daily_sales", year.value, month.value, day.value, 'records', v.id);
      await deleteDoc(docRef);
      getSalesRecordsRealtime();
      deleteToast();
    }
    dialog.value = false
    
  }

  // 登録データ一覧取得
  const getSalesRecordsRealtime = () => {
    const docRef = collection(db, 'daily_sales', year.value, month.value, day.value, 'records');

    // すでに購読中の監視があれば解除
    if (unsubscribeSalesRecords) {
      unsubscribeSalesRecords();
    }

    unsubscribeSalesRecords = onSnapshot(docRef, (querySnapshot) => {
      salesRecordItems.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  };

  // メディアエージェント一覧取得
  const getMediaAgencies = async () => {
    const querySnapshot = await getDocs(collection(db, "media_agencies"));
    mediaAgencies.value = querySnapshot.docs.map((doc) => {
      return {key: doc.id, title: doc.data().name}
    });
  }

  // スタッフ一覧取得(typeが1以外)
  const getStaff = async () => {
    const q = query(collection(db, "staff"), where("type", "!=", "1"));
    const querySnapshot = await getDocs(q);
    staffItem.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // テーブルrow表示(担当者)
  function getMediaAgentTitleByKey(key) {
    const found = mediaAgencies.value.find(item => item.key === key);
    return found ? found.title : null;
  }

  // テーブルrow表示(スタッフ)
  function getStaffNameMapping(key) {
    const found = staffItem.value.find(item => item.id === key);
    return found ? found.name : null;
  }

  // 三桁区切り
  const formatWithCommas = (v) => {
    if(!v) return;
    return '￥' + Number(v).toLocaleString() + '円';
  }

  const pymentMethodMapping = (key) => {
    paymentMethods.find(v => v.key === key)
    const item = paymentMethods.find(v => v.key === key);
    return item ? item.title : null
  }
</script>

<template>
  <AuthLayout>
    <div class="w-1/2 mx-auto m-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>
    <div class="flex overflow-x-auto">
      <v-data-table class="w-full min-w-[1100px]" fixed-header hide-default-footer :headers="headers" :items="salesRecordItems" :items-per-page="-1">
        <template v-slot:item="{item}">
        <tr :class="[!item.amount ? 'bg-red-200': '']">
          <td>{{ item.entry_time }}</td>
          <td>{{ item.table_number.join(',') }}</td>
          <td>{{ getMediaAgentTitleByKey(item.staff_in_charge) }}</td>
          <td>{{ getStaffNameMapping(item.staff_id) }}</td>
          <td>{{ item.guest_count }}</td>
          <td>{{ item.plan }}</td>
          <td>{{ pymentMethodMapping(item.pyment_method) }}</td>
          <td>{{ item.point }}</td>
          <td>{{ formatWithCommas(item.amount)}}</td>
          <td>
            <div class="flex gap-5">
              <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="error" @click="() => { remove(item) }">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M6 7h12M9 7v10a2 2 0 0 0 4 0V7M5 7h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7zM10 4h4m-3 0V3a1 1 0 1 0-2 0v1m6 0V3a1 1 0 1 0-2 0v1" />
                </svg>
              </v-btn>

              <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="#fef08a" @click="() => { rowClick(item) }">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </v-btn>

            </div>
          </td>
        </tr>
       </template> 
      </v-data-table>
    </div>

    <SmButton label="新規登録" class="px-4 py-1 mt-5 mr-3 ml-2" @click="() => {
      addMode = true
      salesRecords = {};
      dialog = true
    }" />
    <v-dialog v-model="dialog">
      <form @submit.prevent="addMode ? submit() : update()">
        <v-card class="flex flex-col gap-5 py-4 px-2">
          <div class="flex gap-5">
            <label for="time">入店時間</label>
            <div class="border px-3">
              <input id="time" type="time" v-model="salesRecords.entry_time">
            </div>
          </div>
          <SmSelect label="卓番" :items="TABLE_NUMBER" v-model="salesRecords.table_number" multiple required></SmSelect>
          <SmSelect label="担当者" :items="mediaAgencies" v-model="salesRecords.staff_in_charge" required></SmSelect>
          <SmSelect v-if="salesRecords.staff_in_charge === GAIHAN_ID" label="スタッフ名" :items="staffItem" itemTitle="name" itemValue="id" v-model="salesRecords.staff_id" :required="salesRecords.staff_in_charge == GAIHAN_ID"></SmSelect>
          <SmSelect label="人数" :items="GET_NUMBER(50)" v-model="salesRecords.guest_count" required></SmSelect>
          <SmText label="プラン" :bordernone="false" v-model="salesRecords.plan" required></SmText>
          <SmSelect label="支払い方法" :items="paymentMethods" v-model="salesRecords.pyment_method" :required="Boolean(salesRecords.amount)"></SmSelect>
          <SmText v-if="salesRecords.pyment_method == 'point'" label="利用ポイント数" :bordernone="false" v-model="salesRecords.point" required></SmText>
          <SmText label="金額" :bordernone="false" v-model="salesRecords.amount" :required="Boolean(salesRecords.pyment_method)"></SmText>
          <div class="flex justify-end gap-2">
            <SmButton :label="addMode ? '登録' : '更新'" class="px-4 py-1 mt-5 mr-3 ml-2" :type="addMode ? 'store': 'update'"/>
            <SmButton label="とじる" htmlType="button" class="px-4 py-1 mt-5 mr-3 ml-2" type="none" @click="() => {
              addMode = true
              salesRecords = {};
              dialog = false
            }" />
          </div>
        </v-card>
      </form>
    </v-dialog>
  </AuthLayout>
</template>