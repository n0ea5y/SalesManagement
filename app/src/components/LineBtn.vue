<script setup>
 import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue';
import { collection, getDocs, getDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/assets/firebase.init'
import { insertToast, updateToast, deleteToast } from '../views/Tools/Toast';
import { formatNumber } from '@/views/Tools/format';

    const props = defineProps({
    parentDate: {
        type: String,
    }
    })

    watch(() => props.parentDate, async (newVal) => {
        console.log(newVal)
        await getDailySale();
    })
    const startDay = computed(() => {
        const [year, month] = props.parentDate.split('-').map(Number);
        return `${year}-${String(month).padStart(2, '0')}-01`;
    });

    const lastDay = computed(() =>{
        return props.parentDate
    });

    const msgTitle = '酔っ来い所   大宮'
    const todayTagetSale = ref(''); //本日の売上目標
    const day = computed(() => {
        const today = new Date(props.parentDate)
        const formatted = `${today.getMonth() + 1}月${today.getDate()}日(${['日','月','火','水','木','金','土'][today.getDay()]})`;
        return formatted
    })

    // 売上実績
    const getDailySale = async () => {
        const q = query(collection(db, "daily_sales"),where("today", "==", props.parentDate));
        const querySnapshot = await getDocs(q);
        let amount = 0
        querySnapshot.forEach((doc) => {
            amount += parseInt(doc.data().amount);
        });
        return amount;
    };

    // 今月累計売上
    const getgetDailySaleTotal = async () => {
        const q = query(
        collection(db, "daily_sales"),
        where("today", ">=", startDay.value),
        where("today", "<=", lastDay.value),
        orderBy("today", "asc")
        );

        let amount = 0;
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            amount += parseInt(doc.data().amount);
        });
        return amount;
    };

    // 売上目標
    const getDailySaleTarget = async () => {
        const q = query(
        collection(db, "daily_sales_target"),
        where("today", "==", props.parentDate)
        );

        const querySnapshot = await getDocs(q);
        if(querySnapshot.empty) {
            return 0;
        };
        const data = querySnapshot.docs[0].data();
        console.log(data.target_sales)
        return data.target_sales;
    };

    // 今月累計売上目標
    const getDailySaleTargetTotal = async () => {
        const q = query(
        collection(db, "daily_sales_target"),
        where("today", ">=", startDay.value),
        where("today", "<=", lastDay.value),
        orderBy("today", "asc")
        );

        let target_sales = 0;
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            target_sales += parseInt(doc.data().target_sales);
        });
        return target_sales;
    };

    // 当日アルバイト人件費
    const getStaffHourlyWage = async () => {
        const q = query(collection(db, "staff_hourly_wage"),
            where("today", "==", props.parentDate),
            orderBy("today", "asc")
        );

        let salary = 0;
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            salary += parseInt(doc.data().salary);
        });
        return salary;
    };

    // アルバイト人件費累計
    const getStaffHourlyWageTotal = async () => {
        const q = query(collection(db, "staff_hourly_wage"),
            where("today", ">=", startDay.value),
            where("today", "<=", lastDay.value),
            orderBy("today", "asc")
        );

        let salaryTotal = 0;
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            salaryTotal += parseInt(doc.data().salary);
        });
        return salaryTotal;
    };
    const lineSend = async () => {
        const targetSales = parseInt(await getDailySaleTarget());           // 売上目標
        if(!targetSales) {
            deleteToast('本日の日別売上目標が設定されていません')
            return
        };
        const targetSalesTotal = parseInt(await getDailySaleTargetTotal()); // 今月累計売上目標
        const sales = parseInt(await getDailySale());                       // 売上実績
        const salesTotal = parseInt(await getgetDailySaleTotal());          // 今月累計売上
        const salary = parseInt(await getStaffHourlyWage());                // 当日アルバイト人件費
        const salaryTotal = parseInt(await getStaffHourlyWageTotal());      // アルバイト人件費累計

    const msg =
`${msgTitle} \n
${day.value} \n
売上目標 \n${formatNumber(targetSales)}\n
売上実績 \n ${formatNumber(sales)}　${((sales / targetSales) * 100).toFixed(2)}％ \n
今月累計売上目標\n ${formatNumber(targetSalesTotal)} \n
今月累計売上\n ${formatNumber(salesTotal)}　${((salesTotal / targetSalesTotal) * 100).toFixed(2)}％\n
当日アルバイト人件費\n ${formatNumber(salary)}　${((salary / sales) * 100).toFixed(2)}％\n
アルバイト人件費累計\n ${formatNumber(salaryTotal)}　${((salaryTotal / targetSalesTotal) * 100).toFixed(2)}％\n
`
  try {
    const res = await axios.post(
      'https://hw185yp245.execute-api.us-east-1.amazonaws.com/yokkoisho_omiya_api_line_bot/yokkoisho',
      { message: msg}
    );
  } catch (error) {
    console.error(error);
  }
};

</script>

<template>
    <v-btn
      style="background-color: #00B900; color: white;"
     @click="lineSend"><span class="mdi mdi-receipt-text-send-outline text-lg"></span>Line 送信</v-btn>
</template>