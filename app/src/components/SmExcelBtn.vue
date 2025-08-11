<script setup>
import { onMounted, ref, watch } from 'vue';
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Loading from 'vue-loading-overlay'
import { MEDIA_ID, wholesalers, GAIHAN_ID, staffid, staffcell, paymentMethodsCell } from '@/views/Tools/constants'
import { collection, getDocs, getDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/assets/firebase.init'
import { insertToast, updateToast, deleteToast } from '../views/Tools/Toast';


const props = defineProps({
  parentDate: {
    type: String,
  }
})
onMounted(() => {
  if (!props.parentDate) return;
  setStartDayAndLastDay();
  })

  const startDay = ref('');
  const lastDay = ref('');
  const isLoading = ref(false);
  const CATCHID = 'SiBHolMYOW9dzytgYzPW'

  watch(() => props.parentDate, (newVal, oldVal) => {
    // 初回 or 年月が変わったときだけ実行
    if (!oldVal || newVal.slice(0, 7) !== oldVal.slice(0, 7)) {
      setStartDayAndLastDay();
    }
  });

  const setStartDayAndLastDay = () => {
    const [year, month] = props.parentDate.split('-').map(Number);

    // 月初日
    startDay.value = `${year}-${String(month).padStart(2, '0')}-01`;

    // 月末日（翌月0日を指定するとその月の末日になる）
    const lastDateObj = new Date(year, month, 0);
    lastDay.value = `${lastDateObj.getFullYear()}-${String(lastDateObj.getMonth() + 1).padStart(2, '0')}-${String(lastDateObj.getDate()).padStart(2, '0')}`;
  };

  const excelDL = async () => {
    isLoading.value = true;
    const result = await getSalesRecordsRealtime();
    if (result.error) {
      deleteToast(result.error);
      return;
    }
    const inoutData = result.data;  // ← ここで配列を取り出す

    // しはらいほうほ
    const pytmentMethod = await getPaymentMethodRecord();

    // うりあげもくひょう
    const dailySalesTarget = await getDailySalesTarget();

    const wholeSales = await getWholeSales();
    const staffList = await getStaff();
    const catchList = await getCache();

  const response = await fetch('/omiya_template.xlsx')
  const arrayBuffer = await response.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)
  const sheet = workbook.worksheets[0]

  // ばいたいにゅうりょう
  let num = 3;
  inoutData.forEach((element) => {
    element.staffData.forEach((v) => {
      let cell = MEDIA_ID[v.id];
      sheet.getCell(cell  + Number(num)).value = v.count
      cell = incrementExcelColumn(cell);
      sheet.getCell(cell  + Number(num)).value = v.guest_count
      cell = incrementExcelColumn(cell);
      sheet.getCell(cell  + Number(num)).value = v.amount
    })
    num++;
  })

  // しはらいほうほう
  num = 3;
  pytmentMethod.forEach((element) => {
    element.pymentMethod.forEach((v) => {
      sheet.getCell('AF'  + Number(num)).value = v.cash
      sheet.getCell('AG'  + Number(num)).value = v.card
      sheet.getCell('AH' + Number(num)).value = v.point
    })
    num++;
  })

    // うりあげもくひょう
  num = 3;
  dailySalesTarget.forEach((element) => {
      sheet.getCell('AC'  + Number(num)).value = element.target_sales
    num++;
  })

  // りょうしゅうしょ
  num = 3;
  wholeSales.byDate.forEach((element) => {
      sheet.getCell('AJ'  + Number(num)).value = element.amount
    num++;
  })
  
  // きゃっちしーと
  const sheet2 = workbook.worksheets[1]
  num = 3;
  catchList.data.forEach((element) => {
    element.staffData.forEach((v) => {
      let cell = staffid[v.id];
      sheet2.getCell(cell  + Number(num)).value = v.count
      cell = incrementExcelColumn(cell);
      sheet2.getCell(cell  + Number(num)).value = v.guest_count
      cell = incrementExcelColumn(cell);
      sheet2.getCell(cell  + Number(num)).value = v.amount
    })
    num++;
  })

  const sheet3 = workbook.worksheets[2]
  // おろしうりぎょうしゃ
  num = 2;
  wholeSales.byDateAndId.forEach((element) => {
    element.staffData.forEach((v) => {
      let cell = wholesalers[v.id];
      sheet3.getCell(cell  + Number(num)).value = v.amount
    })
    num++;
  })

  
  // すたっふきんたい
  const sheet4 = workbook.worksheets[3]
  num = 3;
  staffList.data.forEach((element) => {
    element.staffData.forEach((v) => {
      let cell = staffcell[v.id];
      sheet4.getCell(cell  + Number(num)).value = v.salary
    })
    num++;
  })

  
  // 4. バッファへ書き出し
  const buffer = await workbook.xlsx.writeBuffer()

  // 5. ブラウザでファイル保存
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `酔っ来い所_大宮.xlsx`)
  isLoading.value = false;

  }

  // すたっふしーとにゅうりょく
const getStaff = async () => {
    const q = query(collection(db, "staff_hourly_wage"),
      where("today", ">=", startDay.value),
      where("today", "<=", lastDay.value),
      orderBy("today", "asc")
    );

  try {
    const querySnapshot = await getDocs(q);

    const map = {};

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const amountStr = data.salary;

      const date = data.today;
      const id = data.staff_id;
      const key = `${date}_${id}`;

      if (!map[key]) {
        map[key] = {
          id,
          today: date,
          salary: 0
        };
      }

      map[key].salary += parseInt(amountStr) || 0;
    }

    const resultArray = Object.values(map);

    // 日付配列作成
    const [yearStr, monthStr] = startDay.value.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();

    const fullDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = String(day).padStart(2, '0');
      fullDates.push(`${yearStr}-${monthStr}-${d}`);
    }

    const dailyDataMap = {};
    fullDates.forEach(date => {
      dailyDataMap[date] = [];
    });

    resultArray.forEach(item => {
      if (!dailyDataMap[item.today]) {
        dailyDataMap[item.today] = [];
      }
      dailyDataMap[item.today].push(item);
    });

    const finalArray = fullDates.map(date => ({
      date,
      staffData: dailyDataMap[date] || []
    }));

    return { data: finalArray };

  } catch (error) {
    deleteToast(error);
    return { error: error.message || 'Firestoreデータ取得エラー' };
  }
};

const getDailySalesTarget = async () => {
  const q = query(
    collection(db, "daily_sales_target"),
    where("today", ">=", startDay.value),
    where("today", "<=", lastDay.value),
    orderBy("today", "asc")
  );

  try {
    const querySnapshot = await getDocs(q);

    // Firestoreデータをオブジェクトに変換（検索しやすくする）
    const salesMap = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      salesMap[data.today] = data.target_sales;
    });

    // 指定期間の全日付を作成
    const result = [];
    let current = new Date(startDay.value);
    const end = new Date(lastDay.value);

    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      result.push({
        today: dateStr,
        target_sales: salesMap[dateStr] || ""
      });

      current.setDate(current.getDate() + 1); // 次の日へ
    }

    return result;

  } catch (error) {
    deleteToast(error);
    return { error: error.message || 'Firestoreデータ取得エラー' };
  }
};

  // おろしうりぎょうしゃにゅうりょく
const getWholeSales = async () => {
  const q = query(
    collection(db, "whole_sales"),
    where("today", ">=", startDay.value),
    where("today", "<=", lastDay.value),
    orderBy("today", "asc")
  );

  try {
    const querySnapshot = await getDocs(q);

    const dateMap = {};    // 日付だけで集計
    const dateIdMap = {};  // 日付＋IDで集計

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const date = data.today;
      const id = data.key;
      const amount = parseInt(data.amount) || 0;

      // 日付別
      if (!dateMap[date]) {
        dateMap[date] = { today: date, amount: 0 };
      }
      dateMap[date].amount += amount;

      // 日付＋ID別
      const compositeKey = `${date}_${id}`;
      if (!dateIdMap[compositeKey]) {
        dateIdMap[compositeKey] = { today: date, id, amount: 0 };
      }
      dateIdMap[compositeKey].amount += amount;
    }

    // 日付配列作成
    const [yearStr, monthStr] = startDay.value.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();

    const fullDates = Array.from({ length: daysInMonth }, (_, i) =>
      `${yearStr}-${monthStr}-${String(i + 1).padStart(2, '0')}`
    );

    // byDate配列
    const byDate = fullDates.map(date => ({
      date,
      amount: dateMap[date]?.amount || 0
    }));

    // byDateAndId配列
    const dailyDataMap = {};
    fullDates.forEach(date => {
      dailyDataMap[date] = [];
    });
    Object.values(dateIdMap).forEach(item => {
      dailyDataMap[item.today].push(item);
    });

    const byDateAndId = fullDates.map(date => ({
      date,
      staffData: dailyDataMap[date]
    }));

    return {
      byDate,
      byDateAndId
    };

  } catch (error) {
    deleteToast(error);
    return { error: error.message || 'Firestoreデータ取得エラー' };
  }
};

// ばいたい
const getSalesRecordsRealtime = async () => {
  const q = query(
    collection(db, "daily_sales"),
    where("today", ">=", startDay.value),
    where("today", "<=", lastDay.value),
    orderBy("today", "asc")
  );

  try {
    const querySnapshot = await getDocs(q);

    const map = {};

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const amountStr = data.amount;

      // amountが存在しない or 数値に変換できない場合は早期リターンでエラー通知
      if (amountStr === undefined || amountStr === null || amountStr === '' || isNaN(Number(amountStr))) {
        return { error: 'インアウト表で金額が入っていない日があります' };
      }

      const date = data.today;
      const id = data.staff_in_charge;
      const key = `${date}_${id}`;

      if (!map[key]) {
        map[key] = {
          id,
          today: date,
          count: 0,
          guest_count: 0,
          amount: 0
        };
      }

      map[key].guest_count += data.guest_count || 0;
      map[key].amount += parseInt(amountStr) || 0;
      map[key].count++;
    }

    const resultArray = Object.values(map);

    // 日付配列作成
    const [yearStr, monthStr] = startDay.value.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();

    const fullDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = String(day).padStart(2, '0');
      fullDates.push(`${yearStr}-${monthStr}-${d}`);
    }

    const dailyDataMap = {};
    fullDates.forEach(date => {
      dailyDataMap[date] = [];
    });

    resultArray.forEach(item => {
      if (!dailyDataMap[item.today]) {
        dailyDataMap[item.today] = [];
      }
      dailyDataMap[item.today].push(item);
    });

    const finalArray = fullDates.map(date => ({
      date,
      staffData: dailyDataMap[date] || []
    }));

    return { data: finalArray };

  } catch (error) {
    deleteToast(error);
    return { error: error.message || 'Firestoreデータ取得エラー' };
  }
};

// しはらいほうほう
const getPaymentMethodRecord = async () => {
  const q = query(
    collection(db, "daily_sales"),
    where("today", ">=", startDay.value),
    where("today", "<=", lastDay.value),
    orderBy("today", "asc")
  );

  try {
    const querySnapshot = await getDocs(q);

    const dateMap = {}; // { date: { cash, card, point } }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.today;
      const paymentMethod = data.pyment_method || 'unknown';

      if (!dateMap[date]) {
        dateMap[date] = {
          cash: 0,
          card: 0,
          point: 0,
        };
      }

      const amount = parseInt(data.amount) || 0;
      const point = parseInt(data.point) || 0;

      switch(paymentMethod) {
        case 'cash':
          dateMap[date].cash += amount;
          break;
        case 'card':
          dateMap[date].card += amount;
          break;
        case 'point':
          dateMap[date].point += point;  // ポイント数だけ加算
          dateMap[date].cash += amount;  // amountは残額としてcashに加算（必要なければ調整可）
          break;
        default:
          dateMap[date].cash += amount;
          break;
      }
    });

    const [yearStr, monthStr] = startDay.value.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();

    const fullDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      fullDates.push(`${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`);
    }

    const finalArray = fullDates.map(date => {
      const data = dateMap[date] || { cash: 0, card: 0, point: 0 };
      return {
        date,
        pymentMethod: [
          {
            pymentMethod: 'all',
            today: date,
            cash: data.cash,
            card: data.card,
            point: data.point,
          }
        ]
      };
    });

    return finalArray;

  } catch (error) {
    return [];
  }
};

// きゃっちしーとにゅうりょく
const getCache = async () => {
    const q = query(collection(db, "daily_sales"),
      where("staff_in_charge", "==", CATCHID),
      where("today", ">=", startDay.value),
      where("today", "<=", lastDay.value),
      orderBy("today", "asc")
    );

  try {
    const querySnapshot = await getDocs(q);

    const map = {};

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const amountStr = data.amount;

      const date = data.today;
      const id = data.staff_id;
      const key = `${date}_${id}`;

      if (!map[key]) {
        map[key] = {
          id,
          today: date,
          count: 0,
          guest_count: 0,
          amount: 0
        };
      }

      map[key].guest_count += data.guest_count || 0;
      map[key].amount += parseInt(amountStr) || 0;
      map[key].count++;
    }

    const resultArray = Object.values(map);

    // 日付配列作成
    const [yearStr, monthStr] = startDay.value.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();

    const fullDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = String(day).padStart(2, '0');
      fullDates.push(`${yearStr}-${monthStr}-${d}`);
    }

    const dailyDataMap = {};
    fullDates.forEach(date => {
      dailyDataMap[date] = [];
    });

    resultArray.forEach(item => {
      if (!dailyDataMap[item.today]) {
        dailyDataMap[item.today] = [];
      }
      dailyDataMap[item.today].push(item);
    });

    const finalArray = fullDates.map(date => ({
      date,
      staffData: dailyDataMap[date] || []
    }));

    return { data: finalArray };

  } catch (error) {
    deleteToast(error);
    return { error: error.message || 'Firestoreデータ取得エラー' };
  }
};

// いんくりめとかんすう
function incrementExcelColumn(col) {
  let carry = 1
  let result = ''
  for (let i = col.length - 1; i >= 0; i--) {
    let charCode = col.charCodeAt(i) + carry
    if (charCode > 90) {
      charCode = 65
      carry = 1
    } else {
      carry = 0
    }
    result = String.fromCharCode(charCode) + result
  }

  if (carry === 1) {
    result = 'A' + result
  }

  return result
}
</script>

<template>
  <v-btn color="green" @click="excelDL">excel DL</v-btn>
  <!-- <v-btn color="green" @click="execlDL">execl DL</v-btn> -->
  <pre>
    {{ startDay }}
    {{ lastDay }}

  </pre>
  <div
    v-if="isLoading"
    class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-xl shadow-md bg-gray-500 bg-opacity-90 flex justify-center items-center z-50"
  >
    <div class="flex flex-col items-center">
      <Loading :active="isLoading" :is-full-page="false" />
      <p class="text-white font-bold text-xl mt-[20px]">だうんろーどしています...</p>
    </div>
  </div>
</template>
