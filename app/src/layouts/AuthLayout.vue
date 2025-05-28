<script setup>
  import HeaderView from '@/views/components/HeaderView.vue';
</script>

<template>
  <div class="mb-4">
    <HeaderView>
    </HeaderView>
  </div>
  <main>
    <slot></slot>
  </main>
</template>
