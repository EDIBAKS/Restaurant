import { ref, watch, onMounted } from 'vue';
import { supabase } from '../config/supabase';
import { useShowErrorMessage } from '../use/useShowErrorMessage';
import { defineStore } from 'pinia';

export const useStoreReports = defineStore('storeReports', () => {
  // State variables
  const sales = ref([]);
  const expenses = ref([]);
  const selectedDate = ref(new Date().toISOString().slice(0, 10));
  const totalToday = ref(0);
  const totalMonth = ref(0);
  const totalSalesAllTime = ref(0);
  const totalIncome = ref(0);
  const totalExpenses = ref(0);
  const standingBalance = ref(0);

  // Helper function to calculate total for orders
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  // **Fetch sales data**
  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      sales.value = data.map(order => ({
        ...order,
        items: Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]"),
        total: calculateOrderTotal(Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]"))
      }));

      // Compute sales totals
      const currentDate = selectedDate.value;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      totalToday.value = sales.value.reduce((sum, order) => 
        order.created_at.startsWith(currentDate) ? sum + order.total : sum, 0);

      totalMonth.value = sales.value.reduce((sum, order) => {
        const orderDate = new Date(order.created_at);
        return (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) 
          ? sum + order.total : sum;
      }, 0);

      totalSalesAllTime.value = sales.value.reduce((sum, order) => sum + order.total, 0);

      calculateStandingBalance();
    } catch (error) {
      useShowErrorMessage(error.message);
    }
  };

  const deleteSales = async (id) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
  
    if (!error) {
      sales.value = sales.value.filter(receipt => receipt.id !== id);
      return true; // Success
    } else {
      return false; // Failure
    }
  };
  

  // **Fetch total income**
  const loadIncome = async () => {
    try {
      const { data, error } = await supabase.from('income').select('amount');
      if (error) throw error;

      totalIncome.value = data.reduce((sum, record) => sum + record.amount, 0);
      calculateStandingBalance();
    } catch (error) {
      useShowErrorMessage(error.message);
    }
  };

  // **Fetch total expenses**
  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading expenses:', error.message);
        return;
      }

      expenses.value = data || [];
      totalExpenses.value = expenses.value.reduce((sum, record) => sum + record.amount, 0);
      calculateStandingBalance();
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  // **Add a new expense**
  const addExpense = async (expense) => {
    try {
      const { title, amount, user } = expense;

      const { data, error } = await supabase.from('expenses').insert([{ title, amount, user }]).select('*');

      if (error) throw error;
      
      if (data && data.length > 0) {
        expenses.value.unshift(data[0]); // Insert new expense at the top
        totalExpenses.value += data[0].amount;
        calculateStandingBalance();
      }

      return true;
    } catch (error) {
      console.error('Error adding expense:', error.message);
      return false;
    }
  };

  // **Delete an expense**
  const deleteExpense = async (expenseId) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  
      if (error) throw error;

      // Remove from local state
      const deletedExpense = expenses.value.find(exp => exp.id === expenseId);
      if (deletedExpense) {
        totalExpenses.value -= deletedExpense.amount;
        calculateStandingBalance();
      }

      expenses.value = expenses.value.filter(exp => exp.id !== expenseId);
  
      return true; // Indicate success
    } catch (error) {
      console.error('Error deleting expense:', error.message);
      return false;
    }
  };

  // **Calculate standing balance**
  const calculateStandingBalance = () => {
    standingBalance.value = totalSalesAllTime.value + totalIncome.value - totalExpenses.value;
  };

  // **Real-time updates for sales**
  const subscribeToSales = () => {
    supabase
      .channel('orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newTotal = calculateOrderTotal(payload.new.items);

        if (payload.new.created_at.startsWith(selectedDate.value)) {
          totalToday.value += newTotal;
        }

        const orderDate = new Date(payload.new.created_at);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          totalMonth.value += newTotal;
        }

        totalSalesAllTime.value += newTotal;
        calculateStandingBalance();
      })
      .subscribe();
  };

  // **Real-time updates for expenses**
  const subscribeToExpenses = () => {
    supabase
      .channel('expenses')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'expenses' }, (payload) => {
        expenses.value.unshift(payload.new);
        totalExpenses.value += payload.new.amount;
        calculateStandingBalance();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'expenses' }, (payload) => {
        const deletedExpense = expenses.value.find(exp => exp.id === payload.old.id);
        if (deletedExpense) {
          totalExpenses.value -= deletedExpense.amount;
          calculateStandingBalance();
        }

        expenses.value = expenses.value.filter(exp => exp.id !== payload.old.id);
      })
      .subscribe();
  };

  // **Load data on mount**
  onMounted(() => {
    loadSales();
    loadIncome();
    loadExpenses();
    subscribeToSales();
    subscribeToExpenses();
  });

  return {
    sales,
    expenses,
    selectedDate,
    totalToday,
    totalMonth,
    totalSalesAllTime,
    totalIncome,
    totalExpenses,
    standingBalance,
    loadSales,
    deleteSales,
    loadIncome,
    loadExpenses,
    addExpense,
    deleteExpense,
    subscribeToSales,
    subscribeToExpenses,
    calculateStandingBalance
  };
});
