<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
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
    });
    staff.value = {}
    getStaffMaster();
    insertToast();
  }

  const update = async () => {
    await updateDoc(doc(db, "staff", staff.value.id), {
      name: staff.value.name,
    });
    staff.value = {}
    getStaffMaster();
    updateToast();
    addMode.value = true;
  }

  const getStaffMaster = async () => {
    const querySnapshot = await getDocs(collection(db, "staff"));
    staffMaster.value = querySnapshot.docs.map((doc) => {
      return { 'id': doc.id, 'name': doc.data().name };
    });
    isLoaded.value = true;
  }
</script>

<template>
  <AuthLayout>
    <div class="border border-gray-300 w-[95%] mx-auto mb-4">
      <table class="table-fixed w-full border-collapse">
        <thead class="bg-gray-200">
          <tr>
            <th class="p-2 text-center">スタッフ</th>
          </tr>
        </thead>
      </table>

      <div class="max-h-[300px] overflow-y-auto">
        <table class="table-fixed w-full border-collapse"> <tbody>
            <tr v-for="(staff, index) in staffMaster" :key="index" >
              <td class="p-1 border-t border-gray-300 flex items-center">{{ staff.name }}
                <span class="text-sm border rounded py-1 px-2 bg-yellow-200 ml-auto" @click="rowClick(staff)">
                    <svg xmlns="http://www.w3.org/2000/svg"

                    fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </span></td>
            </tr>
            <tr v-if="isLoaded && staffMaster.length === 0">
              <td class="text-center text-red-500 py-[9px]" colspan="100%">
                データがありません 登録してください
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="w-[95%] mx-auto">
      <form @submit.prevent="addMode ? submit() : update()">
        <div class="flex flex-col">
          <label for="staffName">名前<span class="text-red-500 font-bold text-xs">※必須</span></label>
          <input id="staffName" type="text" class="border border-black rounded h-[40px] text-lg"
            v-model="staff.name" required>
        </div>
        <SmButton v-if="!addMode" label="新規登録" class="px-4 py-1 mt-5 mr-3" @click="() => {
          addMode = true
          staff = {};
        }" />
        <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
        <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
      </form>
    </div>
  </AuthLayout>
</template>
