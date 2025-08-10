<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmButton from '@/components/SmButton.vue';
  import SmText from '@/components/SmText.vue';
  import SmSelect from '@/components/SmSelect.vue';
  import { db } from '@/assets/firebase.init';
  import { addDoc, collection, getDocs,onSnapshot, updateDoc, doc, deleteDoc, query, where } from "firebase/firestore";
  import { onMounted, ref, watch } from 'vue';
  import { insertToast, updateToast, deleteToast } from './Tools/Toast';
  import { shallowRef } from 'vue'

  const props = defineProps({
    parentDate: String
  })

  onMounted(async () => {
    await getDailySalesMaster();
    await getMediaAgentMaster();
    await getWholesalerMaster();
  });

  const TABLE_NAME = 'whole_sales';

  const dailySales = ref([]);
  const todaySale = ref({today: props.parentDate});
  const mediaAgencies = ref([]);
  const today = ref(new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replaceAll('/', '-'))
  const addMode = ref(true);
  const dialog = shallowRef(false)
  const wholesalers = ref([]);

  watch(() => props.parentDate, (newVal) => {
    todaySale.value = {
      today: newVal,
    }
    getDailySalesMaster();
  });
  const getWholesalerMaster = async () => {
    const querySnapshot = await getDocs(collection(db, "wholesalers"));
    wholesalers.value = querySnapshot.docs.map((doc) => {
      return { 'key': doc.id, 'title': doc.data().name };
    });
  }

  // 日付が変わったらデータの取得を行う
  watch(() => today.value, (newVal) => {
    getDailySalesMaster();
  })

  // 更新ボタンが押されたら処理
  const rowClick = (value) => {
    addMode.value = false;
    todaySale.value = { ...value };
    dialog.value = true;
  }

  // 登録処理
  const submit = async () => {
    await addDoc(collection(db, TABLE_NAME), todaySale.value);
    await getDailySalesMaster();
    insertToast();
    dialog.value = false;
  }

  // 更新処理
  const update = async () => {
    const docRef = doc(db, TABLE_NAME, todaySale.value.id);
    await updateDoc(docRef, todaySale.value);
    await getDailySalesMaster();
    updateToast();
    addMode.value = true;
    dialog.value= false
  }

  // 削除処理
  const remove = async (v) => {
    const result = confirm('本当に削除しても良いですか？');
    if (!result) return;
    const docRef = doc(db, TABLE_NAME, v.id);
    await deleteDoc(docRef);
    await getDailySalesMaster();
    deleteToast();
    addMode.value = true;
  };

  // 日別データ取得
  const getDailySalesMaster = async () => {
    const startDay = todaySale.value.today.substring(0, 8) + "01";

    const parts = startDay.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    dateObj.setDate(dateObj.getDate() - 1);

    const docRef = collection(db, TABLE_NAME);
    const q = query(
      docRef,
      where("today", "==", todaySale.value.today),
    );

    // リアルタイム監視
    const unsubscribe = onSnapshot(q, (snapshot) => {
      dailySales.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });

    return unsubscribe;
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
  const openDialog = () => {
    addMode.value = true
    dialog.value = true
    todaySale.value = {
      today: todaySale.value.today,
    }
  }

  const cloceDialog = () => {
    addMode.value = true
    dialog.value = false
    todaySale.value = {
      today: todaySale.value.today,
    }
  }
</script>

<template>
  <AuthLayout v-model="todaySale.today">
    <v-data-table :headers="headers" :items="dailySales" class="bg-transparent max-h-[300px]" fixed-header
      :items-per-page="-1" hide-default-footer>

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
    <SmButton label="新規登録" class="px-4 py-1 mt-5 mr-3 ml-2" @click="openDialog" />
    <v-dialog v-model="dialog" max-width="80%">
      <v-card prepend-icon="mdi-account" title="業者支払い入力">
        <div class="w-full pb-5 px-2 mx-auto">
          <form @submit.prevent="addMode ? submit() : update()">
            <div class="flex flex-col w-full">
              <SmSelect label="業者" v-model="todaySale.key" :items="wholesalers" ></SmSelect>
              <SmText label="金額" v-model="todaySale.amount"></SmText>
            </div>
            <SmButton label="閉じる" htmlType="button" type="none" class="px-4 py-1 mt-5 mr-3" @click="cloceDialog" />
            <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
            <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
          </form>
        </div>
      </v-card>
    </v-dialog>
  </AuthLayout>
</template>
