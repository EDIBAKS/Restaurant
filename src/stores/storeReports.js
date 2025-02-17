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
  const startDate = ref('');
  const endDate = ref('');
  const searchQuery = ref('');
  const loading = ref(false); // Loader state

  // Helper function to calculate total for orders
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };
//the sales,sorts and search query are here
  const loadSales = async () => {
    loading.value = true; // Show loader
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) throw error;
  
      // Ensure we process the sales data correctly
      sales.value = data
        .map(order => {
          const parsedItems = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");
          return {
            ...order,
            items: parsedItems,
            total: calculateOrderTotal(parsedItems)
          };
        })
        .filter(receipt => {
          const receiptDate = new Date(receipt.created_at).toISOString().split('T')[0]; // Get YYYY-MM-DD
  
          // Apply date range filtering
          const withinDateRange = receiptDate >= startDate.value && receiptDate <= endDate.value;
  
          // Apply search query filtering
          const matchesSearch = !searchQuery.value || receipt.items.some(item =>
            item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
          );
  
          return withinDateRange && matchesSearch;
        });
  
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      loading.value = false; // Hide loader
    }
  };



  const calculateStandingBalance = () => {
    standingBalance.value = totalSalesAllTime.value + totalIncome.value - totalExpenses.value;
  };
  
  // Watch for changes in sales, income, and expenses
  watch([totalSalesAllTime, totalIncome, totalExpenses], calculateStandingBalance);
  //calcilate total today
  const loadTotalToday = async () => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today) // Get orders from today
  
      if (error) throw error;
  
      totalToday.value = data.reduce((sum, order) => {
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");
        return sum + items.reduce((t, item) => t + item.quantity * item.price, 0);
      }, 0);
    } catch (err) {
      console.error("Error fetching today's total sales:", err);
    }
  };
  //calculate total monthly
  const loadTotalMonth = async () => {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', firstDayOfMonth) // Get all orders from the start of the month
        .lte('created_at', today);
  
      if (error) throw error;
  
      totalMonth.value = data.reduce((sum, order) => {
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");
        return sum + items.reduce((t, item) => t + item.quantity * item.price, 0);
      }, 0);
    } catch (err) {
      console.error("Error fetching this month's total sales:", err);
    }
  };
  
 
//deleting sales is here
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

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase.from('expenses').select('amount');
      if (error) throw error;
  
      totalExpenses.value = data.reduce((sum, record) => sum + record.amount, 0);
      calculateStandingBalance(); // Update balance
    } catch (error) {
      console.error('Error loading expenses:', error.message);
    }
  };

  const loadTotalSales = async () => {
    try {
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('*');
  
      if (allOrdersError) throw allOrdersError;
  
      totalSalesAllTime.value = allOrders.reduce((sum, order) => {
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");
        return sum + items.reduce((t, item) => t + item.quantity * item.price, 0);
      }, 0);
  
      calculateStandingBalance(); // Ensure balance updates correctly
    } catch (err) {
      console.error("Error loading total sales:", err);
    }
  };
  

  // **Fetch total expenses**
  const loadExpenses1 = async () => {
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
 

  // **Real-time updates for sales**
  const subscribeToSales1 = () => {
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

  const subscribeToSales = () => {
    supabase
      .channel('orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const items = Array.isArray(payload.new.items) ? payload.new.items : JSON.parse(payload.new.items || "[]");
        const newTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const orderDate = new Date(payload.new.created_at);
        const today = new Date();
        
        // If the new sale is today, update totalToday
        if (orderDate.toISOString().split("T")[0] === today.toISOString().split("T")[0]) {
          totalToday.value += newTotal;
        }
  
        // If the new sale is in this month, update totalMonth
        if (orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear()) {
          totalMonth.value += newTotal;
        }
  
        totalSalesAllTime.value += newTotal; // Update overall total
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

  // Set today's date as default
  const setDefaultDates = () => {
    const today = new Date().toISOString().split('T')[0];
    startDate.value = today;
    endDate.value = today;
  };

  // Reset filters to default (today's date)
  const resetFilters = () => {
    setDefaultDates();
    searchQuery.value = ''; // Clear search
    loadSales(); // Reload sales for today
  };

  // **Load data on mount**
  onMounted(() => {
    const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD format
    startDate.value = today;
    endDate.value = today;  // Default to today's date
    loadSales();
    loadIncome();
    loadExpenses();
    loadTotalSales();
    subscribeToSales();
    subscribeToExpenses();
    loadTotalToday(); // Get total sales for today
     loadTotalMonth(); // Get total sales for this month
  });

  // Watch for changes in startDate, endDate, or searchQuery, and reload sales
watch([startDate, endDate, searchQuery], () => {
  loadSales();
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
    startDate,
    endDate,
    searchQuery,
    loading,
    loadSales,
    deleteSales,
    loadIncome,
    loadExpenses,
    addExpense,
    deleteExpense,
    subscribeToSales,
    subscribeToExpenses,
    calculateStandingBalance,
    resetFilters
  };
});
