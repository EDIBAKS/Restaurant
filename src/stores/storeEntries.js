import { defineStore } from 'pinia'
import { ref, computed, reactive, nextTick } from 'vue'
import { uid, Notify } from 'quasar'
import {supabase} from 'src/config/supabase'
import { useShowErrorMessage } from 'src/use/useShowErrorMessage'
import { useNonReactiveCopy } from 'src/use/useNonReactiveCopy'
export const useStoreEntries = defineStore('entries', () => {

  /*
    state
  */

  const entries = ref([
    // {
    //   id: 'id1',
    //   name: 'Salary',
    //   amount: 4999.99,
    //   paid: true
    // },
    // {
    //   id: 'id2',
    //   name: 'Rent',
    //   amount: -999,
    //   paid: false
    // },
    // {
    //   id: 'id3',
    //   name: 'Phone bill',
    //   amount: -14.99,
    //   paid: false
    // },
    // {
    //   id: 'id4',
    //   name: 'Unknown',
    //   amount: 0,
    //   paid: false
    // },
  ])
const products=ref([])
const inventory=ref([])
const categories=ref([])
const entriesLoaded=ref(false)

  const options = reactive({
    sort: false
  })


  /*
    getters
  */

  const balance = computed(() => {
    return entries.value.reduce((accumulator, { amount }) => {
      return accumulator + amount
    }, 0)
  })

  const balancePaid = computed(() => {
    return entries.value.reduce((accumulator, { amount, paid }) => {
      return paid ? accumulator + amount : accumulator
    }, 0)
  })

  const runningBalances = computed(() => {
    let runningBalances = [],
      currentRunningBalance = 0

    if (entries.value.length) {
      entries.value.forEach(entry => {
        let entryAmount = entry.amount ? entry.amount : 0
        currentRunningBalance = currentRunningBalance + entryAmount
        runningBalances.push(currentRunningBalance)
      })
    }

    return runningBalances
  })


  /*
    actions
  */

  const loadEntries = async () => {
    entriesLoaded.value=false
    let { data, error } = await supabase
      .from('entries')
      .select('*')
    if (error) useShowErrorMessage(error.message)
    if (data) {
      
        entries.value = data
        entriesLoaded.value=true
     
     
      subscribeEntries()
    }
  }
//menu items retrieved here
  const loadProducts = async () => {
    
    let { data, error } = await supabase
      .from('products')
      .select('*')
    if (error) useShowErrorMessage(error.message)
    if (data) {
      
        products.value = data
        
     
     
      //subscribeEntries()
    }
  }
//inventory items retrieved here
const fetchinventory=async()=> {
  const { data, error } = await supabase.from("inventory").select("*");
  if (error) {
    Notify.create({
      message: `Error fetching products: ${error.message}`,
      color: "negative",
      position: "top",
    });
  } else {
    inventory.value = data;
  }
}

//fetch categories
const fetchcategory=async()=> {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) {
    Notify.create({
      message: `Error fetching products: ${error.message}`,
      color: "negative",
      position: "top",
    });
  } else {
    categories.value = data;
  }
}

//add new item to inventory
const addNewInventory=async(productData)=> {
  const newProduct = {
    id: uid(),
    name: productData.newProductName,
    quantity: productData.newQuantity,
    price: productData.price,
    units: productData.unit,
    status: productData.status,
    Supplier: productData.supplier,
    Telephone: productData.telephone,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("inventory").insert([newProduct]);

  if (error) {
    Notify.create({
      message: `Error adding product: ${error.message}`,
      color: "negative",
      position: "top",
    });
  } else {
    Notify.create({
      message: "New product added successfully!",
      color: "positive",
      position: "top",
    });
    fetchinventory(); // Refresh product list
  }
}
//add an item to menu
const addMenuItem=async(productData)=> {
  const newMenu = {
    id: uid(),
    name: productData.name,
    category: productData.category,
    price: productData.price,
    description: productData.description,
   created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("products").insert([newMenu]);

  if (error) {
    Notify.create({
      message: `Error adding item: ${error.message}`,
      color: "negative",
      position: "top",
    });
  } else {
    Notify.create({
      message: "Item added successfully!",
      color: "positive",
      position: "top",
    });
    loadProducts(); // Refresh product list
  }
}

const updateInventory = async (productData) => {
  let { selectedProduct, newQuantity, price, status, unit } = productData;

  console.log("Selected Product:", selectedProduct);
  console.log("Type of selectedProduct:", typeof selectedProduct);

  // Ensure selectedProduct is an object and extract the ID
  const productId = selectedProduct?.id?.toString();

  // Validate extracted ID
  const isValidUUID = (id) => /^[0-9a-fA-F-]{36}$/.test(id);
  if (!productId || !isValidUUID(productId)) {
    Notify.create({
      message: `Invalid product ID format! Received: ${JSON.stringify(selectedProduct)}`,
      color: "negative",
      position: "top",
    });
    return;
  }

  const { data: existingProduct, error } = await supabase
    .from("inventory")
    .select("id, quantity, price, status, units")
    .eq("id", productId)
    .single();

  if (error) {
    Notify.create({ message: `Error fetching product: ${error.message}`, color: "negative", position: "top" });
    return;
  }

  const updatedData = {
    quantity: (Number(existingProduct.quantity) || 0) + (Number(newQuantity) || 0),
    price: price || existingProduct.price,
    status: status || existingProduct.status,
    units: unit || existingProduct.units,
  };

  const { error: updateError } = await supabase
    .from("inventory")
    .update(updatedData)
    .eq("id", productId);

  if (updateError) {
    Notify.create({ message: `Error updating inventory: ${updateError.message}`, color: "negative", position: "top" });
    return;
  }
fetchinventory()
  Notify.create({ message: "Inventory updated successfully!", color: "positive", position: "top" });
   // ✅ Reset the form after successful update
   
};





//save a reciept on sold items
  const saveOrder = async (orderItems, totalAmount) => {
    if (!orderItems.length) {
      Notify.create({
        message: "Cart is empty. Add items before placing an order.",
        color: "negative",
        position: "top",
      });
      return;
    }
  
    const orderData = {
      id: uid(), // Unique ID
      items: JSON.stringify(orderItems), // Convert array to JSON string
      total: totalAmount,
      created_at: new Date().toISOString(), // ISO format timestamp
    };
  
    const { error } = await supabase.from("orders").insert([orderData]);
  
    if (error) {
      useShowErrorMessage(`Error: ${error.message}`); // Show exact error
    } else {
      Notify.create({
        message: "Order placed successfully!",
        color: "positive",
        position: "top",
      });
    }
  };
  




  const subscribeEntries = () => {
supabase.channel('entries-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'entries' },
      (payload) => {
       
        if (payload.eventType === 'INSERT'){
          entries.value.push(payload.new)
        }
        if(payload.eventType ==='DELETE'){
          const index=getEntryIndexById(payload.old.id)
          entries.value.splice(index,1)
        }
        if (payload.eventType=== 'UPDATE'){
          const index=getEntryIndexById(payload.new.id)
          Object.assign(entries.value[index],payload.new)
        }
      }
    )
    .subscribe()
  
  }



  const addEntry = async addEntryForm => {

    const newEntry = Object.assign({}, addEntryForm, { 
      paid: false,
     order:generateOrderNumber()
    })
    if (newEntry.amount === null) newEntry.amount = 0

    const { error } = await supabase
      .from('entries')
      .insert([
        newEntry,
      ])
      .select()
    if (error) useShowErrorMessage("Could not add to supabase")
  }

  const deleteEntry = async entryId => {
  const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId)
if(error) useShowErrorMessage(error.message)
  else{
    removeSlideItemIfExists(entryId)
    Notify.create({
      message: 'Entry deleted',
      position: 'top'
    })
}
   
  }

  const updateEntry = async (entryId, updates) => {
  const index=getEntryIndexById(entryId),
  oldEntry=useNonReactiveCopy(entries.value[index])
  Object.assign(entries.value[index],updates)

    const {  error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      if(error){
        useShowErrorMessage("entry could not be updated on supabase")
        Object.assign(entries.value[index],oldEntry)
      }
       

  }

  const updateEntryOrderNumbers = async () => {
    let currentOrder = 1
    entries.value.forEach(async entry => {
      entry.order = currentOrder
      currentOrder++
      const entriesUpsert = entries.value.map(entry => {
        return { id: entry.id, order: entry.order }
      })
      const { error } = await supabase
        .from('entries')
        .upsert(entriesUpsert)
        .select()
      if (error) useShowErrorMessage('could no update entry order')
    })
  }

  const sortEnd = ({ oldIndex, newIndex }) => {
    const movedEntry = entries.value[oldIndex]
    entries.value.splice(oldIndex, 1)
    entries.value.splice(newIndex, 0, movedEntry)
    updateEntryOrderNumbers()
  }

  /*
    helpers
  */
const  generateOrderNumber=()=>{
const orderNumbers=entries.value.map(entry => entry.order),
newOrderNumber=orderNumbers.length
                 ? Math.max(...orderNumbers)+1
                 : 1
return newOrderNumber

    }

  const getEntryIndexById = entryId => {
    return entries.value.findIndex(entry => entry.id === entryId)
  }

  const removeSlideItemIfExists = entryId => {
    // hacky fix: when deleting (after sorting),
    // sometimes the slide item is not removed
    // from the dom. this will remove the slide
    // item from the dom if it still exists
    // (after entry removed from entries array)
    nextTick(() => {
      const slideItem = document.querySelector(`#id-${entryId}`)
      if (slideItem) slideItem.remove()
    })
  }


  /*
    return
  */

  return {

    // state
    entries,
    products,
    inventory,
    categories,
    entriesLoaded,
    options,


    // getters
    balance,
    balancePaid,
    runningBalances,

    // actions
    loadEntries,
    loadProducts,
    fetchinventory,
    fetchcategory,
    addMenuItem,
    addNewInventory,
    updateInventory,
    addEntry,
    deleteEntry,
    updateEntry,
    sortEnd,
    saveOrder


  }

})