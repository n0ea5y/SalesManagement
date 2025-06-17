<script setup>
  import { useId } from 'vue';

  const props = defineProps({
    type: {
      type: String,
      default: 'text',
    },
    label: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    }
  })

  const vModel = defineModel({ type: String, default: ''})
  const uniqueId = props.id || useId();
</script>

<template>
  <label :for="uniqueId">{{ props.label }}</label>
  <input
    :id="uniqueId"
    :type="props.type"
    class="border-2 border-gray-700 rounded-md p-2"
    v-model="vModel"
    >
</template>
