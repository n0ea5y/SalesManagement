<script setup>
  import AuthLayout from '@/layouts/AuthLayout.vue';

  const headers = [
    {
      title: 'Title',
      key: 'title',
    },
    {
      title: 'Description',
      key: 'description',
    },
    {
      title: 'Status',
      key: 'status',
    },
    {
      title: 'Start',
      key: 'start',
    },
    {
      title: 'End',
      key: 'end',
    },
    {
      title: '',
      key: 'actions',
    },
  ]

  const items = [
    {
      title: '20% off all products',
      description: 'Get 20% off all products in the store.',
      status: 'Active',
      start: '2021-08-01',
      end: '2021-08-31',
    },
    {
      title: 'Free shipping on orders over $50',
      description: 'Get free shipping on all orders over $50.',
      status: 'Active',
      start: '2021-08-01',
      end: '2021-08-31',
    },
    {
      title: 'Buy one get one free',
      description: 'Buy one product and get another one for free.',
      status: 'Inactive',
      start: '2021-08-01',
      end: '2021-08-31',
    },
    {
      title: '10% off all products',
      description: 'Get 10% off all products in the store.',
      status: 'Active',
      start: '2021-08-01',
      end: '2021-08-31',
    },
    {
      title: 'Buy one get one free',
      description: 'Buy one product and get another one for free.',
      status: 'Inactive',
      start: '2021-08-01',
      end: '2021-08-31',
    },
    {
      title: '10% off all products',
      description: 'Get 10% off all products in the store.',
      status: 'Active',
      start: '2021-08-01',
      end: '2021-08-31',
    },
  ]
</script>

<template>
  <AuthLayout>
    <h1>これから作成</h1>
  </AuthLayout>

 <v-data-table
        class="bg-transparent"
        :headers="headers"
        hide-default-footer
        :items="items"
      >
        <template #item.actions>
          <v-btn
            class="text-none"
            color="primary"
            min-width="0"
            slim
            text="Edit"
            variant="text"
          />
        </template>
      </v-data-table>
</template>
