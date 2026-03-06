import React, { useState, useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { db, auth } from '../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { useBusinessStore } from "../components/zustand";
import { Trash2, Plus, Box, X } from "lucide-react";

function InventoryForm({ onSuccess, product = null }) {
  const { plan, subscribeToPlan } = useBusinessStore();
  const [products, setProducts] = useState([
    product ? { ...product, id: Date.now() } : { id: Date.now(), product: '', category: '', quantity: 0, cost: 0, price: 0, reorderLevel: 5, isBulk: false }
  ]);
  const [categories, setCategories] = useState(['Electronics', 'Furniture', 'Office Supplies', 'Accessories']);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => u && subscribeToPlan?.(u));
    return () => unsub();
  }, [subscribeToPlan]);

  const handleAddGeneralCategory = () => {
    if (newCatName && !categories.includes(newCatName)) {
      setCategories(prev => [...prev, newCatName]);
      setNewCatName('');
      setIsAddingCategory(false);
    }
  };

  const updateProduct = (id, field, value) => {
    if (field === 'isBulk' && value === true && plan === '') {
      alert("🚀 Bulk calculation is a Pro feature!");
      return; 
    }
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleBulkCalc = (id, cPrice, itemsPer, numCartons) => {
    const unitCost = (parseFloat(cPrice) || 0) / (parseInt(itemsPer) || 1);
    const totalQty = (parseInt(itemsPer) || 0) * (parseInt(numCartons) || 0);
    setProducts(products.map(p => p.id === id ? { ...p, cost: unitCost.toFixed(2), quantity: totalQty, tmpP: cPrice, tmpI: itemsPer, tmpQ: numCartons } : p));
  };

  const calculateTotalValue = () => products.reduce((t, p) => t + ((parseFloat(p.cost) || 0) * (parseInt(p.quantity) || 0)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bizId = localStorage.getItem("active_business_id");
    try {
      await Promise.all(products.map((p, i) => {
        const sku = p.sku || `${p.category.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}-${i+1}`;
        return set(ref(db, `businessData/${bizId}/inventory/${sku}`), { ...p, sku, lastUpdated: new Date().toISOString() });
      }));
      alert("Saved!");
      onSuccess();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className='max-w-3xl mx-auto p-2 bg-white rounded-xl'>
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className='text-lg font-black text-slate-800'>Inventory</h2>
        <button type="button" onClick={() => setIsAddingCategory(!isAddingCategory)} className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">
          {isAddingCategory ? <X size={14}/> : <Plus size={14}/>}
        </button>
      </div>

      {isAddingCategory && (
        <div className="mb-4 p-2 bg-blue-50 rounded-lg flex gap-2">
          <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New Category..." className="flex-1 p-1.5 text-xs rounded border" />
          <button onClick={handleAddGeneralCategory} className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-bold">ADD</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-3'>
        {products.map((prod) => (
          <div key={prod.id} className='p-3 border border-slate-100 rounded-xl bg-white relative shadow-sm'>
            {products.length > 1 && (
              <button type="button" onClick={() => setProducts(products.filter(p => p.id !== prod.id))} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
            )}

            <div className='flex items-center gap-2 mb-2'>
              <input type="checkbox" checked={prod.isBulk || false} onChange={(e) => updateProduct(prod.id, 'isBulk', e.target.checked)} className="w-3 h-3" />
              <label className="text-[10px] font-bold text-slate-500 uppercase">Bulk</label>
            </div>

            {prod.isBulk && (
              <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
                <MiniInput label="Carton ₦" onChange={(v) => handleBulkCalc(prod.id, v, prod.tmpI, prod.tmpQ)} />
                <MiniInput label="Units/C" onChange={(v) => handleBulkCalc(prod.id, prod.tmpP, v, prod.tmpQ)} />
                <MiniInput label="Cartons" onChange={(v) => handleBulkCalc(prod.id, prod.tmpP, prod.tmpI, v)} />
              </div>
            )}

            <div className='grid grid-cols-2 gap-3 mb-2'>
              <FormInput label="Product" value={prod.product} onChange={(v) => updateProduct(prod.id, 'product', v)} />
              <div className="flex flex-col">
                <label className='text-[9px] uppercase font-bold text-slate-400'>Category</label>
                <select value={prod.category} onChange={(e) => updateProduct(prod.id, 'category', e.target.value)} className='p-1.5 bg-slate-50 rounded text-xs border-none ring-1 ring-slate-100'>
                  <option value="">-</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-3'>
              <FormInput label="Qty" type="number" value={prod.quantity} onChange={(v) => updateProduct(prod.id, 'quantity', v)} />
              <FormInput label="Cost" type="number" value={prod.cost} onChange={(v) => updateProduct(prod.id, 'cost', v)} />
              <FormInput label="Price" type="number" value={prod.price} onChange={(v) => updateProduct(prod.id, 'price', v)} />
            </div>
          </div>
        ))}

        <div className='p-4 bg-slate-900 rounded-xl text-white flex justify-between items-center'>
          <h3 className='text-lg font-black'>₦{calculateTotalValue().toLocaleString()}</h3>
          <span className="text-[10px] opacity-50 uppercase tracking-widest">Total Value</span>
        </div>

        <div className='flex gap-2'>
          <button type="button" onClick={() => setProducts([...products, { id: Date.now(), product: '', category: '', quantity: 0, cost: 0, price: 0, reorderLevel: 5, isBulk: false }])} className='flex-1 py-2 border border-dashed border-slate-200 rounded-lg text-[11px] font-bold text-slate-400'>+ Add Item</button>
          <button type="submit" className='flex-1 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold shadow-md'>Save All</button>
        </div>
      </form>
    </div>
  );
}

const FormInput = ({ label, value, onChange, type = "text" }) => (
  <div className="flex flex-col">
    <label className='text-[9px] uppercase font-bold text-slate-400 mb-0.5'>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className='p-1.5 bg-slate-50 rounded text-xs ring-1 ring-slate-100' />
  </div>
);

const MiniInput = ({ label, onChange }) => (
  <div className="flex flex-col">
    <label className="text-[8px] font-bold text-blue-600 uppercase mb-0.5">{label}</label>
    <input type="number" className="p-1 text-[10px] rounded border-none ring-1 ring-blue-100" onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default InventoryForm;