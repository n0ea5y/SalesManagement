<script setup>
  import SmButton from '@/components/SmButton.vue';
  import SmSelect from '@/components/SmSelect.vue';
  import { onMounted, ref, watch } from 'vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, query, where, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
  import { insertToast, updateToast, deleteToast } from './Tools/Toast';

  const props = defineProps({
    parentDate: String
  })

  onMounted(async () => {
    await getStaffMaster();
    await getStaffWlorkList();
  })

  const staffWork = ref({});     // スタッフ入力変数
  const staffWorkList = ref([]); // スタッフ勤怠リスト変数
  const staffList = ref([])      // スタッフ変数
  const dialog = ref(false);     // ダイアログ変数
  const addMode = ref(true);

  // 更新ボタンが押されたら処理
  const rowClick = (value) => {
    staffWork.value = { ...value };
    addMode.value = false;
    dialog.value = true;
  }

  // 登録処理
  const submit = async () => {
    await addDoc(collection(db, 'staff_hourly_wage'), staffWork.value);
    staffWork.value = {}
    dialog.value = false;
    insertToast();
  }

  // 更新処理
  const update = async () => {
    const docRef = doc(db, "staff_hourly_wage", staffWork.value.id);
    await updateDoc(docRef, staffWork.value);
    dialog.value = false
    updateToast();
  }

  // 削除処理
  const remove = async (v) => {
    const deleteFlag = confirm('本当に削除しても良いですか？')
    if(deleteFlag){
      const docRef = doc(db, "staff_hourly_wage", v.id);
      await deleteDoc(docRef);
      deleteToast();
    }
    dialog.value = false
  }

  watch(
    () => [staffWork.value.before22, staffWork.value.after22],
    ([before, after]) => {
      if(!staffWork.value.staff_id) return;
      const staff = staffList.value.find(item => item.key === staffWork.value.staff_id)
      const hourlyWage = staff ? staff.hourly_wage : null

      const b = parseFloat(before) || 0;
      const a = parseFloat(after) || 0;
      const h = parseFloat(hourlyWage) || 0;

      staffWork.value.salary = (b * h) + (a * h * 1.25);
    }
  );

  const formatNumber = (num) => {
    if (num == null || num === '') return ''
    return '￥' + Number(num).toLocaleString() + '円'
  }

  // 表のstaffIdとnameのマッピング
  const staffMapping = (v) => {
    if (!staffWork.value) return ''
    const list = Object.values(staffList.value)
    const match = list.find(item => item.key === v)
    return match ? match.name : ''
  }

  const getStaffWlorkList = async () => {
    const startDay = props.parentDate.substring(0, 8) + "01";
    const parts = startDay.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    dateObj.setDate(dateObj.getDate() - 1);

    const docRef = collection(db, "staff_hourly_wage");
    const q = query(
      docRef,
      where("today", "==", props.parentDate),
    );

    // リアルタイム監視
    const unsubscribe = onSnapshot(q, (snapshot) => {
      staffWorkList.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });

    return unsubscribe;

  }
  // スタッフ一覧取得
  const getStaffMaster = async () => {
    const q = query(collection(db, "staff"), where("type", "!=", "2"));
    const querySnapshot = await getDocs(q);
    staffList.value = querySnapshot.docs.map((doc) => {
      return { 'key': doc.id, 'name': doc.data().name, 'title': doc.data().name, 'hourly_wage': doc.data().hourly_wage };
    });
  }

  const dialogOpen = () => {
    dialog.value = true;
    staffWork.value = {
      today: props.parentDate,
    }
  }

  const dialogClose = () => {
    dialog.value = false;
    addMode.value =true;
    staffWork.value = {
      today: props.parentDate,
    }
  }
  // へっだー
  const headers = [
    { title: 'スタッフ名', key: 'name' },
    { title: '通常勤務', key: 'before22' },
    { title: '深夜勤務', key: 'after22' },
    { title: '給与', key: 'hourlyWage' },
    { title: '' },
  ];

  // 出勤時間関数
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
</script>

<template>
    <div class=" overflow-x-auto">
      <v-data-table 
        :headers="headers" 
        :items="staffWorkList"
        class="min-w-[620px]"
        :items-per-page="-1"
        fixed-header  
        hide-default-footer
      >
      <template v-slot:item="{ item }">
        <tr>
          <td class="w-[1/4]">{{ staffMapping(item.staff_id) }}</td>
          <td class="w-[1/4]">{{ item.before22}}</td>
          <td class="w-[1/4]">{{ item.after22 }}</td>
          <td class="w-[1/4]">{{ formatNumber(item.salary) }}</td>
          <td class="flex gap-4 items-center w-[110px]">
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
          </td>
        </tr>

      </template>
      </v-data-table>
    </div>
      <SmButton label="新規登録" class="px-4 py-1 mt-5 mr-3 ml-2" @click="dialogOpen" />
      <v-dialog v-model="dialog" max-width="80%">
        <v-card prepend-icon="mdi-account" title="勤務時間入力">
          <div class="w-full pb-5 px-2 mx-auto">
            <form @submit.prevent="addMode ? submit() : update()">
              <div class="flex flex-col w-full">
                <SmSelect label="スタッフ" v-model="staffWork.staff_id" :items="staffList"></SmSelect>
                <SmSelect label="通常勤務" v-model="staffWork.before22" :items="times"></SmSelect>
                <SmSelect label="深夜勤務" v-model="staffWork.after22" :items="times"></SmSelect>
              </div>
              <SmButton label="閉じる" htmlType="button" type="none" class="px-4 py-1 mt-5 mr-3" @click="dialogClose" />
              <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
              <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
            </form>
          </div>
        </v-card>
      </v-dialog>
</template>