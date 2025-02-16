<template>
    <q-page padding>
      <div class="q-pa-md">
      <q-card class="q-mb-md bg-primary text-white">
              <q-card-section class="row justify-between">
                <div>
                  <div class="text-h6">Current Month Income</div>
                  <div class="text-subtitle1">KES {{ currentMonthIncome }}</div>
                </div>
                <div>
                  <div class="text-h6">Total Debts</div>
                  <div class="text-subtitle1">KES {{ totalDebts }}</div>
                </div>
              </q-card-section>
            </q-card>
  
            <!-- Toggle Forms -->
            <q-option-group
              v-model="selectedForm"
              :options="[
                { label: 'Add Income', value: 'income' },
                { label: 'Add Banking', value: 'banking' }
              ]"
              color="primary"
              inline
              class="q-mb-md"
            />
  
            <!-- Income Form (shown if selected) -->
            <q-form v-if="selectedForm === 'income'" @submit.prevent="addIncome">
              <q-input v-model="income.date" type="date" label="Date" filled class="q-mb-md" />
              <q-input v-model="income.source" label="Income Source" filled class="q-mb-md" />
              <q-input v-model="income.amount" type="number" label="Amount (KES)" filled class="q-mb-md" />
              <q-input v-model="income.user" label="User" filled class="q-mb-md" />
  
              <q-btn type="submit" label="Add Income" color="secondary" class="full-width q-mb-md" />
            </q-form>
  
            <!-- Banking Form (shown if selected) -->
            <q-form v-if="selectedForm === 'banking'" @submit.prevent="addBanking">
              <q-input v-model="banking.accountNo" label="Account No" filled class="q-mb-md" />
              <q-input v-model="banking.bankName" label="Bank Name" filled class="q-mb-md" />
              <q-input v-model="banking.amount" type="number" label="Amount (KES)" filled class="q-mb-md" />
              <q-input v-model="banking.user" label="User" filled class="q-mb-md" />
              <q-input v-model="banking.date" type="date" label="Date" filled class="q-mb-md" />
  
              <q-btn type="submit" label="Add Banking" color="primary" class="full-width q-mb-md" />
            </q-form>
  
            <!-- Toggle List View -->
            <q-option-group
              v-model="selectedList"
              :options="[
                { label: 'Incomes', value: 'incomes' },
                { label: 'Debts', value: 'debts' },
                { label: 'Bankings', value: 'bankings' },
                { label: 'All', value: 'all' }
              ]"
              color="primary"
              inline
              class="q-mt-md"
            />
  
            <!-- Dynamic List -->
            <q-list bordered separator class="q-mt-md">
              <q-item v-for="(item, index) in filteredList" :key="index">
                <q-item-section>
                  <q-item-label>
                    <strong>{{ item.label }}</strong> - {{ item.date }}
                  </q-item-label>
                  <q-item-label caption> {{ item.user }} </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-bold text-primary">KES {{ item.amount }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn icon="delete" flat color="negative" @click="deleteItem(index)" />
                </q-item-section>
              </q-item>
            </q-list>
         
      
      </div>
    </q-page>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // Tabs
  const tab = ref('mails');
  
  // Income & Debt Summary
  const currentMonthIncome = ref(200000); // Example total income for the month
  const totalDebts = ref(50000); // Example total debts
  
  // Toggle Forms
  const selectedForm = ref('income'); // Default to Income Form
  
  // Forms Data
  const income = ref({ date: '', source: '', amount: null, user: '' });
  const banking = ref({ accountNo: '', bankName: '', amount: null, user: '', date: '' });
  
  // Data Storage
  const incomes = ref([]);
  const debts = ref([]);
  const bankings = ref([]);
  
  // Selected list view
  const selectedList = ref('all');
  
  // Methods
  const addIncome = () => {
    if (!income.value.date || !income.value.source || !income.value.amount || !income.value.user) {
      alert('Please fill all fields');
      return;
    }
    incomes.value.push({ ...income.value, label: 'Income' });
    income.value = { date: '', source: '', amount: null, user: '' };
  };
  
  const addBanking = () => {
    if (!banking.value.accountNo || !banking.value.bankName || !banking.value.amount || !banking.value.user || !banking.value.date) {
      alert('Please fill all fields');
      return;
    }
    bankings.value.push({ ...banking.value, label: 'Banking' });
    banking.value = { accountNo: '', bankName: '', amount: null, user: '', date: '' };
  };
  
  const deleteItem = (index) => {
    if (selectedList.value === 'incomes') incomes.value.splice(index, 1);
    else if (selectedList.value === 'debts') debts.value.splice(index, 1);
    else if (selectedList.value === 'bankings') bankings.value.splice(index, 1);
  };
  
  // Computed Property for Filtering List
  const filteredList = computed(() => {
    if (selectedList.value === 'incomes') return incomes.value;
    if (selectedList.value === 'debts') return debts.value;
    if (selectedList.value === 'bankings') return bankings.value;
    return [...incomes.value, ...debts.value, ...bankings.value];
  });
  </script>
  