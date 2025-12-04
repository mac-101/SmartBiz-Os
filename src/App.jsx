import Dashboard from './pages/dashboard.jsx'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from './components/appLayout.jsx';
import Inventory from './pages/inventory.jsx';
import Expenses from './pages/expenses.jsx';
import Sales from './pages/sales.jsx';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/assistant" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App
