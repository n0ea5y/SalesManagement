<script setup>
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import Loading from 'vue-loading-overlay'
import { media, wholesalers, GAIHAN_ID, staffid } from '@/views/Tools/constants'

import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore'
import { db } from '@/assets/firebase.init'
import { ref } from 'vue'

const isLoading = ref(false)

const props = defineProps({
  label: {
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

  const [data, targetData, staffList, wholesalersData] = await getSelectMonthDayData(props.year, props.month)
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
  // =============================================


  // 4. バッファへ書き出し
  const buffer = await workbook.xlsx.writeBuffer()

  // 5. ブラウザでファイル保存
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, 'template.xlsx')
  isLoading.value = false
}

// でーたをまとめる
const getSelectMonthDayData = async (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = [...Array(daysInMonth)].map((_, i) => i + 1)

  const targetDay = await getDailyTarget(days, year, month)
  const mediaData = await getTest(days, year, month)
  const staffList = await getStaff(days, year, month);
  const wholesalersData = await getWholesalers(days, year, month)
  return [mediaData, targetDay, staffList, wholesalersData]
}

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
  const test = {}
  const whole_sales = {}
  // Promise 配列の作成
  const promises = days.map(async (day) => {
    // ドキュメント参照に変更
    const docRef = doc(db, 'total_wholesaler_sales', year + '_' + month, 'days', String(day))
    const snapshot = await getDoc(docRef) // ドキュメント取得
    return { day, snapshot }
  })

  // Promise を全て解決する
  const seleList = await Promise.all(promises)
  if (seleList && seleList.length > 0) {
    seleList.forEach(({ day, snapshot }) => {
      const dayStr = String(day)

      // IDちぇっく
      if (!whole_sales[dayStr]) {
        whole_sales[dayStr] = {}
      }

      // でーたちぇっく
      if (snapshot.exists()) {
        snapshot.data().media.forEach((element) => {
          whole_sales[day][element.media_name] = element.media_amount
        })
      }
    })
  }
  return whole_sales;
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

    snapshot.forEach((doc) => {
      const data = doc.data()
      const key = data.staff_in_charge

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
  return mediaList
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
  <v-btn @click="execlDL">{{ label }}</v-btn>
  <div
    v-if="isLoading"
    class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-xl shadow-xl bg-gray-500 bg-opacity-30 flex justify-center items-center z-50"
  >
    <div class="flex flex-col items-center">
      <Loading :active="isLoading" :is-full-page="false" />
      <p>だうんろーどしています...</p>
    </div>
  </div>
</template>
