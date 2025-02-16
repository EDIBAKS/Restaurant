<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md">
      <q-input type="date" v-model="storeReports.startDate" label="Start Date" mask="date" />
      <q-input type="date" v-model="storeReports.endDate" label="End Date" mask="date" />
      <q-input v-model="storeReports.searchQuery" label="Search" />
</div>
 <!-- Button & Grand Total in the same line -->
 <div class="row items-center justify-between q-mt-md">
      <q-btn @click="storeReports.loadSales" label="Search Sales" color="primary" class="q-mx-md" />

      <div class="grand-total">
        Grand Total: {{ computeGrandTotal.toLocaleString()}}{{ settings.currencySymbol }}
      </div>
      </div>

    <div class="q-mt-md">
      <q-list bordered separator>
        <q-card v-for="receipt in storeReports.sales" :key="receipt.id" class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Receipt Date: {{ new Date(receipt.created_at).toLocaleString() }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-list bordered separator>
  <q-item v-for="(item, index) in receipt.items" :key="index">
    <q-item-section>
      <q-item-label class="text-bold">{{ item.name }}</q-item-label>
      <div class="row justify-between text-caption text-grey">
        <span>Price: {{ item.price }}{{ settings.currencySymbol }}</span>
        <span>Qty: {{ item.quantity }}</span>
        <span class="text-bold">Total: {{ item.price * item.quantity }}{{ settings.currencySymbol }}</span>
      </div>
    </q-item-section>
  </q-item>
</q-list>
          </q-card-section>

          <q-separator />

          <q-card-section class="text-right">
            <div class="text-bold">Receipt Total: {{ computeReceiptTotal(receipt.items) }}{{ settings.currencySymbol }}</div>
          </q-card-section>
        </q-card>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted,computed } from 'vue';
import { useStoreReports } from '../stores/storeReports';
import { useStoreSettings } from 'src/stores/storeSettings';
const storeReports = useStoreReports();
const { settings } = useStoreSettings()
// Trigger fetching and real-time updates on component mount
onMounted(() => {
  storeReports.loadSales();
  storeReports.subscribeToSales();
});

// Compute total for each receipt
const computeReceiptTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item.price * item.quantity || 0), 0);
};
// Compute Grand Total of all displayed receipts
const computeGrandTotal = computed(() => {
  return storeReports.sales.reduce((total, receipt) => total + computeReceiptTotal(receipt.items), 0);
});
</script>
<style scoped>
.grand-total {
  font-size: 1.5rem; /* Larger Font */
  font-weight: bold;
  
}
.item-details span {
  margin-right: 12px; /* Adds spacing */
}
</style>