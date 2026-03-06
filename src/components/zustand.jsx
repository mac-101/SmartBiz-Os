import { create } from 'zustand';
import { onValue, ref } from 'firebase/database';
import { db } from "../../firebase.config";

const getBizId = () => localStorage.getItem("active_business_id");

// stores.js
export const useBusinessStore = create((set, get) => ({
  sales: [],
  expenses: [],
  plan: "free",
  loading: { sales: true, expenses: true },

  subscribeToSales: (user) => {
    const bizId = localStorage.getItem("active_business_id");
    if (!bizId || !user) return;

    const salesRef = ref(db, `businessData/${bizId}/sales`);
    return onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      const salesArray = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];

      // FIX: You must update the loading state to false here!
      set({
        sales: salesArray,
        loading: { ...get().loading, sales: false }
      });
    });
  },

  subscribeToExpense: (user) => {
    const bizId = localStorage.getItem("active_business_id");
    if (!bizId || !user) return;

    const expenseRef = ref(db, `businessData/${bizId}/expenses`);
    // Inside subscribeToExpense in stores.js
    return onValue(expenseRef, (snapshot) => {
      const data = snapshot.val();
      const expenseArray = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];

      // This is the line that kills the "blank" screen
      set({
        expenses: expenseArray,
        loading: { ...get().loading, expenses: false }
      });
    });
  },


  subscribeToPlan : (user) => {
    const bizId = localStorage.getItem("active_business_id");
    if (!bizId || !user) return;

      const planRef = ref(db, `businessData/${bizId}/businessInfo/subscription/plan`);
    return onValue(planRef, (snapshot) => {
      const data = snapshot.val();
      set({ plan: data || "free" });
    });
  }
}));