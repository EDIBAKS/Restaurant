<template>
  <q-page padding>
    <div class="q-pa-md">
      
      <!-- Tabs -->
      <q-tabs
      v-model="tab"
      inline-label
      
    >
      <q-tab name="expence" icon="add_card" label="Expences" />
      <q-tab name="income" icon="paid" label="Income" />
      
    </q-tabs>

      <!-- Tab Panels -->
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="expence">
            <newExpences/>
        </q-tab-panel>

        <q-tab-panel name="income">
      <newIncome/>
        </q-tab-panel>

      
      </q-tab-panels>
    </div>
  </q-page>
  
</template>

<script setup>
import { ref } from 'vue';
import newExpences from 'src/components/newExpences.vue';
import newIncome from 'src/components/newIncome.vue';
const tab = ref('expence')

</script>

<style>

</style>