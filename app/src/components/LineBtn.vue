<script setup>
 import axios from 'axios'
import { computed, ref, watch } from 'vue';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/assets/firebase.init'
import { insertToast, updateToast, deleteToast } from '../views/Tools/Toast';
import { formatNumberNonYen } from '@/views/Tools/format';

    const props = defineProps({
    parentDate: {
        type: String,
    }
    })

    watch(() => props.parentDate, async (newVal) => {
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
    const errorMessage = ref({});
    const errorText = ref('');
    const todayTagetSale = ref(''); //本日の売上目標
    const day = computed(() => {
        const today = new Date(props.parentDate)
        const formatted = `${today.getMonth() + 1}月${today.getDate()}日(${['日','月','火','水','木','金','土'][today.getDay()]})`;
        return formatted
    })

    const getEmployee = async () => {
        const q = query(collection(db, "employee"),where("today", "==", props.parentDate));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            return docSnap.data().num;
        }else{
            return null;
        }
    }

    const getMonthEmployee = async () => {
        const q = query(collection(db, "employee"),
        where("today", ">=", startDay.value),
        where("today", "<=", lastDay.value),
    );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const querySnapshot = await getDocs(q);
            let num = 0
            querySnapshot.forEach((doc) => {
                if(doc.data().num){
                    num += parseInt(doc.data().num);
                }
            });

            return num;
        }else{
            return null;
        }
    }

    // 売上実績
    const getDailySale = async () => {
        errorMessage.value = {};
        const q = query(collection(db, "daily_sales"),where("today", "==", props.parentDate));
        const querySnapshot = await getDocs(q);
        let amount = 0
        querySnapshot.forEach((doc) => {
            const key = doc.data().today;
            if (!doc.data().amount) {
                if(!errorMessage.value[key]){
                    errorMessage.value[key] = 1;
                }else{
                    errorMessage.value[key] += 1;
                }
            }

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
            if(doc.data().amount){
                amount += parseInt(doc.data().amount);
            }
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
        }
        const targetSalesTotal = parseInt(await getDailySaleTargetTotal()); // 今月累計売上目標
        const sales = parseInt(await getDailySale());                       // 売上実績
        const salesTotal = parseInt(await getgetDailySaleTotal());          // 今月累計売上
        const salary = parseInt(await getStaffHourlyWage());                // 当日アルバイト人件費
        const salaryTotal = parseInt(await getStaffHourlyWageTotal());      // アルバイト人件費累計

        const employeeNum = await getEmployee(); //当日
        const employeeMonthNum = await getMonthEmployee(); //今月
        console.log(employeeMonthNum);

        if (errorMessage.value && Object.keys(errorMessage.value).length > 0) {
            const date = Object.keys(errorMessage.value)[0]; // キーを取得
            const count = errorMessage.value[date];        // 値を取得
            deleteToast(`${formatDate(date)} \n ${count}件金額が未入力です`)
            return;
        }


    const msg =
`${msgTitle} \n
${day.value} \n
売上目標 \n${formatNumberNonYen(targetSales)}\n
売上実績 \n ${formatNumberNonYen(sales)}　${(Math.floor((sales / targetSales) * 100))}％ \n
今月累計売上目標\n ${formatNumberNonYen(targetSalesTotal)} \n
今月累計売上\n ${formatNumberNonYen(salesTotal)}　${Math.floor(((salesTotal / targetSalesTotal) * 100))}％\n
当日アルバイト人件費\n ${formatNumberNonYen(salary)}　${Math.floor(((salary / sales) * 100))}％\n
アルバイト人件費累計\n ${formatNumberNonYen(salaryTotal)}　${Math.floor(((salaryTotal / targetSalesTotal) * 100))}％\n
当日人件費社員込み\n ${formatNumberNonYen(salary + (parseInt(employeeNum) * 16000))}　${Math.floor(((salary + (parseInt(employeeNum) * 16000)) / sales) * 100)}％\n
総人件費累計\n ${formatNumberNonYen(salaryTotal + (parseInt(employeeMonthNum) * 16000))}　${Math.floor(((salaryTotal + (parseInt(employeeMonthNum) * 16000)) / salesTotal) * 100)}％\n
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

function formatDate(date) {
    const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日`;
}
</script>

<template>
    {{ errorText }}
    <v-btn
      style="background-color: #00B900; color: white;"
     @click="lineSend"><span class="mdi mdi-receipt-text-send-outline text-lg"></span>Line 送信</v-btn>
</template>