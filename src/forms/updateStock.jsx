import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db, auth } from '../../firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

export default function UpdateStock({onClose}) { // Added close prop
    const [products, setProducts] = useState([
        { productId: '', quantity: 0, cost: 0, price: 0, total: 0, productName: '', availableStock: 0 }
    ]);
    const [inventoryList, setInventoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const inventoryRef = ref(db, `businessData/${user.uid}/inventory`);
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

    const getCurrentDate = () => {
        const date = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[date.getDay()]} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const addProductRow = () => {
        setProducts([...products, { productId: '', quantity: 0, cost: 0, price: 0, total: 0, productName: '', availableStock: 0 }]);
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
                cost: Number(item.cost || 0), // Default to current cost
                price: Number(item.price || 0), // Default to current selling price
                availableStock: Number(item.quantity || 0)
            };
            setProducts(newProducts);
        }
    };

    const handleQuantityChange = (index, qty) => {
        const newProducts = [...products];
        const val = Math.max(0, parseInt(qty) || 0);
        newProducts[index].quantity = val;
        newProducts[index].total = newProducts[index].cost * val; // Expense total is qty * cost
        setProducts(newProducts);
    };

    const handleCostChange = (index, cost) => {
        const newProducts = [...products];
        newProducts[index].cost = Number(cost);
        newProducts[index].total = Number(cost) * newProducts[index].quantity;
        setProducts(newProducts);
    };

    const handlePriceChange = (index, price) => {
        const newProducts = [...products];
        newProducts[index].price = Number(price);
        setProducts(newProducts);
    };

    const calculateTotalExpense = () => products.reduce((sum, item) => sum + item.total, 0);

    const validateForm = () => {
        return products.length > 0 && products.every(p => p.productId !== '' && p.quantity > 0 && p.cost > 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return alert("Please log in");
        if (!validateForm()) return alert("Please ensure all items have quantity and cost price!");

        try {
            const updates = {};
            const timestamp = Date.now();
            const displayDate = getCurrentDate();

            products.forEach((p, index) => {
                const expenseId = `EXP-${timestamp}-${index}`;
            const date = new Date().toISOString().split('T')[0]; // Store in ISO format for easier querying, but display as needed

                
                // 1. Create Expense Record (Cash Out)
                updates[`businessData/${user.uid}/expenses/${expenseId}`] = {
                    category: 'Restock',
                    description: ` Restocked ${p.productName}`,
                    // quantity: p.quantity,
                    // unitCost: p.cost,
                    amount: p.total,
                    date: date,
                    paymentMethod: 'cash',
                    // displayDate: displayDate,
                    status: 'Paid', 
                    recordedAt: date,


                };

                // 2. Update Inventory (Add quantity and update prices)
                const inventoryPath = `businessData/${user.uid}/inventory/${p.productId}`;
                updates[`${inventoryPath}/quantity`] = Number(p.availableStock) + Number(p.quantity);
                updates[`${inventoryPath}/cost`] = p.cost;
                updates[`${inventoryPath}/price`] = p.price;
            });

            await update(ref(db), updates);
            alert("✅ Inventory updated and expenses logged!");
            onClose()
            setProducts([{ productId: '', quantity: 0, cost: 0, price: 0, total: 0, productName: '', availableStock: 0 }]);

        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

    return (
        <div className='max-w-4xl mx-auto p-4 md:p-6 rounded-xl '>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800'>Restock Inventory</h2>
                    <p className='text-gray-600 text-sm'>Add new stock & log as expense</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='flex justify-between items-center border-b pb-2'>
                        <h3 className='text-lg font-semibold text-gray-700'>Product Details</h3>
                        <button type="button" onClick={addProductRow} className='text-blue-600 font-bold text-sm'>+ Add Item</button>
                    </div>

                    {products.map((product, index) => (
                        <div key={index} className='p-4 border border-gray-100 rounded-xl bg-gray-50 relative grid grid-cols-2 lg:grid-cols-5 gap-4'>
                            {products.length > 1 && (
                                <button type="button" onClick={() => removeProductRow(index)} className='absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-red-500 shadow-sm'>×</button>
                            )}

                            <div className='col-span-2 lg:col-span-1'>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Product</label>
                                <select 
                                    value={product.productId} 
                                    onChange={(e) => handleProductChange(index, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Select</option>
                                    {inventoryList.map((item) => (
                                        <option key={item.firebaseKey} value={item.firebaseKey}>{item.product}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Qty Added</label>
                                <input type="number" value={product.quantity} onChange={(e) => handleQuantityChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                                <p className='text-[9px] text-gray-400 mt-1'>Current: {product.availableStock}</p>
                            </div>

                            <div>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>New Cost (₦)</label>
                                <input type="number" value={product.cost} onChange={(e) => handleCostChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>

                            <div>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>New Selling (₦)</label>
                                <input type="number" value={product.price} onChange={(e) => handlePriceChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                            </div>

                            <div>
                                <label className='block text-[10px] uppercase font-bold text-gray-400 mb-1'>Total Cost</label>
                                <div className='p-2 text-blue-700 font-bold text-sm'>₦{product.total.toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='p-6 bg-blue-50 rounded-2xl flex justify-between items-center'>
                    <span className='text-blue-900 uppercase tracking-widest text-xs font-bold'>Total Expense (Cash Out)</span>
                    <span className='text-3xl font-bold text-blue-900'>₦{calculateTotalExpense().toLocaleString()}</span>
                </div>

                <button
                    type="submit"
                    disabled={!validateForm()}
                    className='w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:bg-gray-300 transition-all'
                >
                    Update Inventory & Log Expense
                </button>
            </form>
        </div>
    );
}