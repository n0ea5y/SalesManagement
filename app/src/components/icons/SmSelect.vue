<script setup>
  const props = defineProps({
    items: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: '',
    },
    itemTitle: {
      type: String,
      default: 'title',
    },
    itemValue: {
      type: String,
      default: 'key',
    },
    returnObj: {
      type: Boolean,
      default: false,
    },
    require:{
      type: Boolean,
      default: false,
    }
  })


  const modelValue = defineModel();
</script>

<template>
  <v-select
    :label="label"
    :items="items"
    :item-title="itemTitle"
    :item-value="itemValue"
    :return-object="returnObj"
    :require="require"
    v-model="modelValue"
    variant="outlined"
    append-icon=""

  >
  <template #label>
      <span v-if="require"><span class="text-red-500">※</span> {{ label }}</span>
      <span v-else>{{ label }}</span>
    </template>
</v-select>

</template>
