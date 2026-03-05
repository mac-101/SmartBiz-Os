import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";

export default function FloatingBtn({ formOpeners }) {
  const [showOptions, setShowOptions] = useState(false);

  // Get user role to filter buttons
  const userRole = localStorage.getItem("user_role") || "sales";

  const handleMainClick = (action) => {
    switch (action) {
      case "sale":
        formOpeners.openSaleForm();
        break;
      case "expense":
        formOpeners.openExpenseForm();
        break;
      case "inventory":
        formOpeners.openInventoryForm(); 
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  const toggleOptions = (e) => {
    if (e) e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const handleAIClick = () => {
    alert("AI Assistant - Coming soon!");
  };

  // Define which roles can see which buttons
  const canAddSale = ["manager", "admin", "sales"].includes(userRole);
  const canAddExpense = ["manager", "admin","inventory"].includes(userRole);
  const canUpdateInventory = ["manager", "admin", "inventory"].includes(userRole);

  return (
    <>
      {showOptions && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setShowOptions(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
        {showOptions && (
          <div className="mb-4 p-4 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col space-y-3 min-w-[200px] animate-fadeIn">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quick Actions</p>
            
            {/* ADD SALE - Visible to Sales, Admin, Manager */}
            {canAddSale && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(false);
                  handleMainClick("sale");
                }}
                className="flex items-center gap-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg px-4 py-3 transition-all hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-bold text-sm">New Sale</span>
              </button>
            )}

            {/* ADD EXPENSE - Visible to Admin, Manager */}
            {canAddExpense && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(false);
                  handleMainClick("expense");
                }}
                className="flex items-center gap-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-lg px-4 py-3 transition-all hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="font-bold text-sm">Add Expense</span>
              </button>
            )}

            {/* UPDATE STOCK - Visible to Inventory, Admin, Manager */}
            {canUpdateInventory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(false);
                  handleMainClick("inventory");
                }}
                className="flex items-center gap-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-lg px-4 py-3 transition-all hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="font-bold text-sm">Restock Item</span>
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {showOptions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAIClick();
                setShowOptions(false);
              }}
              className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all animate-fadeIn"
            >
              <Sparkles size={20} />
            </button>
          )}

          <button
            onClick={toggleOptions}
            className={`bg-slate-900 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-300 ${showOptions ? 'rotate-45 bg-slate-700' : 'rotate-0'}`}
          >
            <Plus size={28} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out forwards; }
      `}</style>
    </>
  );
}