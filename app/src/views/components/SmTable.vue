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
    }
  })
  const emit = defineEmits(['rowClick'])
</script>

<template>
  <v-data-table
      :headers="headers"
      :items="items"
      class="bg-transparent max-h-[300px]"
      :height="height"
      fixed-header
      hide-default-footer
    >
      <template #item.action="{ item }">
          <v-btn class="rounded"
            size="x-small"
            icon="fa:fas fa-edit"
            base-color="#fef08a"
            @click="() => emit('rowClick', item)"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
        </v-btn>
    </template>
  </v-data-table>
</template>
