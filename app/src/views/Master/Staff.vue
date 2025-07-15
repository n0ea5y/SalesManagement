<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmTable from '../../components/SmTable.vue';
  import SmButton from '@/components/SmButton.vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
  import { onMounted, ref } from 'vue';
  import { insertToast, updateToast } from '../Tools/Toast';
  import { shallowRef } from 'vue'


  onMounted(async () => {
    await getStaffMaster();
  });

  const staffMaster = ref([]);
  const staff = ref({});
  const addMode = ref(true);
  const isLoaded = ref(false)
  const dialog = shallowRef(false)
  const numbers = [...Array(16).keys()].map(i => String(i + 10 + '%')); // '01' 〜 '31'

  const rowClick = (value) => {
    addMode.value = false;
    console.log(value)
    staff.value = { ...value };
    dialog.value = true;
  }

  const submit = async () => {
    await addDoc(collection(db, "staff"), {
      name: staff.value.name,
      type: staff.value.type,
      commissionRate: staff.value.commissionRate,
      hourly_wage: staff.value.hourly_wage,
    });
    staff.value = {}
    dialog.value = false;
    getStaffMaster();
    insertToast();
  }

  const update = async () => {
    await updateDoc(doc(db, "staff", staff.value.id), {
      name: staff.value.name,
      type: staff.value.type,
      commissionRate: staff.value.commissionRate,
      hourly_wage: staff.value.hourly_wage,
    });
    staff.value = {}
    dialog.value = false;
    getStaffMaster();
    updateToast();
    addMode.value = true;
  }

  const getStaffMaster = async () => {
    const querySnapshot = await getDocs(collection(db, "staff"));
    staffMaster.value = querySnapshot.docs.map((doc) => {
      return { 'id': doc.id, 'name': doc.data().name, 'type': doc.data().type, 'hourly_wage': doc.data().hourly_wage, 'commissionRate': doc.data().commissionRate };
    });
    isLoaded.value = true;
  }

  const staffTypes = ([
    { 'id': '1', 'name': '店内' },
    { 'id': '2', 'name': '外板' },
    { 'id': '3', 'name': '店内、外板' },
  ])

  const headers = [
    { title: '名前', key: 'name', width: '100px', sortable: false },
    { title: '時給', key: 'hourly_wage', width: '100px', sortable: false },
    { title: 'タイプ', key: 'type', width: '100px', sortable: false },
    { title: '歩合', key: 'commissionRate', width: '100px', sortable: false },
    { title: '', key: 'action', width: '10px', sortable: false },
  ];

  const typeMapping = (v) => {
    const type = staffTypes.find(item => item.id === v) 
    return type ? type.name : ''
  }
</script>

<template>
  <AuthLayout>
    <!-- <SmTable :headers="headers" :items="staffMaster" action @rowClick="(item) => { rowClick(item) }" /> -->
    <div class=" overflow-x-auto">
      <v-data-table 
        :headers="headers" 
        :items="staffMaster"
        fixed-header  
        hide-default-footer
      >
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.name }}</td>
          <td>{{ item.hourly_wage }}</td>
          <td class="text-xs">{{ typeMapping(item.type) }}</td>
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
      mediaAgent = {};
      dialog = true
    }" />
    <div class="pa-4 text-center">
      <v-dialog v-model="dialog" max-width="80%">
        <v-card prepend-icon="mdi-account" title="新規登録">

          <div class="px-2 py-5 mx-auto">
            <form @submit.prevent="addMode ? submit() : update()">

              <div class="flex flex-col gap-4">
                <div class="flex flex-col">
                  <label for="staffName">名前<span class="text-red-500 font-bold  text-xs">※必須</span></label>
                  <input id="staffName" type="text"
                    class="border border-black rounded h-[40px] w-[95%] mx-auto text-lg pl-2" v-model="staff.name"
                    required>
                </div>

                <div class="flex flex-col">
                  <label for="staffType">タイプ<span class="text-red-500 font-bold text-xs">※必須</span></label>
                  <select id="staffType" v-model="staff.type"
                    class="border border-black bg-white rounded h-[40px] w-[95%] mx-auto text-lg pl-2">
                    <option v-for="type in staffTypes" :key="type.id" :value="type.id">
                      {{ type.name }}
                    </option>
                  </select>
                </div>



                <div class="flex flex-col">
                  <label for="staffName">時給<span class="text-red-500 font-bold text-xs">※必須</span></label>
                  <input id="staffName" type="text"
                    class="border border-black rounded h-[40px] w-[95%] mx-auto text-lg pl-2"
                    v-model="staff.hourly_wage" required>
                </div>

                <div class="flex flex-col" v-if="staff.type != 1">
                  <label for="staffType">タイプ<span class="text-red-500 font-bold text-xs">※必須</span></label>
                  <select id="staffType" v-model="staff.commissionRate"
                    class="border border-black bg-white rounded h-[40px] w-[95%] mx-auto text-lg pl-2">
                    <option v-for="num in numbers" :key="num" :value="num">
                      {{ num }}
                    </option>
                  </select>
                </div>
              </div>
              <SmButton label="閉じる" htmlType="button" type="none" class="px-4 py-1 mt-5 mr-3" @click="() => {
                addMode = true
                dialog = false
                mediaAgent = {};
              }" />
              <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
              <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
            </form>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </AuthLayout>
</template>
