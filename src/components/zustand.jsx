import { create } from 'zustand';
import { onValue, ref } from 'firebase/database';
import { db } from "../../firebase.config";

const getBizId = () => localStorage.getItem("active_business_id");
const getUserRole = () => localStorage.getItem("user_role") || "sales";

export const useBusinessStore = create((set, get) => ({
  sales: [],
  expenses: [],
  loading: { sales: true, expenses: true },

  subscribeToSales: (user) => {
    const bizId = getBizId();
    const role = getUserRole();
    
    if (!bizId || !user) return;

    const salesRef = ref(db, `businessData/${bizId}/sales`);
    
    // Returns the unsubscribe function automatically
    return onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      let salesArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];

      // Filter logic moved into the store
      if (role === "sales") {
        salesArray = salesArray.filter(s => s.sellerId === user.uid);
      }

      set({ 
        sales: salesArray, 
        loading: { ...get().loading, sales: false } 
      });
    });
  },

  // Add more subscriptions here as needed (Expenses, Inventory, etc.)
}));