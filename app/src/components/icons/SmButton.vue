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
    },
    htmlType: {
      type: String,
      default: 'submit',
    },
  })

  const color = {
    store: '#bfdbfe',
    update: '#fef08a',
    delete: '#fecaca',
  };

  const emit = defineEmits(['click'])
  const  handleClick = () => {
    emit('click')
  }
</script>

<template>
  <v-btn
    size="default"
    :type="htmlType"
    :base-color="color[type]"
    @click="handleClick"
  >
  {{ label }}
  </v-btn>
</template>
