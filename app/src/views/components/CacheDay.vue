<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, where, onSnapshot, query } from "firebase/firestore";
  import { formatNumber } from '../Tools/format';
  import { GAIHAN_ID } from '../Tools/constants';

  const props = defineProps({
    parentDate: {
      type: String,
      required: true
    }
  })

  onMounted( async () => {
    await getCacheDay();
    await getStaffMaster();
  })
  watch(() => props.parentDate, async () => {
    await getCacheDay();
  })
  const cacheDayItem = ref([]);
  const staffList = ref([])

  const getCacheDay = () => {
    const docRef = collection(db, "daily_sales");
    const q = query(
      docRef,
      where("today", "==", props.parentDate),
      where("staff_in_charge", "==", GAIHAN_ID)
    );
    // リアルタイム監視
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffMap = {};
      const totalData = { guest_count: 0, amount: 0, count: 0 };
      snapshot.forEach(doc => {
        const data = doc.data();
        const id = data.staff_id;
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
      });

    //   // 最終的に配列として reactive にセット
      cacheDayItem.value = Object.values(staffMap);
    //   total.value = [totalData];
    });
    return unsubscribe;
  }
  // スタッフ一覧取得
  const getStaffMaster = async () => {
    const q = query(collection(db, "staff"), where("type", "!=", "1"));

    const querySnapshot = await getDocs(q);
    staffList.value = querySnapshot.docs.map((doc) => {
        return { 'key': doc.id, 'name': doc.data().name};
    });
  }

  const staffMapping = (v) => {
    if (!v) return;
    const staff = staffList.value.find((item) => item.key === v);
    return staff ? staff.name : '';
  }
</script>

<template>
  <div class="overflow-x-auto">
    <v-card class="w-[98%] mx-auto mb-2" subtitle="外板別">
      <v-data-table :items="cacheDayItem" :items-per-page="-1" hide-default-header hide-default-footer
        class="bg-transparent max-h-[200px] w-full">
        <template v-slot:item="{ item }">
          <tr class="text-sm">
            <td class="w-[150px] text-[13px]">{{ staffMapping(item.media_id) }}</td>
            <td class="w-[70px] text-[12px]">{{ item.guest_count }}人</td>
            <td class="w-[70px] text-[12px]">{{ item.count }}組</td>
            <td class="w-[130px] text-[13px]">{{ formatNumber(item.amount) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>