<template>
    <q-page padding>
      <div >
        <!-- Tabs -->
       
  
        <!-- Tab Panels -->
        <q-tab-panels v-model="tab" animated>
          <!-- Expenses Tab -->
          <q-tab-panel name="mails">
            <q-card class="q-mb-md bg-primary text-white">
              <q-card-section class="row justify-between">
                <div>
                  <div class="text-subtitle-1">Today</div>
                  <div class="text-h6">{{ totalToday }}{{ settings.currencySymbol }}</div>
                </div>
                <div>
                  <div class="text-subtitle-1">MonthlySales</div>
                  <div class="text-h6">{{ totalMonth }}{{ settings.currencySymbol }}</div>
                </div>
              </q-card-section>
            </q-card>
  
            <!-- Expense Form -->
            <q-form @submit.prevent="addExpense">
              <div class="q-pa-md" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div class="text-subtitle-1">Cash @ Hand</div>
                  <div class="text-h6">{{ standingBalance }}{{ settings.currencySymbol }}</div>
                </div>
              <q-input v-model="expense.title" label="Title" filled class="q-mb-md" />
              <q-input v-model="expense.amount" type="number" label="Amount" filled class="q-mb-md" />
              <q-input v-model="expense.created_at" type="date" label="Date" filled class="q-mb-md" />
              <q-input v-model="expense.user" label="Username" filled class="q-mb-md" />
  
              <q-btn type="submit" label="Add Expense" color="primary" class="full-width q-mb-md" />
            </q-form>
  
            <!-- Expense List -->
            <q-list bordered separator>
  <q-item v-for="(exp, index) in storeReports.expenses" :key="exp.id" class="q-pa-sm">
    <q-item-section>
      <div class="row justify-between">
        <!-- Left: Date -->
        <div class="text-caption text-grey-7">{{ formatDate(exp.created_at) }}</div>
        <!-- Right: User -->
        <div class="text-caption text-grey-7">By: {{ exp.user }}</div>
      </div>
      <!-- Title -->
      <q-item-label class="text-bold">{{ exp.title }}</q-item-label>
      <!-- Amount + Delete Button -->
      <div class="row justify-between">
        <q-item-label class="text-bold text-negative">{{ exp.amount }}{{ settings.currencySymbol }}</q-item-label>
        <q-btn icon="delete" flat color="negative" @click="deleteExpense(index)" />
      </div>
    </q-item-section>
  </q-item>
</q-list>

          </q-tab-panel>
  
          <!-- Income Tab -->
          <q-tab-panel name="alarms">
            Income
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-page>
  </template>
  
  <script setup>
import { ref, onMounted } from 'vue';
import { useStoreReports } from '../stores/storeReports';
import { useStoreSettings } from '../stores/storeSettings';
const storeReports = useStoreReports();
const { settings } = useStoreSettings()
const tab = ref('mails');

// Access store values directly
import { computed } from 'vue';

const totalToday = computed(() => storeReports.totalToday);
const totalMonth = computed(() => storeReports.totalMonth);
const standingBalance = computed(() => storeReports.standingBalance);

const expenses = storeReports.expenses; // ✅ Use store expenses, NOT a local ref

const expense = ref({
  title: '',
  amount: null,
  created_at: '',
  user: ''
});

const addExpense = async () => {
  if (!expense.value.title || !expense.value.amount || !expense.value.user) {
    alert('Please fill all fields');
    return;
  }

  const success = await storeReports.addExpense({ ...expense.value });

  if (success) {
    alert('Expense added successfully!');
    expense.value = { title: '', amount: null, created_at: '', user: '' };
  } else {
    alert('Failed to add expense');
  }
};

const deleteExpense2 = async (index) => {
  if (!expenses.value || expenses.value.length === 0) {
    console.error("Expenses list is empty or not loaded.");
    return;
  }

  const exp = expenses.value[index];

  if (!exp) {
    console.error(`No expense found at index ${index}`);
    return;
  }

  if (confirm(`Are you sure you want to delete "${exp.title}"?`)) {
    const success = await storeReports.deleteExpense(exp.id);
    if (success) {
      alert('Expense deleted successfully!');
    } else {
      alert('Failed to delete expense.');
    }
  }
};

const deleteExpense = async (index) => {
  // Ensure expenses are available
  if (!storeReports.expenses || storeReports.expenses.length === 0) {
    console.error("Expenses list is empty or not loaded.");
    return;
  }

  // Get the expense object
  const exp = storeReports.expenses[index];

  if (!exp) {
    console.error(`No expense found at index ${index}`);
    return;
  }

  // Confirm deletion
  if (confirm(`Are you sure you want to delete "${exp.title}"?`)) {
    const success = await storeReports.deleteExpense(exp.id); // Call store action

    if (success) {
      alert('Expense deleted successfully!');
    } else {
      alert('Failed to delete expense.');
    }
  }
};




const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'; // Handle missing data
  return new Date(timestamp).toLocaleString(); // Formats date into readable format
};

// Load data when component is mounted
onMounted(async () => {
  await storeReports.loadSales();
  await storeReports.loadExpenses(); // ✅ Ensure expenses are loaded
  storeReports.subscribeToSales();
  storeReports.subscribeToExpenses(); // ✅ Listen for real-time updates
});

</script>
