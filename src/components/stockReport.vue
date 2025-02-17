<template>
  <q-page padding>
    <div>
      <!-- Sales Summary Card -->
      <q-card class="q-mb-md bg-primary text-white">
        <q-card-section class="row justify-between">
          <div>
            <div class="text-subtitle-1">Stock Value</div>
            <div class="text-h6">{{ storeStock.totalStock }}{{ settings.currencySymbol }}</div>
          </div>
          <div>
            <div class="text-subtitle-1">Debts</div>
            <div class="text-h6">{{ storeStock.totalDebt }}{{ settings.currencySymbol }}</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Report Selection -->
      <div class="q-pa-md flex row items-center justify-center">
        <q-radio
          v-for="(item, index) in radioOptions"
          :key="index"
          v-model="selectedOption"
          :val="item.value"
          :label="item.label"
          :style="{ color: selectedOption === item.value ? item.color : 'black' }"
        />
      </div>

      <!-- Report List with Padding -->
     <!-- Report List with Padding -->
<q-list bordered separator class="q-pa-md">
  <q-item
    v-for="(item, index) in filteredReports"
    :key="index"
    clickable
    v-ripple
    class="q-mb-sm"
  >
    <!-- Stock Level Report -->
    <template v-if="selectedOption === 'stockLevel'">
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
        <q-item-label caption>Supplier: {{ item.Supplier }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ item.quantity }} {{ item.units }}</q-item-label>
        <q-item-label caption>{{ item.status }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ (item.quantity * item.price).toFixed(1) }}{{ settings.currencySymbol }}</q-item-label>
        <q-item-label caption>Value</q-item-label>
      </q-item-section>
    </template>

    <!-- Pending Debts Report -->
    <template v-else-if="selectedOption === 'pendingDebts'">
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
        <q-item-label caption>Debtor</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ item.quantity }}</q-item-label>
        <q-item-label caption>Quantity</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ (item.quantity * item.price).toFixed(2) }}{{ settings.currencySymbol }}</q-item-label>
        <q-item-label caption>Amount</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-badge :color="item.status === 'unpaid' ? 'red' : 'green'">
          {{ item.status }}
        </q-badge>
      </q-item-section>
      <q-item-section side v-if="item.status === 'unpaid'">
        <q-btn color="primary" label="Pay" dense @click="payDebt(item)" />
      </q-item-section>
    </template>

    <!-- Dispatches Report -->
    <template v-else-if="selectedOption === 'dispatches'">
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
        <q-item-label caption>Dispatch</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ item.quantity }} {{ item.units }}</q-item-label>
        <q-item-label caption>Available</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-input
          v-model.number="item.dispatchedAmount"
          type="number"
          label="Dispatch Amount"
          dense
          filled
        />
      </q-item-section>
      <q-item-section side>
        <q-btn color="green" label="Dispatch" dense @click="dispatchItem(item)" />
      </q-item-section>
    </template>
  </q-item>
</q-list>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStoreStock } from '../stores/storeStock';
import { useStoreSettings } from '../stores/storeSettings';

const storeStock = useStoreStock();
const { settings } = useStoreSettings();

const selectedOption = ref('stockLevel');

const radioOptions = ref([
  { value: 'stockLevel', label: 'Stock Level', color: 'green' },
  { value: 'pendingDebts', label: 'Pending Debts', color: 'red' },
  { value: 'dispatches', label: 'Dispatches', color: 'blue' },
]);

// Computed properties for reports
const totalToday = computed(() => storeStock.totalToday);
const totalMonth = computed(() => storeStock.totalMonth);
const filteredReports = computed(() => {
  switch (selectedOption.value) {
    case 'stockLevel': return storeStock.stockLevel;
    case 'pendingDebts': return storeStock.pendingDebts;
    case 'dispatches': return storeStock.dispatches;
    default: return [];
  }
});

// Pay Pending Debt
const payDebt = async (debt) => {
  const success = await storeStock.markDebtPaid(debt.id);
  if (success) {
    alert('Debt marked as paid');
    storeStock.loadPendingDebts(); // Refresh debts after update
  }
};

// Dispatch Item
const dispatchItem = async (item) => {
  if (!item.dispatchedAmount || item.dispatchedAmount <= 0) {
    alert('Enter a valid dispatch amount');
    return;
  }

  const success = await storeStock.dispatchItem(item.id, item.dispatchedAmount);
  if (success) {
    alert('Item dispatched successfully');
    storeStock.loadDispatches(); // Refresh dispatches after update
    storeStock.loadStockLevels(); // Refresh stock
  }
};

// Load data when the component is mounted
onMounted(() => {
  storeStock.loadStockLevels();
  storeStock.loadPendingDebts();
  storeStock.loadDispatches();
});
</script>
