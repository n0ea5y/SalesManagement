<script setup>
  const props = defineProps ({
    label: {
      type: String,
      default: '',
    },
    class: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    required: {
      type: Boolean,
      default: false,
    },
    bordernone: {
      type: Boolean,
      default: true,
    },
  })

  const vModel = defineModel({})
</script>

<template>
  <v-text-field
    :class="props.class"
    :required="required"
    :type="type"
    :variant="bordernone ? 'underlined' : 'outlined' "
    v-model="vModel"
    >
    <template #label>
      <span v-if="required"><span class="text-red-500">※</span> {{ label }}</span>
      <span v-else>{{ label }}</span>
    </template>
  </v-text-field>
</template>
