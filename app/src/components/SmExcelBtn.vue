<script setup>
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Loading from 'vue-loading-overlay'
import { media, wholesalers, GAIHAN_ID, staffid, staffcell } from '@/views/Tools/constants'

import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore'
import { db } from '@/assets/firebase.init'
import { ref } from 'vue'

const isLoading = ref(false)
const staffList = ref([]);
const staffWages = ref({});

const getStaffList = async () => {
  const colRef = collection(db, 'staff');
  const snapshot = await getDocs(colRef);

  staffList.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const wages = {};
  staffList.value.forEach(staff => {
    wages[staff.id] = staff.hourly_wage;
  });
  staffWages.value = wages;
};

getStaffList();

const props = defineProps({
  label: {
    type: String,
  },

  color: {
    type: String,
  },
  year: {
    type: String,
  },
  month: {
    type: String,
  },
})

const execlDL = async () => {
  isLoading.value = true
  const [data, targetData, staffList, wholesalersData, daily_salary, dayWholesalersTotal, amount_cash, amount_card, amount_point] = await getSelectMonthDayData(props.year, props.month)
  const response = await fetch('/omiya_template.xlsx')
  const arrayBuffer = await response.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(arrayBuffer)
  const sheet = workbook.worksheets[0]
  // =============================================

  // えくせるかきこみ:しーと１
  data.forEach((element) => {
    if (Object.keys(element.staffData).length !== 0) {
      const num = element.day
      Object.entries(element.staffData).forEach(([staffId, info]) => {
        sheet.getCell(media[staffId] + num).value = info.count
        const cell1 = incrementExcelColumn(media[staffId])
        sheet.getCell(cell1 + num).value = info.guest_count
        const cell2 = incrementExcelColumn(cell1)
        sheet.getCell(cell2 + num).value = info.amount
      })
    }
  })

  // げんきん
  Object.entries(amount_cash).forEach(([day, total]) => {
    sheet.getCell('AF' + (Number(day) + 2)).value = total
  });
  // かーど
  Object.entries(amount_card).forEach(([day, total]) => {
    sheet.getCell('AG' + (Number(day) + 2)).value = total
  });
  // ぽいんと
  Object.entries(amount_point).forEach(([day, total]) => {
    sheet.getCell('AH' + (Number(day) + 2)).value = total
  });
  // りょうしゅうしょ
  Object.entries(dayWholesalersTotal).forEach(([day, total]) => {
    sheet.getCell('AJ' + (Number(day) + 2)).value = total
  });


  // ひべつもくひょうにゅうりょく
  for (const [key, value] of Object.entries(targetData)) {
    sheet.getCell('AC' + key).value = value
  }

  const sheet1 = workbook.worksheets[1]
  for (const [key, value] of Object.entries(staffList)) {
    if (Object.keys(value).length === 0) continue;

    for (const [innerKey, innerValue] of Object.entries(value)) {
        sheet1.getCell(staffid[innerKey] + (Number(key) + 1)).value = innerValue.count;
        const cell1 = incrementExcelColumn(staffid[innerKey])
        sheet1.getCell(cell1 + (Number(key) + 1)).value = innerValue.data.guest_count;
        const cell2 = incrementExcelColumn(cell1)
        sheet1.getCell(cell2  + (Number(key) + 1)).value = innerValue.data.amount;
    }
  }

  const sheet2 = workbook.worksheets[2]
  // ぎょうしゃしはらいかきこみ
for (const [key, value] of Object.entries(wholesalersData)) {
  // 空オブジェクトをスキップ
  if (Object.keys(value).length === 0) continue;


  for (const [innerKey, innerValue] of Object.entries(value)) {
    sheet2.getCell(wholesalers[innerKey] + (Number(key) + 1)).value = innerValue
  }
}

// きゅうりょう（ばいと）
  const sheet3 = workbook.worksheets[3];
  Object.entries(daily_salary).forEach(([key, value]) => {
    if(value.length != 0){
      value.forEach(element => {
        const hourlyWage = Number(staffWages.value[element.name]);
        const before22 = Number(element.before22 ?? 0) * hourlyWage;
        const after22  = Number(element.after22  ?? 0) * hourlyWage * 1.25;
        const total = before22 + after22;
        sheet3.getCell(staffcell[element.name] + (Number(key) + 1)).value = total
      });
    }
  });
  // =============================================

  // 4. バッファへ書き出し
  const buffer = await workbook.xlsx.writeBuffer()

  // 5. ブラウザでファイル保存
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `${props.year}_${props.month}_酔っ来い所_大宮.xlsx`)
  isLoading.value = false
}

// でーたをまとめる
const getSelectMonthDayData = async (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = [...Array(daysInMonth)].map((_, i) => i + 1)

  const targetDay = await getDailyTarget(days, year, month)
  const [mediaData, amount_cash, amount_card, amount_point] = await getTest(days, year, month)
  const staffList = await getStaff(days, year, month);
  const [wholesalersData, dayWholesalersTotal] = await getWholesalers(days, year, month)
  const daily_salary  = await getAllRecords(days, year, month)
  return [mediaData, targetDay, staffList, wholesalersData, daily_salary, dayWholesalersTotal, amount_cash, amount_card, amount_point]
}

const getAllRecords = async (dates, year, month) => {
  const allData = {};

  const promises = dates.map(async (dateStr) => {
    const colRef = collection(db, 'staff_hourly_wage', year + '-' + month + '-' + dateStr, 'records');
    const snapshot = await getDocs(colRef);

    allData[dateStr] = [];

    snapshot.forEach((doc) => {
      allData[dateStr].push({
        id: doc.id,
        ...doc.data()
      });
    });
  });

  await Promise.all(promises);

  return allData;
};

// きゃっちよう
const getStaff = async (days, year, month) => {
  const specificStaffId = 'SiBHolMYOW9dzytgYzPW'
  const specificStaffData = {}

  const promises = days.map(async (day) => {
    const colRef = collection(db, 'daily_sales', year, month, String(day), 'records')
    const snapshot = await getDocs(colRef)
    return { day, snapshot }
  })

  const seleList = await Promise.all(promises)

  seleList.forEach(({ day, snapshot }) => {
    const dayStr = String(day)
    if (!specificStaffData[dayStr]) {
      specificStaffData[dayStr] = {}
    }

    snapshot.forEach((doc) => {
      const data = doc.data()
      const key = data.staff_in_charge
      const sid = data.staff_id

      if (key === specificStaffId) {
        if (!specificStaffData[dayStr][sid]) {
          specificStaffData[dayStr][sid] = {
            data: {
              amount: 0,
              guest_count: 0,
              food_count: 0,
              // 必要に応じて他のフィールドも初期化
            },
            count: 0,
          }
        }
        specificStaffData[dayStr][sid].data.amount += Number(data.amount)
        specificStaffData[dayStr][sid].data.guest_count += Number(data.guest_count)
        specificStaffData[dayStr][sid].data.food_count += Number(data.food_count)
        specificStaffData[dayStr][sid].count++
      }
    })
  })

  return specificStaffData
}

// 業者支払い
const getWholesalers = async (days, year, month) => {
  const whole_sales = {}
  const day_total = {}

  const promises = days.map(async (day) => {
    const docRef = doc(db, 'total_wholesaler_sales', `${year}_${month}`, 'days', String(day))
    const snapshot = await getDoc(docRef)
    return { day, snapshot }
  })

  const seleList = await Promise.all(promises)

  if (seleList && seleList.length > 0) {
    seleList.forEach(({ day, snapshot }) => {
      const dayStr = String(day)

      if (!whole_sales[dayStr]) {
        whole_sales[dayStr] = {}
      }

      let total = 0 // 合計金額の初期化

      if (snapshot.exists()) {
        const data = snapshot.data()
        if (Array.isArray(data.media)) {
          data.media.forEach((element) => {
            const mediaName = element.media_name
            const amount = Number(element.media_amount) || 0

            whole_sales[dayStr][mediaName] = amount
            total += amount
          })
        }
      }

      day_total[dayStr] = total
    })
  }

  return  [whole_sales, day_total]
}


// 日別目標
const getDailyTarget = async (days, year, month) => {
  const test = {}
  // Promise 配列の作成
  const promises = days.map(async (day) => {
    // ドキュメント参照に変更
    const docRef = doc(db, 'daily_sales_target', year, month, String(day)) // doc でドキュメント参照
    const snapshot = await getDoc(docRef) // ドキュメント取得
    return { day, snapshot }
  })

  // Promise を全て解決する
  const seleList = await Promise.all(promises)

  seleList.forEach(({ day, snapshot }) => {
    const dayStr = String(day)
    // snapshot が存在する場合のみ処理
    if (snapshot.exists()) {
      test[day] = snapshot.data().day_sales
    }
  })

  return test
}

// 日別売上
const getTest = async (days, year, month) => {
  const media_agencies = {}
  const amount_cash = {}
  const amount_card = {}
  const amount_point = {}

  const promises = days.map(async (day) => {
    const colRef = collection(db, 'daily_sales', year, month, String(day), 'records')
    const snapshot = await getDocs(colRef)
    return { day, snapshot }
  })

  const seleList = await Promise.all(promises)

  seleList.forEach(({ day, snapshot }) => {
    const dayStr = String(day)

    if (!media_agencies[dayStr]) {
      media_agencies[dayStr] = {}
    }
    if (!amount_cash[dayStr]) amount_cash[dayStr] = 0
    if (!amount_card[dayStr]) amount_card[dayStr] = 0
    if (!amount_point[dayStr]) amount_point[dayStr] = 0

    snapshot.forEach((doc) => {
      const data = doc.data()
      const key = data.staff_in_charge


      if(data.pyment_method == 'cash'){
        amount_cash[dayStr] += Number(data.amount);
      }else if(data.pyment_method == 'card'){
        amount_card[dayStr] += Number(data.amount);
      }else if(data.pyment_method == 'point'){
        amount_cash[dayStr] += Number(data.amount);
        amount_point[dayStr] += Number(data.amount);
      }

      if (!media_agencies[dayStr][key]) {
        media_agencies[dayStr][key] = {
          amount: Number(data.amount),
          guest_count: Number(data.guest_count),
          count: 1,
        }
      } else {
        media_agencies[dayStr][key].amount += Number(data.amount)
        media_agencies[dayStr][key].guest_count += Number(data.guest_count)
        media_agencies[dayStr][key].count++
      }
    })
  })

  const mediaList = Object.entries(media_agencies).map(([day, staffData]) => ({
    day,
    staffData,
  }))

  return [mediaList, amount_cash, amount_card, amount_point]
}

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
  <v-btn color="green" @click="execlDL">{{ label }}</v-btn>
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
