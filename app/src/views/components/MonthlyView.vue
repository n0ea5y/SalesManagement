<script setup>
    import { onMounted, ref, watch } from 'vue';
    import { collection, getDocs } from "firebase/firestore";
    import { db } from '@/assets/firebase.init';

    onMounted(async () => {
        const result = await getMonthlySalesSummary(yearMonth.value);
        totalAmount.value = result.total;
        totalPeopleCount.value = result.total_count;
        mediaMonth.value = result.media;
    });

    const yearMonth = defineModel('yearMonth')
    const totalAmount = ref(null);
    const totalPeopleCount = ref(null);
    const mediaMonth = ref([]);
    
    watch(() => yearMonth.value, async (newVal) => {
        const result = await getMonthlySalesSummary(newVal);
        totalAmount.value = result.total;
        totalPeopleCount.value = result.total_count;
        mediaMonth.value = result.media;
    });
     const getMonthlySalesSummary = async (yearMonth) => {
        reset();
        const colRef = collection(db, "daily_sales", yearMonth, "days");
        const querySnapshot = await getDocs(colRef);
        let total = 0;
        let totalCount = 0;
        const mediaMap = new Map();
        querySnapshot.forEach(doc => {
            const data = doc.data();
            total += data.total ?? 0;
            totalCount += data.total_count ?? 0;

            (data.media ?? []).forEach(({ title, value }) => {
            const current = mediaMap.get(title) ?? 0;
            mediaMap.set(title, current + (value ?? 0));
            });
        });
        const media = Array.from(mediaMap.entries()).map(([title, value]) => ({ title, value }));
        return {
            total,
            total_count: totalCount,
            media
        };
    };

    const reset = () => {
       totalAmount.value = 0;
       totalPeopleCount.value = 0;
       mediaMonth.value = [];
    }
    
    const headers = [
        { title: '媒体', key: 'title' },
        { title: '金額', key: 'value', sortable: false },
    ]
    const formatNumber = (num) => {
        if (num == null || num === '') return ''
        return '￥' + Number(num).toLocaleString() + '円'
    }
</script>

<template>
    <div class="flex gap-5">
      <p v-if="totalAmount" class="font-bold">月売：{{ formatNumber(totalAmount) }}</p>
      <p v-if="totalPeopleCount" class="font-bold">人数：{{ totalPeopleCount}}人</p>
    </div>
    <v-data-table
        :headers="headers"
        :items="mediaMonth"
        class="bg-transparent max-h-[300px]"
        hide-default-footer
      >
          <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.title }}</td>
            <td>{{ formatNumber(item.value) }}</td>
          </tr>
        </template>
    </v-data-table>
</template>
