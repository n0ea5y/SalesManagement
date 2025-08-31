<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, where, onSnapshot, query } from "firebase/firestore";
  import { formatNumber } from '../Tools/format';

  const props = defineProps({
    parentDate: {
      type: String,
      required: true
    }
  })

  onMounted( async () => {
    await getSalesRecordsRealtime()
    await getMediaAgencies();
  })

  const salesRecordItems = ref([]);
  const mediaAgencies = ref([]);
  const total = ref([]);

  watch(() => props.parentDate, async () => {
    await getSalesRecordsRealtime()
  })

  // 登録データ一覧取得
  const getSalesRecordsRealtime = async () => {
    const docRef = collection(db, "daily_sales");
    const q = query(
      docRef,
      where("today", "==", props.parentDate),
    );

    // リアルタイム監視
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffMap = {};
      const totalData = { guest_count: 0, amount: 0, count: 0 };

      snapshot.forEach(doc => {
        const data = doc.data();
        const id = data.staff_in_charge;

        if (!staffMap[id]) {
          staffMap[id] = {
            media_id: id,
            count: 0,
            guest_count: 0,
            amount: 0
          };
        }

        staffMap[id].guest_count += data.guest_count || 0;
        staffMap[id].amount += parseInt(data.amount) || 0;
        staffMap[id].count++;

         // 全体合計
      totalData.guest_count += data.guest_count || 0;
      totalData.amount += parseInt(data.amount) || 0;
      totalData.count++;
      });

      // 最終的に配列として reactive にセット
      salesRecordItems.value = Object.values(staffMap);
      total.value = [totalData];
    });
    return unsubscribe;
  };

  // メディアエージェント一覧取得
  const getMediaAgencies = async () => {
    const querySnapshot = await getDocs(collection(db, "media_agencies"));
    mediaAgencies.value = querySnapshot.  docs.map((doc) => {
      return {key: doc.id, title: doc.data().name}
    });
  }

  const countCountMapping = (v) => {
    if(!v) return;
    const media = salesRecordItems.value.find(sale => {
      return v === sale.count;
    })
    return media ? media.count : '0';
  }

  const amountCountMapping = (v) => {
    if(!v) return;
    const media = salesRecordItems.value.find(sale => {
      return v === sale.media_id;
    })
    return media ? media.amount : '0';
  }

  const guestCountMapping = (v) => {
    if(!v) return;
    const media = salesRecordItems.value.find(sale => {
      return v === sale.media_id;
    })
    return media ? media.guest_count : '0';
  }
</script>

<template>
  <div class="overflow-x-auto">
    <v-card class="w-[98%] mx-auto mb-2" subtitle="日別売上">
      <v-data-table :items="mediaAgencies" :items-per-page="-1" hide-default-header hide-default-footer
        class="bg-transparent max-h-[400px] w-full">
        <template v-slot:item="{ item }">
          <tr class="text-sm">
            <td class="w-1/4 text-[13px]">{{ item.title }}</td>
            <td class="w-1/4 text-end text-[13px]">{{ guestCountMapping(item.key)}}人</td>
            <td class="w-1/4 text-end text-[13px]">{{ countCountMapping(item.key)}}組</td>
            <td class="w-1/4 text-end text-[13px]">{{ formatNumber(amountCountMapping(item.key))}}</td>
          </tr>
        </template>
      </v-data-table>

      <v-data-table :items="total" :items-per-page="-1" hide-default-header hide-default-footer
        class="bg-transparent max-h-[300px] w-full">
        <template v-slot:item="{ item }">
          <tr class="text-sm border-t">
            <td class="w-1/4 text-[13px] font-bold">合計</td>
            <td class="w-1/4 text-end text-[13px] font-bold">{{ item.guest_count }}人</td>
            <td class="w-1/4 text-end text-[13px] font-bold">{{ item.count }}組</td>
            <td class="w-1/4 text-end text-[13px] font-bold">{{ formatNumber(item.amount) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>