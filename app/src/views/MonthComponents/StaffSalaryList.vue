<script setup>
    import { onMounted, ref } from 'vue';
    import { collection, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
    import { db } from '@/assets/firebase.init';
    import { formatNumber } from '../Tools/format';
    import { inject } from 'vue';

    onMounted(() => {
        getStaff();
        getSalaryList()
    })
    const grobalItem = inject('grobalItem');
    const today = grobalItem.today;
    const staffList  = ref([]);
    const salaryList = ref([]);
    const total = ref(0);

    const getStaff = async () => {
        const q = query(collection(db, 'staff'),
            where('type', '!=', 2),
            orderBy('name', 'asc')
        )

        const querySnapshot = await getDocs(q);
        staffList.value = querySnapshot.docs.map((doc) => {
            return {'id': doc.id, 'name': doc.data().name}
        });
    }

    const getSalaryList = async () => {
        // 例: today = "2025-09-06"
        const startDay = today.substring(0, 8) + "01"; // 2025-09-01

        // 翌月1日を作成
        const parts = startDay.split('-');
        const dateObj = new Date(Number(parts[0]), Number(parts[1]), 1); 
        // 翌月1日の1日前 = 当月末
        dateObj.setDate(dateObj.getDate() - 1);

        // YYYY-MM-DD にゼロ埋め
        const lastDay = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        const q = query(collection(db, 'staff_hourly_wage'),
            where('today', '>=', startDay),
            where('today', '<=', lastDay),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const salaryMap = {};

          snapshot.forEach((doc) => {
            const data = doc.data();
            const staffId = data.staff_id;
            total.value = total.value + data.salary;

            if (!salaryMap[staffId]) {
                salaryMap[staffId] = {
                staff_id: staffId,
                salary: 0,
                items: []
                };
            }

            salaryMap[staffId].salary += data.salary || 0;
            });

            salaryList.value = Object.values(salaryMap);
        })
        return unsubscribe;
    }

    const headerItems = [
        {'key': 'name', 'title': '名前'}, 
        {'key': 'salary', 'title': '金額'}
    ]

    const StaffSalaryMapping = (v) => {
        const salary = salaryList.value.find((salary) => {
            return salary.staff_id == v;
        })

        return salary ? salary.salary : '0';
    }
</script>

<template>
  <div class="overflow-x-auto">
    <v-card class="w-[98%] mx-auto mb-2" subtitle="給料">
      <v-data-table :headers="headerItems" :items="staffList" :items-per-page="-1" hide-default-header hide-default-footer
        class="bg-transparent max-h-[300px] w-full">
            <template v-slot:item="{ item }">
                <tr class="text-no-wrap">
                    <td class="">{{ item.name }}</td>
                    <td class="text-end">{{formatNumber(StaffSalaryMapping(item.id))}}円</td>
                </tr>
            </template>
            <template v-slot:bottom>
                <tr class="flex justify-around font-bold border-t">
                    <td class="w-1/2 py-2 px-4">合計</td>
                    <td class="w-1/2 py-2 px-4 text-end">{{formatNumber(total)}}円</td>
                </tr>
            </template>
      </v-data-table>
    </v-card>
  </div>
</template>