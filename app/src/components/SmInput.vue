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
  <!-- <label :for="uniqueId">{{ props.label }}</label> -->
  <v-text-field :label="label" variant="outlined" 
    :id="uniqueId"
    :type="type"
    v-model="vModel"
  ></v-text-field>
</template>
