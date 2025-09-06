<script setup>
    import { onMounted, ref } from 'vue';
    import { collection, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
    import { db } from '@/assets/firebase.init';
    import { formatNumber } from '../Tools/format';
    import { inject } from 'vue';
    import { GAIHAN_ID } from '../Tools/constants';

    onMounted(() => {
        getStaff();
        getSalaryList()
    })
    
    const grobalItem = inject('grobalItem');
    const today = grobalItem.today;
    const catchList  = ref([]);
    const salaryList = ref([]);
    const total = ref(0);

    const getStaff = async () => {
        const q = query(collection(db, 'staff'),
            where('type', '!=', 1),
            orderBy('name', 'asc')
        )

        const querySnapshot = await getDocs(q);
        catchList.value = querySnapshot.docs.map((doc) => {
            // console.log(doc.data())
            return {'id': doc.id, 'name': doc.data().name, 'rate': doc.data().commissionRate }
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
        const q = query(collection(db, 'daily_sales'),
            where('staff_in_charge', '==', GAIHAN_ID),
            where('today', '>=', startDay),
            where('today', '<=', lastDay),
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const salaryMap = {};

          snapshot.forEach((doc) => {
            const data = doc.data();
            const staffId = data.staff_id;

            // console.log(data)
            total.value += Number(data.amount) || 0;

            if (!salaryMap[staffId]) {
                salaryMap[staffId] = {
                staff_id: staffId,
                amount: 0,
                guest_count: 0,
                count: 0,
                items: []
                };
            }

            salaryMap[staffId].amount += Number(data.amount) || 0;
            salaryMap[staffId].guest_count += Number(data.guest_count) || 0;
            salaryMap[staffId].count ++;
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

        return salary ? salary.amount : '0';
    }
    const guestCountMapping = (v) => {
        const salary = salaryList.value.find((salary) => {
            return salary.staff_id == v;
        })

        return salary ? salary.guest_count : '0';
    }
    const countMapping = (v) => {
        const salary = salaryList.value.find((salary) => {
            return salary.staff_id == v;
        })

        return salary ? salary.count : '0';
    }
    const payMapping = (v, rate) => {
        const salary = salaryList.value.find((salary) => {
            return salary.staff_id == v;
        })

        const rateNum = Number(rate.replace('%', ''));
        return salary ? Math.floor((salary.amount * (rateNum / 100))) : '0';
    }
</script>

<template>
  <div class="overflow-x-auto">
    <v-card class="w-[98%] mx-auto mb-2" subtitle="歩合">
      <v-data-table :headers="headerItems" :items="catchList" :items-per-page="-1" hide-default-header hide-default-footer
        class="bg-transparent max-h-[300px] w-full">
            <template v-slot:item="{ item }">
                <tr class="text-no-wrap">
                    <td class="">{{ item.name }}</td>
                    <td class="text-end">{{ guestCountMapping(item.id) }}人</td>
                    <td class="text-end">{{ countMapping(item.id) }}組</td>
                    <td class="text-end">{{formatNumber(StaffSalaryMapping(item.id))}}円</td>
                    <td class="text-end">{{formatNumber(payMapping(item.id, item.rate))}}円</td>
                </tr>
            </template>
            <!-- <template v-slot:bottom>
                <tr class="flex justify-around font-bold border-t">
                    <td class="w-1/2 py-2 px-4">合計</td>
                    <td class="w-1/2 py-2 px-4 text-end">{{formatNumber(total)}}円</td>
                </tr>
            </template> -->
      </v-data-table>
    </v-card>
  </div>
</template>