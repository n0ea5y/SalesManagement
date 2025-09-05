<script setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import { db } from '@/assets/firebase.init';
  import { collection, getDocs, where, onSnapshot, query, orderBy } from "firebase/firestore";
  import { formatNumber } from '../Tools/format';

  const props = defineProps({
    parentDate: {
      type: String,
      required: true
    }
  })

  onMounted( async ()  => {
    await getVendorList();
    await getVendor();
  })

  watch(() => props.parentDate, async (newVal) => {
    await getVendor(); 
  })

  const dailySalary = ref([]);
  const staffList = ref([]);
  const totalAmount = computed(() => {
    const sum = dailySalary.value.reduce((sum, item) => {
      return sum + (parseInt(item.salary) || 0);
    }, 0);

    return [{
      title: '合計',
      salary: sum,
    }];
  });

  const getVendorList = async () => {
    const querySnapshot = await getDocs(
      query(
        collection(db, "staff"),
        where("type", "!=", 2),
      )
    );
    staffList.value = querySnapshot.docs.map((doc) => {
      return { 'key': doc.id, 'title': doc.data().name }
    });
  }

  const getVendor = async () => {
    const q = query(collection(db, "staff_hourly_wage"), where("today", "==", props.parentDate));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      dailySalary.value = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      })
    })
    return unsubscribe;
  }

const venderMapping = (v) => {
  if(!v) return;
  const salary = dailySalary.value.find((item) => {
    return item.staff_id === v;
  })

  return salary ? salary.salary : '0';
}
</script>

<template>
  <div class="overflow-x-auto">
    <v-card class="w-[98%] mx-auto mb-2" subtitle="スタッフ">
      <v-data-table :items="staffList" :items-per-page="-1" hide-default-header hide-default-footer
        class="bg-transparent max-h-[200px] w-full">
        <template v-slot:item="{ item }">
          <tr class="text-sm">
            <td class="w-[130px] text-[13px]">{{ item.title }}</td>
            <td class="w-[130px] text-[13px] text-end">{{ formatNumber(venderMapping(item.key)) }}</td>
          </tr>
        </template>
      </v-data-table>
      <v-data-table :items="totalAmount" :items-per-page="-1" hide-default-header hide-default-footer
        class="bg-transparent max-h-[200px] w-full">
        <template v-slot:item="{ item }">
          <tr class="text-sm border-t">
            <td class="w-[130px] text-[13px] font-bold">{{ item.title }}</td>
            <td class="w-[130px] text-[13px] text-end font-bold">{{ formatNumber(item.salary) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>