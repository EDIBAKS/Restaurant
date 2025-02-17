import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../config/supabase';
import { defineStore } from 'pinia';

export const useStoreStock = defineStore('storeStock', () => {
  const stockLevel = ref([]);
  const pendingDebts = ref([]);
  const dispatches = ref([]);

  // Load stock levels
  const loadStockLevels = async () => {
    const { data, error } = await supabase.from('inventory').select('*');
    if (error) console.error('Error loading stock levels:', error.message);
    else stockLevel.value = data;
  };

  // Load pending debts
  const loadPendingDebts = async () => {
    const { data, error } = await supabase.from('inventory').select('*').eq('status', 'Unpaid');
    if (error) console.error('Error loading pending debts:', error.message);
    else pendingDebts.value = data;
  };

  // Load dispatches
  const loadDispatches = async () => {
    const { data, error } = await supabase.from('dispatches').select('name, quantity, created_at');
    if (error) console.error('Error loading dispatches:', error.message);
    else dispatches.value = data;
  };

  // Computed properties for totals
  const totalStock = computed(() => {
    return stockLevel.value.reduce((total, item) => total + (item.quantity * item.price), 0);
  });

  const totalDebt = computed(() => {
    return pendingDebts.value.reduce((total, item) => total + (item.quantity * item.price), 0);
  });

  // Real-time subscriptions
  let stockSubscription;
  let debtSubscription;

  const subscribeToStockChanges = () => {
    stockSubscription = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, async () => {
        await loadStockLevels();
        await loadPendingDebts();
      })
      .subscribe();
  };

  onMounted(() => {
    loadStockLevels();
    loadPendingDebts();
    loadDispatches();
    subscribeToStockChanges();
  });

  // Cleanup subscriptions on component unmount
  onUnmounted(() => {
    if (stockSubscription) supabase.removeChannel(stockSubscription);
  });

  return {
    stockLevel,
    pendingDebts,
    dispatches,
    loadStockLevels,
    loadPendingDebts,
    loadDispatches,
    totalStock,
    totalDebt
  };
});
