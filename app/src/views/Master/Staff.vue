<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmTable from '../components/SmTable.vue';
  import SmButton from '@/components/icons/SmButton.vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
  import { onMounted, ref } from 'vue';
  import { insertToast, updateToast } from '../Tools/Toast';

  onMounted(async () => {
    await getStaffMaster();
  });

  const staffMaster = ref([]);
  const staff = ref({});
  const addMode = ref(true);
  const isLoaded = ref(false)

  const rowClick = (value) => {
    addMode.value = false;
    staff.value = { ...value };
  }

  const submit = async () => {
    await addDoc(collection(db, "staff"), {
      name: staff.value.name,
      type: staff.value.type,
      hourly_wage: staff.value.hourly_wage,
    });
    staff.value = {}
    getStaffMaster();
    insertToast();
  }

  const update = async () => {
    await updateDoc(doc(db, "staff", staff.value.id), {
      name: staff.value.name,
      type: staff.value.type,
      hourly_wage: staff.value.hourly_wage,
    });
    staff.value = {}
    getStaffMaster();
    updateToast();
    addMode.value = true;
  }

  const getStaffMaster = async () => {
    const querySnapshot = await getDocs(collection(db, "staff"));
    staffMaster.value = querySnapshot.docs.map((doc) => {
      return { 'id': doc.id, 'name': doc.data().name, 'type': doc.data().type, 'hourly_wage': doc.data().hourly_wage };
    });
    isLoaded.value = true;
  }

  const staffTypes = ([
    {'id': '1', 'name': '店内'},
    {'id': '2', 'name': '外板'},
    {'id': '3', 'name': '店内、外板'},
  ])

  const headers = [
    {title: '名前', key: 'name', width: '100px',sortable: false},
    {title: '時給', key: 'hourly_wage', width: '100px',sortable: false},
    {title: 'タイプ', key: 'type', width: '100px',sortable: false},
    {title: '', key: 'action', width: '10px', sortable: false},
  ];

</script>

<template>
  <AuthLayout>
      <SmTable
        :headers="headers"
        :items="staffMaster"
        action @rowClick="(item) => {rowClick(item)}" />

    <div class="w-[95%] mt-10 mx-auto">
      <form @submit.prevent="addMode ? submit() : update()">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col">
            <label for="staffName">名前<span class="text-red-500 font-bold text-xs">※必須</span></label>
            <input id="staffName" type="text" class="border border-black rounded h-[40px] text-lg pl-2" v-model="staff.name" required>
          </div>

          <div class="flex flex-col">
            <label for="staffType">タイプ<span class="text-red-500 font-bold text-xs">※必須</span></label>
            <select id="staffType" v-model="staff.type" class="border border-black bg-white rounded h-[40px] text-lg pl-2">
              <option v-for="type in staffTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>

          <div class="flex flex-col">
            <label for="staffName">時給<span class="text-red-500 font-bold text-xs">※必須</span></label>
            <input id="staffName" type="text" class="border border-black rounded h-[40px] text-lg pl-2" v-model="staff.hourly_wage" required>
          </div>
        </div>
        <SmButton v-if="!addMode" label="新規登録" class="px-4 py-1 mt-5 mr-3" @click="() => {
          addMode = true
          staff = {};
        }" />
        <SmButton v-if="addMode" htmlType="button" label="登録" class="px-4 py-1 mt-5" type="store" />
        <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
      </form>
    </div>
  </AuthLayout>
</template>
