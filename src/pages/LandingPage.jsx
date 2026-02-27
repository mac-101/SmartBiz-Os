import React from 'react';
import { 
  Box, 
  BarChart3, 
  Layers, 
  Shield, 
  Zap, 
  ArrowRight,
  Globe,
  PieChart,
  MoveRight,
  Check
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#1A1D21] font-sans selection:bg-blue-100">
      
      {/* 1️⃣ Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Box className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">SmartBiZ<span className="text-blue-600">Os</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-blue-600 transition">Product</a>
            <a href="#" className="hover:text-blue-600 transition">Solutions</a>
            <a href="#" className="hover:text-blue-600 transition">Resources</a>
            <a href="#" className="hover:text-blue-600 transition">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-semibold px-4">Log in</button>
            <button className="bg-[#1A1D21] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-600 transition-all duration-300">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 2️⃣ HeroSection */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-3xl -z-10 opacity-60"></div>
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-600 text-xs font-bold mb-8 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            New: AI Inventory Forecasting
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1] mb-8">
            Manage stock with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">absolute clarity.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one inventory OS for modern brands. Track SKUs, manage suppliers, 
            and automate reordering in one powerful workspace.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-[#1A1D21] text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all">
              Start your free trial <MoveRight size={20} />
            </button>
            <button className="bg-white border border-slate-200 px-8 py-4 rounded-full font-bold hover:bg-slate-50 transition-all">
              Book a demo
            </button>
          </div>
        </div>

        {/* Floating Dashboard Component */}
        <div className="mt-20 max-w-6xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
             <img 
              src="https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=2000" 
              alt="SmartBiZOs Dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* 3️⃣ TrustedBrands */}
      <section className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale contrast-125">
            <span className="text-2xl font-black">LOGITECH</span>
            <span className="text-2xl font-black">NETFLIX</span>
            <span className="text-2xl font-black">SHOPIFY</span>
            <span className="text-2xl font-black">STRIPE</span>
            <span className="text-2xl font-black">VERCEL</span>
          </div>
        </div>
      </section>

      {/* 4️⃣ FeaturesGrid (The Bento Box) */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Large Feature */}
          <div className="md:col-span-7 bg-[#1A1D21] rounded-[2.5rem] p-12 text-white overflow-hidden relative group">
            <div className="relative z-10">
              <Zap className="text-blue-400 mb-6" size={40} />
              <h3 className="text-3xl font-bold mb-4">Lightning-fast inventory <br />sync across all channels.</h3>
              <p className="text-slate-400 max-w-md">Sync Shopify, Amazon, and Walmart in real-time. Never oversell again.</p>
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -z-0"></div>
          </div>

          {/* Secondary Bento Items */}
          <div className="md:col-span-5 bg-blue-50 rounded-[2.5rem] p-10 border border-blue-100">
            <BarChart3 className="text-blue-600 mb-6" size={32} />
            <h3 className="text-2xl font-bold mb-3">Predictive AI</h3>
            <p className="text-slate-600">SmartBiZOs predicts when you'll run out of stock based on seasonal trends.</p>
          </div>

          <div className="md:col-span-4 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200">
            <Globe className="text-indigo-600 mb-6" size={32} />
            <h3 className="text-2xl font-bold mb-3">Global Tracking</h3>
            <p className="text-slate-600">Manage multiple warehouses in different countries and currencies effortlessly.</p>
          </div>

          <div className="md:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <Shield className="text-emerald-500 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-slate-600">Your data is encrypted with AES-256. Role-based access ensures only the right people see your costs.</p>
            </div>
            <div className="w-full md:w-1/3 bg-slate-100 h-40 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* 5️⃣ DashboardPreview (Comparison Section) */}
      <section className="py-24 bg-[#1A1D21] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">Stop using spreadsheets <br /><span className="text-blue-400 font-serif italic">for complex logistics.</span></h2>
            <div className="space-y-8">
              {[
                { t: "Automated SKU Creation", d: "Instantly generate and print barcodes." },
                { t: "Vendor Management", d: "Store supplier contracts and lead times." },
                { t: "Profit Analytics", d: "Real-time COGS and gross margin tracking." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Check size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{item.t}</h4>
                    <p className="text-slate-400 text-sm">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-blue-500/10 blur-[120px]"></div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=1000" 
              className="rounded-3xl border border-white/10 shadow-3xl" 
              alt="Inventory Screen" 
            />
          </div>
        </div>
      </section>

      {/* 6️⃣ PricingSection */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4 italic">Pricing that scales with you.</h2>
          <p className="text-slate-500">Transparent pricing. No setup fees.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <PriceCard title="Growth" price="99" features={['500 Orders/mo', 'Basic Analytics', '1 Warehouse']} />
          <PriceCard title="Professional" price="249" features={['5,000 Orders/mo', 'AI Forecasting', '5 Warehouses']} highlighted={true} />
          <PriceCard title="Enterprise" price="999" features={['Unlimited Orders', 'Custom Integration', 'Global Nodes']} />
        </div>
      </section>

      {/* 8️⃣ Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-xs">
            <div className="text-2xl font-bold mb-6">SmartBiZ<span className="text-blue-600">Os</span></div>
            <p className="text-slate-500 text-sm leading-relaxed">The operating system for the next generation of e-commerce brands and manufacturers.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h5 className="font-bold text-sm mb-4">Product</h5>
              <ul className="text-slate-500 text-sm space-y-3">
                <li>Automations</li>
                <li>Integrations</li>
                <li>API Docs</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-4">Company</h5>
              <ul className="text-slate-500 text-sm space-y-3">
                <li>About</li>
                <li>Customers</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-50 flex justify-between text-xs text-slate-400">
          <p>© 2026 SmartBiZOs Technologies Inc.</p>
          <div className="flex gap-4">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Reusable Components
const PriceCard = ({ title, price, features, highlighted = false }) => (
  <div className={`p-10 rounded-[2.5rem] border ${highlighted ? 'bg-[#1A1D21] text-white border-slate-800 scale-105 shadow-2xl' : 'bg-white border-slate-200'} transition-all`}>
    <h4 className="text-lg font-bold mb-2">{title}</h4>
    <div className="text-4xl font-bold mb-8">${price}<span className="text-sm font-normal text-slate-400">/mo</span></div>
    <ul className="space-y-4 mb-10">
      {features.map((f, i) => (
        <li key={i} className="flex gap-2 text-sm items-center">
          <Check size={16} className="text-blue-500" /> {f}
        </li>
      ))}
    </ul>
    <button className={`w-full py-4 rounded-full font-bold text-sm transition-all ${highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
      Choose Plan
    </button>
  </div>
);

export default LandingPage;