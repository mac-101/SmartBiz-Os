import { Plus } from "lucide-react";

export default function FloatingBtn({ action, openSaleForm, openExpenseForm, openProductForm }) {

  // Determine what to do based on current path
  const handleClick = () => {
  if (action === "sale") openSaleForm();
  else if (action === "expense") openExpenseForm();
  else if (action === "inventory") openProductForm();
};


  return (
    <button
      onClick={handleClick}
      className="
        fixed bottom-6 right-6
        bg-blue-600 text-white
        rounded-full
        w-14 h-14
        flex items-center justify-center
        shadow-lg
        hover:bg-blue-700
        transition-colors
        focus:outline-none
        focus:ring-2 focus:ring-blue-400
      "
      title="Quick Action"
    >
      <Plus size={24} />
    </button>
  );
}
