import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { ref, onValue, set, update } from 'firebase/database';
import { db, auth } from '../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { Scan } from 'lucide-react'; // Optional icon

export default function SaleForm({ onClose }) {
  const [products, setProducts] = useState([
    { productId: '', quantity: 1, price: 0, total: 0, productName: '', availableStock: 0 }
  ]);
  const [inventoryList, setInventoryList] = useState([]);
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [barcodeInput, setBarcodeInput] = useState(''); // New state for barcode
  const scanInputRef = useRef(null);

  useEffect(() => {
    const bizId = localStorage.getItem("active_business_id");

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const inventoryRef = ref(db, `businessData/${bizId}/inventory`);
        const unsubscribeData = onValue(inventoryRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const list = Object.keys(data).map(key => ({
              ...data[key],
              firebaseKey: key
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

  /* ---------------- BARCODE SCANNER LOGIC ---------------- */
  const handleBarcodeScan = (e) => {
    e.preventDefault();
    const sku = barcodeInput.trim();
    if (!sku) return;

    // Find product in inventory that matches the SKU
    const item = inventoryList.find(i => i.sku === sku || i.firebaseKey === sku);

    if (item) {
      const existingProductIndex = products.findIndex(p => p.productId === item.firebaseKey);

      if (existingProductIndex !== -1) {
        // If product already in list, just increase quantity
        const newProducts = [...products];
        newProducts[existingProductIndex].quantity += 1;
        newProducts[existingProductIndex].total = newProducts[existingProductIndex].quantity * newProducts[existingProductIndex].price;
        setProducts(newProducts);
      } else {
        // If it's a new product, add a new row (or replace the first empty row)
        const newRow = {
          productId: item.firebaseKey,
          productName: item.product || item.productName,
          price: Number(item.price),
          quantity: 1,
          availableStock: Number(item.quantity),
          total: Number(item.price)
        };

        if (products.length === 1 && products[0].productId === '') {
          setProducts([newRow]);
        } else {
          setProducts([...products, newRow]);
        }
      }
      setBarcodeInput(''); // Clear input for next scan
    } else {
      alert("Product not found for this barcode!");
      setBarcodeInput('');
    }
  };

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

  const handleProductChange = (index, selectedFirebaseKey) => {
    const item = inventoryList.find(i => i.firebaseKey === selectedFirebaseKey);
    if (item) {
      const newProducts = [...products];
      newProducts[index] = {
        ...newProducts[index],
        productId: item.firebaseKey,
        productName: item.product || item.productName,
        price: Number(item.price),
        availableStock: Number(item.quantity),
        total: Number(item.price) * (newProducts[index].quantity || 1)
      };
      setProducts(newProducts);
    }
  };

  const handleQuantityChange = (index, qty) => {
    const newProducts = [...products];
    const val = Math.max(0, parseInt(qty) || 0);
    newProducts[index].quantity = val;
    newProducts[index].total = newProducts[index].price * val;
    setProducts(newProducts);
  };

  const calculateTotal = () => products.reduce((sum, item) => sum + item.total, 0);

  const validateStock = () => {
    return products.length > 0 && products.every(p =>
      p.productId !== '' &&
      p.quantity > 0 &&
      p.quantity <= p.availableStock
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    // 1. Get the shared Business ID from storage
    const bizId = localStorage.getItem("active_business_id");

    if (!user || !bizId) return alert("Please log in again");
    if (!validateStock()) return alert("Check product selection and stock levels!");

    try {
      const updates = {};
      const timestamp = Date.now();
      const transactionId = `TRANS-${timestamp}`;
      const grandTotal = calculateTotal();

      // 2. Create the date string for the new folder structure
      // This matches the "YYYY-MM-DD" fetch logic
      const dateKey = new Date().toISOString().split('T')[0];

      // 3. Update the path to include bizId and the Date folder
      const mainSalePath = `businessData/${bizId}/sales/${transactionId}`;

      updates[mainSalePath] = {
        transactionId,
        customer: customer || 'Walk-in Customer',
        paymentMethod,
        date: new Date().toISOString(),
        displayDate: getCurrentDate(),
        grandTotal,
        sellerId: user.uid, // Good to track WHICH staff member made the sale
        items: products.map(p => ({
          productId: p.productId,
          productName: p.productName,
          quantity: p.quantity,
          price: p.price,
          total: p.total
        }))
      };

      // 4. Deduct inventory from the SHARED business folder
      products.forEach((p) => {
        const inventoryQtyPath = `businessData/${bizId}/inventory/${p.productId}/quantity`;
        const newQty = Number(p.availableStock) - Number(p.quantity);
        updates[inventoryQtyPath] = newQty;
      });

      await update(ref(db), updates);
      alert(`✅ Transaction recorded!`);
      onClose();
    } catch (err) {
      alert("Error saving sale: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading Inventory...</div>;

  return (
    <div className='max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>New Sale</h2>
          <p className='text-gray-600 text-sm'>Date: {getCurrentDate()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Customer & Payment */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Customer Name</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder='Walk-in customer'
              className='w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
            />
          </div>

          <div>
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

        {/* Barcode Scan Area - NEW UI ADDITION */}
        <div className='bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4'>
          <div className='bg-blue-600 p-2 rounded-lg text-white'>
            <Scan size={20} />
          </div>
          <div className='flex-1'>
            <label className='block text-[10px] uppercase font-bold text-blue-600 mb-1'>Barcode Scan Mode</label>
            <input
              ref={scanInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan(e)}
              placeholder="Scan barcode or type SKU here..."
              className='w-full bg-transparent border-b border-blue-200 focus:border-blue-500 outline-none text-sm font-medium'
            />
          </div>
          <p className='text-[10px] text-blue-400 italic hidden md:block'>Tip: Hit 'Enter' to add item</p>
        </div>

        {/* Product Items */}
        <div className='space-y-4'>
          <div className='flex justify-between items-center border-b pb-2'>
            <h3 className='text-lg font-semibold text-gray-700'>Items</h3>
            <button type="button" onClick={addProductRow} className='text-blue-600 font-bold text-sm hover:underline'>
              + Add Item Manually
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
                          {item.product} ({item.sku || 'No SKU'})
                        </option>
                      ))}
                    </select>
                  </div>

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

                  <div>
                    <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Unit Price</label>
                    <div className='p-2 text-sm font-semibold'>₦{product.price.toLocaleString()}</div>
                  </div>

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
          className='w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed'
        >
          {validateStock() ? 'Complete Sale' : 'Please check items & stock'}
        </button>
      </form>
    </div>
  );
}