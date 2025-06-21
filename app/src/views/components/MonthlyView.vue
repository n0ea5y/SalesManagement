<script setup>
import { onMounted, ref } from 'vue';
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/assets/firebase.init';

onMounted(async () => {
    const result = await getMonthlySalesSummary(yearMonth.value);
    totalAmount.value = result.total;
    totalPeopleCount.value = result.total_count;
    totalMediaCount.value = result.total_media_count;
    mediaMonth.value = result.media;
});

const yearMonth = defineModel('yearMonth')
const totalAmount = ref(null);
const totalPeopleCount = ref(null);
const totalMediaCount = ref(null);
const mediaMonth = ref([]);

const getMonthlySalesSummary = async (yearMonth) => {
    reset();

    const colRef = collection(db, "daily_sales", yearMonth, "days");
    const querySnapshot = await getDocs(colRef);

    let total = 0;
    let totalCount = 0;
    let totalMediaCount = 0;
    const mediaMap = new Map();

    querySnapshot.forEach(doc => {
        const data = doc.data();
        total += data.total ?? 0;
        totalCount += data.total_count ?? 0;
        totalMediaCount += data.total_media_count ?? 0;

        (data.media ?? []).forEach(({ media_name, media_amount, people_count }) => {
            const current = mediaMap.get(media_name) ?? {
                media_amount: 0,
                people_count: 0,
                media_count: 0
            };

            current.media_amount += media_amount ?? 0;
            current.people_count += people_count ?? 0;
            current.media_count += 1;

            mediaMap.set(media_name, current);
        });
    });

    const media = Array.from(mediaMap.entries()).map(([media_name, data]) => ({
        media_name,
        media_amount: data.media_amount,
        people_count: data.people_count,
        media_count: data.media_count
    }));

    return {
        total,
        total_count: totalCount,
        total_media_count: totalMediaCount,
        media
    };
};

const reset = () => {
    totalAmount.value = 0;
    totalPeopleCount.value = 0;
    mediaMonth.value = [];
}

const formatNumber = (num) => {
    if (num == null || num === '') return ''
    return '￥' + Number(num).toLocaleString() + '円'
}
</script>

<template>
    <div class="relative w-full py-2">
        <p class="text-center">月売上げ</p>
        <router-link to="/store-monthly-detail"
            class="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500 hover:underline">
            月目標設定
        </router-link>
    </div>


    <v-data-table :items="mediaMonth" class="bg-transparent max-h-[300px]" hide-default-header hide-default-footer>
        <template v-slot:item="{ item }">
            <tr class="text-sm text-center border-b">
                <td class="py-1 px-3 w-2/12">{{ item.media_name }}</td>
                <td class="py-1 px-3 w-2/12">{{ item.media_count }}組</td>
                <td class="py-1 px-3 w-2/12">{{ item.people_count }}人</td>
                <td class="py-1 px-3 w-4/12">{{ formatNumber(item.media_amount) }}</td>
            </tr>
        </template>
    </v-data-table>

    <table class="w-full mt-5 mb-5 text-sm text-center">
            <tr class="font-bold">
                <th class="py-1 px-3 w-2/12">合計</th>
                <th class="py-1 px-3 w-2/12">{{ totalMediaCount }}組</th>
                <th class="py-1 px-3 w-2/12">{{ totalPeopleCount }}人</th>
                <th class="py-1 px-3 w-4/12">{{ formatNumber(totalAmount) }}</th>
            </tr>
    </table>


</template>
