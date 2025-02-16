<template>
  <q-page padding>
    <div class="q-pa-md justify-center" style="width: 100%">
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="mails" class="q-pa-md" style="max-width: 600px; margin: auto">
          <div class="q-gutter-md">
            <div class="flex justify-center q-gutter-md">
              <q-radio v-model="formData.stockType" val="restock" label="Restock Store" />
              <q-radio v-model="formData.stockType" val="new" label="Add to Store" />
              <q-radio v-model="formData.stockType" val="menu" label="Add to Menu" />
            </div>

            <q-form @submit.prevent="handleSubmit" class="q-pa-md q-gutter-md">
              <div v-if="formData.stockType === 'restock'">
                <!-- Select Product -->
                <q-select
                  class="q-mb-md"
                  v-model="selectedProductId"
                  :options="localInventory"
                  option-label="name"
                  option-value="id"
                  label="Select Product"
                  outlined
                  emit-value
                  map-options
                />

                <q-input
                  v-model="formData.availableQuantity"
                  label="Available Quantity"
                  outlined
                  disable
                />
              </div>

              <div  v-if="formData.stockType === 'menu'">
                <q-select
                  class="q-mb-md"
                  v-model="menuData.category"
                  :options="localCategory"
                  option-label="name"
                  option-value="name"
                  label="Select category"
                  outlined
                  emit-value
                  map-options
                />

                <q-input v-model="menuData.name"  label="Item" outlined class="q-mb-sm" />
                <q-input v-model="formData.price"  label="Description" outlined class="q-mb-sm" />
                <q-input v-model="menuData.price" type="number" label="Price" outlined class="q-mb-sm" />
                <!--
                <q-input v-model="menuData.quantity" type="number" label="Quantity" outlined class="q-mb-sm" />
                <q-input v-model="formData.price" type="date" label="Price" outlined class="q-mb-sm" />
              -->
              </div>
              <div v-if="formData.stockType === 'new'">
                
              </div>
              <q-input
                v-if="formData.stockType === 'new'"
                v-model="formData.newProductName"
                label="Product Name"
                outlined
              />
              <div v-if="formData.stockType !== 'menu'">
                <q-input
                v-model="formData.newQuantity"
                type="number"
                label="New Quantity"
                outlined
              />
              <q-select v-model="formData.unit" :options="units" label="Units" />
              <q-input v-model="formData.price" type="number" label="Price" outlined />
              <q-select v-model="formData.status" :options="Status" label="Status" />
              <!-- <q-input v-if="formData.stockType === 'new'" v-model="formData.category" label="Category" outlined /> -->
              </div>
            
              <q-input
                v-if="formData.stockType === 'new'"
                v-model="formData.supplier"
                label="Supplier"
                outlined
              />
              <q-input
                v-if="formData.stockType === 'new'"
                v-model="formData.telephone"
                label="Telephone"
                outlined
              />
              <q-btn
                type="submit"
                label="Add"
                color="primary"
                class="full-width q-mt-md"
              />
            </q-form>
          </div>
        </q-tab-panel>

        <q-tab-panel name="alarms"> Alarms </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useStoreEntries } from "src/stores/storeEntries";
const storeEntries = useStoreEntries();
const selectedProductId = ref(null); // Holds selected product ID
const tab = ref("mails");
const formData = reactive({
  stockType: "restock",
  selectedProduct: null,
  availableQuantity: "",
  newQuantity: "",
  price: "",
  newProductName: "",
  unit: "",
  status: "",
  supplier: "",
  telephone: "",
});
const menuData = reactive({
  stockType: "",
  category:"",
  name:"",
  description: "",
  price: ""
  });
const localInventory = ref([]); // Local inventory data
const localCategory=ref([])
const units = ref(["kgs", "gms", "ltrs", "pcts"]);
const Status = ref(["Paid", "Unpaid"]);
// Sample products list
const products = ref([
  { label: "Product A", value: "Product A" },
  { label: "Product B", value: "Product B" },
  { label: "Product C", value: "Product C" },
]);

// Compute the selected product from localInventory
const selectedProduct = computed(() => {
  return localInventory.value.find((p) => p.id === selectedProductId.value) || null;
});

// Watch for changes in selectedProductId
watch(selectedProductId, (newId) => {
  const product = localInventory.value.find((p) => p.id === newId); // Use localInventory instead of storeEntries.products

  if (product) {
    //console.log('local inv',localInventory.value)
    // Update formData with product details
    formData.selectedProduct = product;
    formData.price = product.price;
    formData.status = product.status;
    formData.unit = product.units || ""; // If unit doesn't exist, set as empty string
    formData.availableQuantity = product.quantity; // Assuming you have available quantity
  } else {
    // Reset formData when no product is found
    formData.selectedProduct = null;
    formData.price = "";
    formData.newProductName = "";
    formData.unit = "";
    formData.availableQuantity = "";
  }
});

//fetching Data from storeEntries
const fetchInventoryData = async () => {
  try {
    await storeEntries.fetchinventory(); // Fetch from store
   localInventory.value = [...storeEntries.inventory]; // Copy locally
   console.log("✅ Inventory reloaded:", localInventory.value);
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
 }
};
//fetching Data from storeEntries
const fetchCategoryData = async () => {
  try {
    await storeEntries.fetchcategory(); // Fetch from store
   localCategory.value = [...storeEntries.categories]; // Copy locally
   console.log("✅ category reloaded:", localCategory.value);
  } catch (error) {
    console.error("❌ Error fetching inventory:", error);
 }
};




// Call function on mounted
onMounted(() => {
  fetchInventoryData();
  fetchCategoryData();
});

const resetForm = () => {
  Object.assign(formData, {
    stockType: "restock",
    selectedProduct: null,
    availableQuantity: "",
    newQuantity: "",
    price: "",
    newProductName: "",
    unit: "",
    status: "",
    supplier: "",
    telephone: "",
  });
};

const handleSubmit = async () => {
  if (formData.stockType === "restock") {
    await storeEntries.updateInventory(formData);
  } else if (formData.stockType === "menu") {
    await storeEntries.addMenuItem(menuData); // Handle menu case
  } else {
    await storeEntries.addNewInventory(formData);
  }
  // Reset form after success
  resetForm();
  fetchInventoryData();
};

</script>
