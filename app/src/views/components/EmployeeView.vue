<script setup>
import SmText from '@/components/SmText.vue';
import SmButton from '@/components/SmButton.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { insertToast, updateToast } from '@/views/Tools/Toast';
import { addDoc, collection, getDocs, updateDoc, where, doc, onSnapshot, query } from "firebase/firestore";
import { db} from '@/assets/firebase.init';

const props = defineProps({
    parentDate: String,
})

onMounted( async () => {
    getEmployee();
})

watch(() => props.parentDate, (newVal) => {
    getEmployee();
})

const dialog = ref(false);
const employee = ref({
    today: props.parentDate,
    num: null,
});
const bindEmployeeNum = ref('');

const label = computed(() => bindEmployeeNum.value ? '更新' : '登録' );
const btnType = computed(() => bindEmployeeNum.value ? 'update' : 'store' )

const submit = async () => {
    await addDoc(collection(db, "employee"), employee.value);
    dialog.value = false;
    insertToast();
    getEmployee();
}
const update = async () => {
    const docRef = doc(db, "employee", employee.value.id);
    await updateDoc(docRef, employee.value);
    dialog.value = false;
    updateToast();
    getEmployee();
}


const getEmployee = () => {
  const q = query(collection(db, "employee"), where("today", "==", props.parentDate));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      employee.value = {
        id: docSnap.id,
        ...docSnap.data(),
      };
      bindEmployeeNum.value = docSnap.data().num;
    } else {
      employee.value = {
        today: props.parentDate,
      };
      bindEmployeeNum.value = '';
    }
  });

  return unsubscribe;
};

</script>

<template>
    <div class="flex items-center">
        <p>社員人数：<span :class="bindEmployeeNum ? '': 'text-red-500'">{{ bindEmployeeNum ? bindEmployeeNum + '人' : '未入力' }}</span></p>
        <SmButton :type="btnType" class="ml-auto" :label="label" @click="(() => dialog = !dialog)"></SmButton>
    </div>

    <v-dialog v-model="dialog">
        <div class="rounded-lg bg-white py-5 px-10">
            <form @submit.prevent="!bindEmployeeNum ? submit() : update()">
                <div>
                <SmText label="社員人数" :bordernone="false" v-model="employee.num" required></SmText>
                </div>
                <div class="flex justify-end gap-10">
                    <SmButton html-type="button" type="none" label="閉じる" @click="(() => dialog = !dialog)"></SmButton>
                    <SmButton :type="btnType" :label="label" ></SmButton>
                </div>
            </form>
        </div>

    </v-dialog>
    
</template>