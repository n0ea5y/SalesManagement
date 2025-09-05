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

  const dailyVendor = ref([]);
  const vendorList = ref([]);
  const totalAmount = computed(() => {
    const sum = dailyVendor.value.reduce((sum, item) => {
      return sum + (parseInt(item.amount) || 0);
    }, 0);

    return [{
      title: '合計',
      amount: sum,
    }];
  });

  const getVendorList = async () => {
    const querySnapshot = await getDocs(
      query(
        collection(db, "wholesalers"),
        orderBy("name", "desc")
      )
    );
    vendorList.value = querySnapshot.docs.map((doc) => {
      return { 'key': doc.id, 'title': doc.data().name }
    });
  }

  const getVendor = async () => {
    const q = query(collection(db, "whole_sales"), where("today", "==", props.parentDate));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      dailyVendor.value = snapshot.docs.map((doc) => {
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
  const vendor = dailyVendor.value.find((item) => {
    return item.key === v;
  })

  return vendor ? vendor.amount : '0';
}
</script>

<template>
  <div class="overflow-x-auto">
    <v-card class="w-[98%] mx-auto mb-2" subtitle="支払い">
      <v-data-table :items="vendorList" :items-per-page="-1" hide-default-header hide-default-footer
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
            <td class="w-[130px] text-[13px] text-end font-bold">{{ formatNumber(item.amount) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>