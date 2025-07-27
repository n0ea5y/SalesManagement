<script setup>
const props = defineProps({
  headers: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: '300px',
  },
  action: {
    type: Boolean,
    default: false,
  },
  w_overflow: {
    type: Boolean,
    default: false,
  },
  inout: {
    type: Boolean,
    default: false,
  }
})
const emit = defineEmits(['rowClick', 'deleteRow'])
const formatNumber = (num) => {
  if (num == null || num === '') return ''
  return '￥' + Number(num).toLocaleString() + '円'
}
</script>

<template>
  <div :class="w_overflow ? 'w-full overflow-x-auto' : ''">
    <v-data-table :headers="headers" :items="items" :items-per-page="-1" class="bg-transparent max-h-[300px]"
      :class="[w_overflow ? 'min-w-[900px]' : '', height]" fixed-header hide-default-footer>
      <template v-if="inout" v-slot:item="{ item }">
        <tr :class="{ 'bg-red-300': !item.amount }">
          <td>{{ item.in_time }}</td>
          <td>{{ item.table_number }}</td>
          <td>{{ item.media_name }}</td>
          <td>{{ item.staff_name }}</td>
          <td>{{ item.people_count }}</td>
          <td>{{ item.plan }}</td>
          <td>{{ item.otoshi }}</td>
          <td>{{ item.food }}</td>
          <td>{{ formatNumber(item.amount) }}</td>
          <td class="flex gap-4 items-center">
            <!-- 削除ボタン -->
            <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="error"
              @click="() => emit('deleteRow', item)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6 7h12M9 7v10a2 2 0 0 0 4 0V7M5 7h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7zM10 4h4m-3 0V3a1 1 0 1 0-2 0v1m6 0V3a1 1 0 1 0-2 0v1" />
              </svg>
            </v-btn>

            <!-- 更新ボタン -->
            <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="#fef08a"
              @click="() => emit('rowClick', item)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </v-btn>
          </td>
        </tr>
      </template>

      <template #item.action="{ item }">
        <v-btn class="rounded" size="x-small" icon="fa:fas fa-edit" base-color="#fef08a"
          @click="() => emit('rowClick', item)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
