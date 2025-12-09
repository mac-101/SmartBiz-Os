// Save to browser
localStorage.setItem('sales', JSON.stringify(sales));

// Load from browser
const savedSales = JSON.parse(localStorage.getItem('sales')) || [];
// Data stays after refresh

//importing env variables
const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;


