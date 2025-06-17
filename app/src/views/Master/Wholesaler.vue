<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';
  import SmButton from '@/components/SmButton.vue';
  import SmTable from '../../components/SmTable.vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
  import { onMounted, ref } from 'vue';
  import { insertToast, updateToast } from '../Tools/Toast';
  import { shallowRef } from 'vue'


  onMounted(async () => {
    await getWholesalerMaster();
  });

  const wholesalers = ref([]);
  const wholesaler = ref({});
  const addMode = ref(true);
  const isLoaded = ref(false)
  const dialog = shallowRef(false)

  const rowClick = (value) => {
    addMode.value = false;
    wholesaler.value = { ...value };
    dialog.value = true;
  }

  const submit = async () => {
    await addDoc(collection(db, "wholesalers"), {
      name: wholesaler.value.name,
    });
    wholesaler.value = {}
    dialog.value = false;
    getWholesalerMaster();
    insertToast();
  }

  const update = async () => {
    await updateDoc(doc(db, "wholesalers", wholesaler.value.id), {
      name: wholesaler.value.name,
    });
    wholesaler.value = {}
    dialog.value = false;
    getWholesalerMaster();
    updateToast();
    addMode.value = true;
  }

  const getWholesalerMaster = async () => {
    const querySnapshot = await getDocs(collection(db, "wholesalers"));
    wholesalers.value = querySnapshot.docs.map((doc) => {
      return { 'id': doc.id, 'name': doc.data().name };
    });
    isLoaded.value = true;
  }

  const headers = [
    {title: '卸売業者名', key: 'name', sortable: false},
    {title: '', key: 'action', width: '10px', sortable: false},
  ];
</script>

<template>
  <AuthLayout>
      <SmTable
        :headers="headers"
        :items="wholesalers"
        action @rowClick="(item) => {rowClick(item)}" />

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
              <div class="flex flex-col">
                <label for="wholesalerName">卸売業者名<span class="text-red-500 font-bold text-xs">※必須</span></label>
                <input id="wholesalerName" type="text" class="border border-black rounded h-[40px] w-[95%] mx-auto text-lg"
                  v-model="wholesaler.name" required>
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
