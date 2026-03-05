import React, { useState, useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { db, auth } from '../../firebase.config';

function InventoryForm({ onSuccess, product = null }) {
  const [products, setProducts] = useState([
    product
      ? { ...product, id: Date.now() }
      : { id: Date.now(), product: '', category: '', quantity: 0, cost: 0, price: 0, reorderLevel: 5, isBulk: false }
  ]);

  const [categories, setCategories] = useState(['Electronics', 'Furniture', 'Office Supplies', 'Accessories']);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const addProduct = () => {
    setProducts([...products, { id: Date.now(), product: '', category: '', quantity: 0, cost: 0, price: 0, reorderLevel: 5, isBulk: false }]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(prod => prod.id !== id));
    }
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(prod => prod.id === id ? { ...prod, [field]: value } : prod));
  };

  // --- REVISED BULK LOGIC ---
  const handleBulkCalculation = (id, cartonPrice, itemsPerCarton, numCartons) => {
    const cPrice = parseFloat(cartonPrice) || 0;
    const itemsPer = parseInt(itemsPerCarton) || 1;
    const totalCartons = parseInt(numCartons) || 0;
    
    const unitCost = itemsPer > 0 ? (cPrice / itemsPer) : 0;
    const totalPacks = itemsPer * totalCartons;

    setProducts(products.map(prod =>
      prod.id === id ? {
        ...prod,
        cost: unitCost.toFixed(2),      // Cost of 1 single pack
        quantity: totalPacks,          // Total packs (e.g., 2 cartons * 40 = 80 packs)
        tempCartonPrice: cartonPrice,
        tempItemsPer: itemsPerCarton,
        tempCartonQty: numCartons
      } : prod
    ));
  };

  const calculateTotalValue = () => {
    return products.reduce((total, prod) =>
      total + ((parseFloat(prod.cost) || 0) * (parseInt(prod.quantity) || 0)), 0
    );
  };

  const getStockStatus = (qty, reorder) => {
    const q = parseInt(qty) || 0;
    const r = parseInt(reorder) || 0;
    if (q === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (q <= r) return { text: 'Low Stock', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const handleCustomCategory = () => {
    if (newCatName && !categories.includes(newCatName)) {
      setCategories([...categories, newCatName]);
      setIsAddingCategory(false);
      setNewCatName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Please log in first");

        const bizId = localStorage.getItem("active_business_id");


    try {
      const promises = products.flatMap((prod, index) => {
        const sku = prod.sku || `${prod.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}-${index + 1}`;
        const productPath = `businessData/${bizId}/inventory/${sku}`;
        const barcodePath = `businessData/${bizId}/barcode/${prod.id}`; 

        return [
          set(ref(db, productPath), {
            ...prod,
            sku: sku,
            lastUpdated: new Date().toISOString()
          }),
          set(ref(db, barcodePath), {
            barcode: sku,
            productId: prod.id
          })
        ];
      });

      await Promise.all(promises);
      alert("Inventory Saved!");
      onSuccess();
      if (!product) setProducts([{ id: Date.now(), product: '', category: '', quantity: 0, cost: 0, price: 0, reorderLevel: 5, isBulk: false }]);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  useEffect(() => {
    if (product) setProducts([{ ...product, id: Date.now() }]);
  }, [product]);

  return (
    <div className='max-w-4xl mx-auto p-3 md:p-6 bg-white rounded-2xl'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>Manage Inventory</h2>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {products.map((prod, index) => {
          const status = getStockStatus(prod.quantity, prod.reorderLevel);
          const itemTotal = (parseFloat(prod.cost) || 0) * (parseInt(prod.quantity) || 0);

          return (
            <div key={prod.id} className='p-4 border border-gray-200 rounded-xl bg-white space-y-4 shadow-sm'>
              <div className='flex justify-between items-center'>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>{status.text}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={prod.isBulk || false}
                    onChange={(e) => updateProduct(prod.id, 'isBulk', e.target.checked)}
                    className="w-4 h-4 accent-orange-600"
                  />
                  <label className="text-xs font-bold text-orange-600">Buy in Cartons?</label>
                </div>
              </div>

              {/* CARTON CALCULATOR */}
              {prod.isBulk && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-orange-700">1 Carton Price (₦)</label>
                    <input
                      type="number"
                      className="w-full p-2 text-sm rounded border border-orange-200"
                      placeholder="Price you paid for 1 box"
                      onChange={(e) => handleBulkCalculation(prod.id, e.target.value, prod.tempItemsPer, prod.tempCartonQty)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-orange-700">Packs per Carton</label>
                    <input
                      type="number"
                      className="w-full p-2 text-sm rounded border border-orange-200"
                      placeholder="Items inside 1 box"
                      onChange={(e) => handleBulkCalculation(prod.id, prod.tempCartonPrice, e.target.value, prod.tempCartonQty)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-orange-700">How many Cartons?</label>
                    <input
                      type="number"
                      className="w-full p-2 text-sm rounded border border-orange-200"
                      placeholder="Number of boxes"
                      onChange={(e) => handleBulkCalculation(prod.id, prod.tempCartonPrice, prod.tempItemsPer, e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* MAIN FORM FIELDS */}
              <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                <div className="col-span-2">
                  <label className='text-[10px] uppercase font-bold text-gray-400'>Product Name</label>
                  <input required value={prod.product} onChange={(e) => updateProduct(prod.id, 'product', e.target.value)} className='w-full p-2 bg-gray-50 border rounded-md text-sm' />
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-gray-400'>Packs (Total Qty)</label>
                  <input type="number" value={prod.quantity} onChange={(e) => updateProduct(prod.id, 'quantity', e.target.value)} className='w-full p-2 bg-white border-2 border-gray-200 rounded-md text-sm font-bold' />
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-gray-400'>Unit Cost (₦)</label>
                  <input type="number" value={prod.cost} onChange={(e) => updateProduct(prod.id, 'cost', e.target.value)} className='w-full p-2 bg-white border-2 border-gray-200 rounded-md text-sm font-bold' />
                </div>
                <div>
                  <label className='text-[10px] uppercase font-bold text-gray-400'>Selling Price (₦)</label>
                  <input type="number" value={prod.price} onChange={(e) => updateProduct(prod.id, 'price', e.target.value)} className='w-full p-2 bg-white border-2 border-gray-200 rounded-md text-sm font-bold' />
                </div>
              </div>

              <div className="text-right text-xs font-bold text-gray-400">
                Item Stock Value: <span className="text-gray-700">₦{itemTotal.toLocaleString()}</span>
              </div>
            </div>
          );
        })}

        <div className='p-6 bg-green-700 rounded-2xl text-white flex justify-between items-center'>
          <div>
            <p className='text-xs opacity-80 uppercase font-bold'>Total Inventory Value (Cost)</p>
            <h3 className='text-3xl font-black'>₦{calculateTotalValue().toLocaleString()}</h3>
          </div>
        </div>

        <div className='flex gap-4'>
          <button type="button" onClick={addProduct} className='flex-1 py-3 border-2 border-dashed border-gray-300 rounded-xl font-bold text-gray-500 hover:bg-gray-50'>+ Add Another Item</button>
          <button type="submit" className='flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black'>Complete Purchase</button>
        </div>
      </form>
    </div>
  );
}

export default InventoryForm;