import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";

export default function FloatingBtn({ action, openSaleForm, openExpenseForm, openProductForm }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleMainClick = () => {
    if (action === "sale") openSaleForm();
    else if (action === "expense") openExpenseForm();
    else if (action === "inventory") openProductForm();
  };

  const handleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleAIClick = () => {
    // AI functionality here - could be chat, suggestions, etc.
    console.log("AI button clicked");
    alert("AI Assistant - Coming soon!");
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-50">
        {showOptions && (
          <div className="mb-4 p-4 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col space-y-3 min-w-[200px] animate-fadeIn">
            <p className="text-sm font-medium text-gray-700 mb-2">Add New Record</p>
            <button
              onClick={() => {
                handleOptions();
                openSaleForm();
              }}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg px-4 py-3 transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium">Add Sale</span>
            </button>
            <button
              onClick={() => {
                handleOptions();
                openExpenseForm();
              }}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="font-medium">Add Expense</span>
            </button>
            <button
              onClick={() => {
                handleOptions();
                openProductForm();
              }}
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg px-4 py-3 transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="font-medium">Add Product</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* AI Button - Shows when main button is clicked */}
          {showOptions && (
            <button
              onClick={() => {
                handleAIClick();
                handleOptions();
              }}
              className="
                bg-linear-to-r from-purple-500 to-purple-600 text-white
                rounded-full
                w-12 h-12
                flex items-center justify-center
                shadow-lg
                hover:from-purple-600 hover:to-purple-700
                transition-all duration-300
                hover:scale-105
                focus:outline-none
                focus:ring-2 focus:ring-purple-400
                animate-fadeIn
              "
              title="AI Assistant"
            >
              <Sparkles size={20} />
            </button>
          )}

          {/* Main Plus Button */}
          <button
            onClick={handleOptions}
            className={`
              bg-linear-to-r from-blue-500 to-blue-600 text-white
              rounded-full
              w-14 h-14
              flex items-center justify-center
              shadow-lg
              hover:from-blue-600 hover:to-blue-700
              transition-all duration-300
              ${showOptions ? 'rotate-45' : 'rotate-0'}
              focus:outline-none
              focus:ring-2 focus:ring-blue-400
            `}
            title="Quick Actions"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Add this to your global CSS or Tailwind config for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}