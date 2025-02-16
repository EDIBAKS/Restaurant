<template>
    <q-page padding>
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Point of Sale</div>
        </q-card-section>
  
        <q-card-section>
          <!-- <q-select
            v-model="selectedProduct"
            :options="productOptions"
            label="Select Product"
            option-label="name"
            option-value="id"
            emit-value
            map-options
            filled
            @update:model-value="updateProductDetails"
          /> -->
          <q-select
        filled
        v-model="selectedProductId"
        :options="store.products"
        option-label="name"
        option-value="id"
        label="Select Product"
        emit-value
        map-options
      />
         
      <q-input v-model="selectedProduct.description" label="Description" readonly filled class="q-mt-md" />
          <q-input v-model="selectedProduct.price" label="Price" readonly filled class="q-mt-md" />
          <q-input type="number" v-model="selectedQuantity" label="Quantity"  filled class="q-mt-md" />
         
  
          <q-btn label="Add to Cart" color="primary" class="q-mt-md full-width" @click="addToCart" />
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md">
  <q-card-section class="text-center">
    <div class="text-h6">Cart</div>
  </q-card-section>

  <q-card-section class="row justify-center">
    <q-table
  flat
  bordered
  dense
  :rows="cart"
  :columns="columns"
  row-key="name"
>
  <template v-slot:body="props">
    <q-tr :props="props">
      <!-- Product Name -->
      <q-td>
        <div class="text-bold">{{ props.row.name }}</div>
        <!--<div class="text-caption text-grey">{{ settings.currencySymbol }}{{ props.row.price }}</div> -->
      </q-td>

      <!-- Quantity Controls -->
      <q-td class="text-center">
        <div class="row items-center justify-center q-gutter-xs no-wrap" style="flex-wrap: nowrap; min-width: 100px;">
  <q-btn icon="remove" flat dense size="sm" class="rounded-borders" style="width: 28px; height: 28px;" @click="decreaseQuantity(props.row)" />
  <span class="text-subtitle-1 text-center" style="min-width: 30px;">{{ props.row.quantity }}</span>
  <q-btn icon="add" flat dense size="sm" class="rounded-borders" style="width: 28px; height: 28px;" @click="increaseQuantity(props.row)" />
</div>
      </q-td>

      <!-- Amount -->
      <q-td class="text-bold text-right">
        {{ props.row.amount }}{{ settings.currencySymbol }}
      </q-td>

      <!-- Remove Button -->
      <q-td class="text-center">
        <q-btn icon="delete" color="red" flat dense size="sm" @click="removeFromCart(props.row)" />
      </q-td>
    </q-tr>
  </template>
</q-table>

  </q-card-section>
  <q-card-section class="row justify-between q-mt-md">
  <!-- Total Label -->
  <div class="col-6 text-h6">Total:</div>

  <!-- Grand Total Value -->
  <div v-if="grandTotal > 0" class="col-6 text-right text-h6">
    {{ grandTotal }}{{ settings.currencySymbol }}
  </div>
</q-card-section>
<q-card-section class="row justify-center">
        <q-btn label="Place Order" color="primary" @click="checkout" />
      </q-card-section>
</q-card>


    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted,computed,watch } from 'vue'
  import { useQuasar } from 'quasar'
  import { useStoreEntries } from '../stores/storeEntries';
  import { useStoreSettings } from '../stores/storeSettings'

  const $q = useQuasar()
  //const supabase = createClient('https://ttssimbdtowqlgxabcwb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3NpbWJkdG93cWxneGFiY3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNzM5NTUsImV4cCI6MjA1NDk0OTk1NX0.pejq3hXP7XnZ9jNeGhb3ByimP6f-z9qStb5Gxrk58gQ')
  const store = useStoreEntries();
  const { settings } = useStoreSettings()
  const selectedProductId = ref(null); // Holds selected product ID
  const cart = ref([]);
  const selectedQuantity = ref(1); // Holds user-entered quantity
  const columns = [
  { name: 'product', label: 'Product', field: 'name', align: 'left' },
  { name: 'quantity', label: 'Quantity', align: 'center' },
  { name: 'amount', label: 'Amount', align: 'right' },
  { name: 'actions', label: 'Actions', align: 'center' }
];
  //const productDetails = ref({ price: '', description: '',name:'' })
 // Computed property to fetch details of the selected product
const selectedProduct = computed(() => {
  return store.products.find(p => p.id === selectedProductId.value) || { price: '', category: '', description: '' };
});

  
// Function to add product to cart
const addToCart = () => {
  if (!selectedProductId.value || selectedQuantity.value <= 0) return;

  const quantityToAdd = Number(selectedQuantity.value); // Ensure numeric value
  const existingItemIndex = cart.value.findIndex(item => item.id === selectedProductId.value);

  if (existingItemIndex !== -1) {
    // If item exists, update quantity and amount reactively
    cart.value[existingItemIndex] = {
      ...cart.value[existingItemIndex], // Spread existing values
      quantity: cart.value[existingItemIndex].quantity + quantityToAdd, // Update quantity
      amount: (cart.value[existingItemIndex].quantity + quantityToAdd) * Number(cart.value[existingItemIndex].price) // Recalculate total
    };
  } else {
    // Add new product to cart
    cart.value.push({
      id: selectedProduct.value.id,
      name: selectedProduct.value.name,
      description: selectedProduct.value.description,
      price: Number(selectedProduct.value.price),
      quantity: quantityToAdd,
      amount: Number(selectedProduct.value.price) * quantityToAdd
    });
  }

  // Reset selected product and quantity after adding
  selectedProductId.value = null;
  selectedQuantity.value = 1;
};



// Function to increase quantity
const increaseQuantity = (item) => {
  item.quantity++;
  item.amount = item.price * item.quantity;
};

// Function to decrease quantity
const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
    item.amount = item.price * item.quantity;
  } else {
    removeFromCart(item);
  }
};

// Function to remove item from cart
const removeFromCart = (item) => {
  cart.value = cart.value.filter(cartItem => cartItem.id !== item.id);
};
const grandTotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.amount || 0), 0);
});
//sending an order to the pageEntries store for submission
const checkout = () => {
  store.saveOrder(cart.value, grandTotal.value);
  cart.value = []; // Clear cart after placing order
};


// Watch for changes in currencySymbol
watch(() => settings.currencySymbol, (newSymbol) => {
  console.log(`Currency symbol changed to: ${newSymbol}`)
  // Here you can perform any additional actions if needed
})


  onMounted(async () => {
    store.loadProducts();
  })
  </script>
  
  <style scoped>
  .q-card {
    max-width: 500px;
    margin: auto;
  }
  </style>
