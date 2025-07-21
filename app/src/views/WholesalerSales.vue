<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmButton from '@/components/SmButton.vue';
  import SmText from '@/components/SmText.vue';
  import SmSelect from '@/components/SmSelect.vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, setDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
  import { onMounted, ref, watch } from 'vue';
  import { insertToast, updateToast, deleteToast } from './Tools/Toast';
  import { shallowRef } from 'vue'

  onMounted(async () => {
    await getDailySalesMaster(today.value);
    await getMediaAgentMaster();
    await getWholesalerMaster();
  });

  const TABLE_NAME = 'whole_sales';
  const SUB_COLLECTION = 'records';

  const dailySales = ref([]);
  const todaySale = ref({});
  const mediaAgencies = ref([]);
  const totalAmount = ref({});
  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const addMode = ref(true);
  const dialog = shallowRef(false)
  const count = ref(null);
  const wholesalers = ref([]);


  const getWholesalerMaster = async () => {
    const querySnapshot = await getDocs(collection(db, "wholesalers"));
    wholesalers.value = querySnapshot.docs.map((doc) => {
      console.log(doc.id)
      return { 'key': doc.id, 'title': doc.data().name };
    });
  }

  // 日付が変わったらデータの取得を行う
  watch(() => today.value, (newVal) => {
    getDailySalesMaster(newVal);
  })

  // 更新ボタンが押されたら処理
  const rowClick = (value) => {
    console.log(value)
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
    const yearMont = `${year}_${month}`;
    await setDoc(doc(db, 'total_wholesaler_sales', yearMont, 'days', day), totalAmount.value);
  }

  // 登録データ
  const getSalePayload = () => ({
    'key': todaySale.value.key ?? null,
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
    // 合計金額
    const total = dailySales.value.reduce((sum, { amount }) => {
      return sum + Number(amount ?? 0);
    }, 0);

    const mediaMap = new Map();

    dailySales.value.forEach(({ key, amount }) => {
      const media = key ?? '不明';
      const amt = Number(amount ?? 0);

      if (!mediaMap.has(media)) {
        mediaMap.set(media, {
          media_amount: 0,      // 金額合計
        });
      }

      const current = mediaMap.get(media);
      current.media_amount += amt;

      mediaMap.set(media, current); // 上書き
    });

    const media = Array.from(mediaMap.entries()).map(([media_name, data]) => ({
      media_name,
      media_amount: data.media_amount,
    }));

    totalAmount.value = { total, media };
  }

  // 媒体全取得
  const getMediaAgentMaster = async () => {
    const querySnapshot = await getDocs(collection(db, "media_agencies"));
    mediaAgencies.value = querySnapshot.docs.map((doc) => {
      return { 'key': doc.id, 'title': doc.data().name };
    });
  }

  const headers = [
    { title: '業者名', key: 'key' },
    { title: '支払額', key: 'amount', sortable: false },
    { title: '', key: 'action', width: '10px', sortable: false },
  ];

const wholeMapping = (v) => {
  if (!wholesalers.value) return ''

  const list = Object.values(wholesalers.value)
  const match = list.find(item => item.key === v)

  return match ? match.title : ''
}
  const formatNumber = (num) => {
    if (num == null || num === '') return ''
    return '￥' + Number(num).toLocaleString() + '円'
  }
</script>

<template>
  <AuthLayout>
    <div class="w-1/2 mx-auto m-[-10px]">
      <SmText type="date" bordernone v-model="today"></SmText>
    </div>
    <v-data-table :headers="headers" :items="dailySales" class="bg-transparent max-h-[300px]" fixed-header
      hide-default-footer>

      <template v-slot:item="{ item }">
        <tr>
          <td>{{ wholeMapping(item.key) }}</td>
          <td>{{ formatNumber(item.amount) }}</td>
          <td class="flex gap-4 items-center">
            <!-- 削除ボタン -->
            <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="error"
              @click="() => { remove(item) }">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6 7h12M9 7v10a2 2 0 0 0 4 0V7M5 7h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7zM10 4h4m-3 0V3a1 1 0 1 0-2 0v1m6 0V3a1 1 0 1 0-2 0v1" />
              </svg>
            </v-btn>

            <!-- 更新ボタン -->
            <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="#fef08a"
              @click="() => { rowClick(item) }">
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
    <SmButton label="新規登録" class="px-4 py-1 mt-5 mr-3 ml-2" @click="() => {
      addMode = true
      todaySale = {};
      dialog = true
    }" />
    <v-dialog v-model="dialog" max-width="80%">
      <v-card prepend-icon="mdi-account" title="業者支払い入力">
        <div class="w-full pb-5 px-2 mx-auto">
          <form @submit.prevent="addMode ? submit() : update()">
            <div class="flex flex-col w-full">
              <SmSelect label="業者" v-model="todaySale.key" :items="wholesalers" ></SmSelect>
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
