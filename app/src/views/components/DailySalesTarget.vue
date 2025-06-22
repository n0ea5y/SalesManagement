<script setup>
import SmButton from '@/components/SmButton.vue';
import SmText from '@/components/SmText.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { db } from '@/assets/firebase.init';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { insertToast, updateToast } from '../Tools/Toast';

const props = defineProps({
    today: {
        type: String,
        default: '',
    }
})

onMounted(async () => {
    await getDailyTarget(props.today);
})

watch(() => props.today, async (newVal) => {
    await getDailyTarget(newVal);
})

const getDailyTarget = async (today) => {
    const [year, month, day] = today.split('-');
    yearMont.value = `${year}_${month}`;
    targetDay.value = day;
    const docRef = doc(db, 'daily_target', yearMont.value, 'target', targetDay.value);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        dailyTarget.value = docSnap.data().day_target;
        dailyTargetView.value = dailyTarget.value;
        addMode.value = false;
    } else {
        addMode.value = true;
        dailyTarget.value = null;
        dailyTargetView.value = null;
    }
}

const dailyTarget = ref('');
const dailyTargetView = ref('');
const yearMont = ref(null);
const targetDay = ref(null);
const dialog = ref(false);
const addMode = ref(true);
const emit = defineEmits(['action']);
const dailyTargetLabel = computed(() => {
    return !dailyTarget.value ? '日別目標登録' : '日別目標更新';
})

const submit = async () => {
    await setDoc(doc(db, 'daily_target', yearMont.value, 'target', targetDay.value), {
        day_target: dailyTarget.value,
    });
    addMode.value ? insertToast() : updateToast();
    dialog.value = false;
    getDailyTarget(props.today)
    emit('action');
}

const formatNumber = (num) => {
    if (num == null || num === '') return ''
    return '￥' + Number(num).toLocaleString() + '円'
}
</script>

<template>
    <div class="flex items-center">
        <p class="mr-auto">売上目標：{{ dailyTarget ? formatNumber(dailyTargetView) : '登録されていません' }}</p>
        <SmButton :label="dailyTargetLabel" class="px-4 py-1" @click="() => dialog = !dialog"></SmButton>
    </div>

    <v-dialog v-model="dialog" max-width="80%">
        <v-card prepend-icon="mdi-account" title="日別売上設定">
            <div class="w-full pb-5 px-2 mx-auto">
                <form @submit.prevent="submit()">
                    <SmText label="目標" v-model="dailyTarget" required></SmText>
                    <SmButton label="閉じる" htmlType="button" type="none" class="px-4 py-1 mt-5 mr-3" @click="() => {
                        dialog = false
                    }" />
                    <SmButton v-if="addMode" label="登録" class="px-4 py-1 mt-5" type="store" />
                    <SmButton v-else label="更新" class="px-4 py-1 mt-5" type="update" />
                </form>
            </div>
        </v-card>
    </v-dialog>
</template>