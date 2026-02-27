import React, { useState, useEffect } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { db, auth } from '../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth'; // Added for better auth handling

export default function SaleForm({onClose}) {
  const [products, setProducts] = useState([
    { productId: '', quantity: 0, price: 0, total: 0, productName: '', availableStock: 0 }
  ]);
  const [inventoryList, setInventoryList] = useState([]);
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);

  // 1. Better Auth & Fetch Logic
  useEffect(() => {
    // This ensures we wait for the user to be logged in before fetching
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const inventoryRef = ref(db, `businessData/${user.uid}/inventory`);
        const unsubscribeData = onValue(inventoryRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const list = Object.keys(data).map(key => ({
              ...data[key],
              firebaseKey: key // This is the actual folder name (e.g. "-NqJ8...")
            }));
            setInventoryList(list);
          }
          setLoading(false);
        });
        return () => unsubscribeData();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const getCurrentDate = () => {
    const date = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const addProductRow = () => {
    setProducts([...products, { productId: '', quantity: 1, price: 0, total: 0, productName: '', availableStock: 0 }]);
  };

  const removeProductRow = (index) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  // FIXED: Improved selection logic
  const handleProductChange = (index, selectedFirebaseKey) => {
    const item = inventoryList.find(i => i.firebaseKey === selectedFirebaseKey);

    if (item) {
      const newProducts = [...products];
      newProducts[index] = {
        ...newProducts[index],
        productId: item.firebaseKey, // We use the folder name here
        productName: item.product || item.productName,
        price: Number(item.price),
        availableStock: Number(item.quantity)
      };
      setProducts(newProducts);
    }
  };

  const handleQuantityChange = (index, qty) => {
    const newProducts = [...products];
    const val = Math.max(0, parseInt(qty) || 0); // Prevent negative numbers
    newProducts[index].quantity = val;
    newProducts[index].total = newProducts[index].price * val;
    setProducts(newProducts);
  };

  const calculateTotal = () => products.reduce((sum, item) => sum + item.total, 0);

  const validateStock = () => {
    // Ensure all rows have a product, qty > 0, and don't exceed stock
    return products.length > 0 && products.every(p =>
      p.productId !== '' &&
      p.quantity > 0 &&
      p.quantity <= p.availableStock
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Please log in");
    if (!validateStock()) return alert("Check product selection and stock levels!");

    console.log("🚀 Starting Individual Sale Processing...");
    
    try {
      const updates = {};
      const timestamp = Date.now();
      const isoDate = new Date().toISOString();
      const displayDate = getCurrentDate();

      // We loop through each product and create a unique Firebase entry for it
      products.forEach((p, index) => {
        if (p.productId) {
          // 1. Generate a unique ID for THIS specific item record
          const individualSaleId = `SALE-${timestamp}-${index}`;
          const salePath = `businessData/${user.uid}/sales/${individualSaleId}`;

          // 2. Add the Sale Record to our update object
          updates[salePath] = {
            customer: customer || 'Walk-in Customer',
            paymentMethod,
            productId: p.productId,
            productName: p.productName,
            quantity: p.quantity,
            price: p.price,
            total: p.total, // Individual subtotal
            date: isoDate,
            displayDate: displayDate
          };

          // 3. Add the Inventory Deduction to our update object
          const inventoryPath = `businessData/${user.uid}/inventory/${p.productId}/quantity`;
          const newQty = Number(p.availableStock) - Number(p.quantity);
          updates[inventoryPath] = newQty;

          console.log(`Prepared: ${p.productName} (Qty: ${p.quantity})`);
        }
      });

      // 4. EXECUTE ALL UPDATES AT ONCE (Atomic Update)
      await update(ref(db), updates);
      
      alert(`✅ ${products.length} item(s) recorded successfully!`);

      // Reset Form
      onClose();
      setProducts([{ productId: '', quantity: 1, price: 0, total: 0, productName: '', availableStock: 0 }]);
      setCustomer('');

    } catch (err) {
      console.error("❌ ERROR during sale:", err);
      alert("Error saving sale: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Inventory...</div>;

  return (
    <div className='max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl '>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>New Sale</h2>
          <p className='text-gray-600 text-sm'>Date: {getCurrentDate()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Customer & Payment */}
        <div className='grid grid-cols-3 md:grid-cols-2 gap-6'>
          <div className='col-span-2 md:col-span-1'>
            <label className='block  text-sm font-medium text-gray-700 mb-2'>Customer Name</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder='Walk-in customer'
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
            />
          </div>

          <div className='col-span-1 md:col-span-1'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
            >
              <option value="cash">💵 Cash</option>
              <option value="card">💳 Card</option>
              <option value="transfer">🏦 Bank Transfer</option>
              <option value="credit">📝 Credit</option>
            </select>
          </div>
        </div>

        {/* Product Items */}
        <div className='space-y-4'>
          <div className='flex justify-between items-center border-b pb-2'>
            <h3 className='text-lg font-semibold text-gray-700'>Items</h3>
            <button type="button" onClick={addProductRow} className='text-blue-600 font-bold text-sm hover:underline'>
              + Add Item
            </button>
          </div>

          {products.map((product, index) => {
            const isOutOfStock = product.productId && product.quantity > product.availableStock;

            return (
              <div key={index} className='p-4 border border-gray-200 rounded-xl bg-gray-50 relative'>
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProductRow(index)}
                    className='absolute top-2 right-3 text-gray-400 hover:text-red-500 text-lg'
                  >
                    ×
                  </button>
                )}

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                  {/* Dropdown */}
                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Product</label>
                    <select
                      value={product.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select product</option>
                      {inventoryList.map((item) => (
                        <option key={item.firebaseKey} value={item.firebaseKey}>
                          {item.product}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Qty */}
                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Qty</label>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className={`w-full p-2 border rounded-lg text-sm ${isOutOfStock ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    />
                    {product.productId && (
                      <p className={`text-[10px] mt-1 ${isOutOfStock ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                        {isOutOfStock ? 'Insufficient Stock!' : `Stock: ${product.availableStock}`}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Unit Price</label>
                    <div className='p-2 text-sm font-semibold'>₦{product.price.toLocaleString()}</div>
                  </div>

                  {/* Subtotal */}
                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Subtotal</label>
                    <div className='p-2 text-blue-700 font-bold text-sm'>₦{product.total.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className='p-6 bg-gray-900 rounded-2xl text-white flex justify-between items-center'>
          <span className='text-gray-400 uppercase tracking-widest text-xs font-bold'>Total Payable</span>
          <span className='text-3xl font-bold'>₦{calculateTotal().toLocaleString()}</span>
        </div>

        <button
          type="submit"
          disabled={!validateStock()}
          className='w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed '
        >
          {validateStock() ? 'Complete Sale' : 'Please check items & stock'}
        </button>
      </form>
    </div>
  );
}