<script setup>
  import HeaderView from '@/views/components/HeaderView.vue';
</script>

<template>
  <div>
    <div class="mb-4">
      <HeaderView>
      </HeaderView>
    </div>
    <main>
      <slot></slot>
    </main>
  </div>
</template>
