<script setup>
    import MonthlyView from './MonthComponents/MonthlyView.vue';
    import StaffSalaryList from './MonthComponents/StaffSalaryList.vue';
    import CatchMonthly from './MonthComponents/CatchMonthly.vue';
    import WholeSalerMonthly from './MonthComponents/WholeSalerMonthly.vue';
</script>

<template>
    <div class="mx-auto pb-10 w-[98%]">
        <v-card title="月まとめ">
            <div class="flex flex-col gap-3 py-2 px-2 overflow-x-auto">
                <MonthlyView />
                <StaffSalaryList />
                <WholeSalerMonthly />
                <CatchMonthly />
            </div>
        </v-card>
    </div>
</template>