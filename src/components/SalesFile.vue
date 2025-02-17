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
     <q-btn 
    label="Export" 
    icon="picture_as_pdf" 
    color="primary" 
    @click="generateSalesReport"
    />
      <div class="grand-total">
        Grand Total: {{ computeGrandTotal.toLocaleString()}}{{ settings.currencySymbol }}
      </div>
      </div>

    <div class="q-mt-md">
      <div v-if="storeReports.loading" class="text-center q-mt-md">
  <q-spinner color="primary" size="2em" />
  <p>Loading sales...</p>
</div>
<div v-else-if="storeReports.sales.length === 0 && !storeReports.loading" class="text-center q-mt-md">
  <p class="text-grey">No sales data found.</p>
  <q-btn @click="storeReports.resetFilters" label="Reset Filters" color="secondary" class="q-mx-md" />
</div>
      <q-list v-else bordered separator>
        <q-card v-for="receipt in storeReports.sales" :key="receipt.id" class="q-mb-md">
          <q-card-section>
            <div class="text-h6">
              <div class="col">
                Receipt Date: {{ new Date(receipt.created_at).toLocaleString() }}
              </div>
              <div class="col"> 
      </div>
             
            </div>
           

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

          <q-card-section class="row justify-between items-center">
  <div class="text-bold">
    Receipt Total: {{ computeReceiptTotal(receipt.items) }}{{ settings.currencySymbol }}
  </div>
  
  <q-btn
    icon="delete"
    color="negative"
    flat
    @click="confirmDelete(receipt)"
  />
</q-card-section>
        </q-card>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref,onMounted,computed } from 'vue';
import { useStoreReports } from '../stores/storeReports';
import { useStoreSettings } from 'src/stores/storeSettings';
const storeReports = useStoreReports();
const { settings } = useStoreSettings()
import { usePdfReport } from 'src/use/usePdfReport';
const { generateReport } = usePdfReport();
const currency = ref('');
// Trigger fetching and real-time updates on component mount
onMounted(() => {
  const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD format
   storeReports.loadSales();
  storeReports.subscribeToSales();
  currency.value = settings.currencySymbol || 'KSh'; 
});

const confirmDelete = async (receipt) => {
  if (confirm(`Are you sure you want to delete this receipt?`)) {
    const success = await storeReports.deleteSales(receipt.id);

    if (success) {
      alert('Receipt deleted successfully!');
    } else {
      alert('Failed to delete receipt.');
    }
  }
};


// Convert sales data into a table format
const generateSalesReport1 = () => {
  if (!storeReports.sales || storeReports.sales.length === 0) {
    console.error('No sales data available.');
    return;
  }

  // Object to store grouped items
  const groupedItems = {};

  // Loop through receipts and group items by name
  storeReports.sales.forEach((receipt) => {
    receipt.items.forEach((item) => {
      if (!groupedItems[item.name]) {
        groupedItems[item.name] = {
          name: item.name,
          price: item.price,
          quantity: 0,
          total: 0
        };
      }
      groupedItems[item.name].quantity += item.quantity;
      groupedItems[item.name].total += item.price * item.quantity;
    });
  });

  // Convert object into an array
  const salesData = Object.values(groupedItems).map((item) => [
    item.name,
    `${item.price}${currency.value}`,
    item.quantity,
    `${item.total}${currency.value}`
  ]);

  const metadata = {
    Date: new Date().toLocaleDateString(),
    User: 'Gilbert'
  };

  generateReport({
    title: 'Restaurant Sales Report',
    metadata,
    tableHeaders: ['Item', 'Price', 'Qty', 'Total'],
    tableData: salesData,
    filename: 'sales_report.pdf'
  });
};

const generateSalesReport = () => {
  if (!storeReports.sales || storeReports.sales.length === 0) {
    console.error('No sales data available.');
    return;
  }

  // Object to store grouped items
  const groupedItems = {};
  let grandTotal = 0;  // Variable to store grand total

  // Loop through receipts and group items by name
  storeReports.sales.forEach((receipt) => {
    receipt.items.forEach((item) => {
      if (!groupedItems[item.name]) {
        groupedItems[item.name] = {
          name: item.name,
          price: item.price,
          quantity: 0,
          total: 0
        };
      }
      groupedItems[item.name].quantity += item.quantity;
      groupedItems[item.name].total += item.price * item.quantity;
    });
  });

  // Convert object into an array
  const salesData = Object.values(groupedItems).map((item) => {
    grandTotal += item.total; // Summing up the grand total
    return [
      item.name,
      `${item.price}${currency.value}`,
      item.quantity,
      `${item.total}${currency.value}`
    ];
  });

  // Append Grand Total row at the end
  salesData.push([
    'Grand Total', '', '', `${grandTotal}${currency.value}`
  ]);

  const metadata = {
    Date: new Date().toLocaleDateString(),
    User: 'Cashier'
  };

  generateReport({
    title: 'Restaurant Sales Report',
    metadata,
    tableHeaders: ['Item', 'Price', 'Qty', 'Total'],
    tableData: salesData,
    filename: 'sales_report.pdf'
  });
};
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