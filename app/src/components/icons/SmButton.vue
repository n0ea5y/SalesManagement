<script setup>
  const props = defineProps({
    type: {
      type: String,
      default: 'store',
      validator: (value) => ['store', 'update', 'delete'].includes(value),
    },
    label: {
      type: String,
      default: '送信',
    }
  })

  const color = {
    store: 'bg-blue-200',
    update: 'bg-yellow-200',
    delete: 'bg-red-200',
  };

  const emit = defineEmits(['click'])
  const  handleClick = (val) => {
    emit('click', val)
  }
</script>

<template>
  <button
    class="border-2 border-gray-700 rounded-md p-2"
    :class="color[props.type]"
      @click="handleClick"
    >
    {{ label }}
  </button>
</template>
