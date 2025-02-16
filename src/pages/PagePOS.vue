<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <q-tabs v-model="activeTab">
        <q-tab name="pos" label="Point of Sale" />
        <q-tab name="sales" label="Daily Sales Report" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <!-- POS Frontend -->
        <q-tab-panel name="pos">
        
          <POSfile/>
        </q-tab-panel>

        <!-- Sales Report Panel -->
        <q-tab-panel name="sales">
          <SalesFile/>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import POSfile from 'src/components/POSfile.vue';
import SalesFile from 'src/components/SalesFile.vue';
const activeTab=ref("pos")


</script>

