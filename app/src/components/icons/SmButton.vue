<script setup>
  const props = defineProps({
    type: {
      type: String,
      default: 'button',
    },
    value: {
      type: String,
      default: '送信',
    }
  })

  const emit = defineEmits(['click'])
  const  handleClick = (val) => {
    emit('click', val)
  }
</script>

<template>
  <button
    :type="type"
    class="border-2 border-gray-700 rounded-md p-2"
    @click="handleClick"
    >
    {{ value }}
  </button>
</template>
