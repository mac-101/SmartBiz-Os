import React from "react";

const bentoFeatures = [
  {
    title: "Efficiency at Scale",
    description: "Streamline repetitive workflows, reduce manual effort, and scale your finance operations with ease.",
    renderIcon: () => (
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Soft Glow */}
        <div className="absolute w-32 h-32 bg-blue-400/20 blur-3xl rounded-full" />
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-xl">
          <rect x="40" y="30" width="120" height="100" rx="12" fill="white" />
          <rect x="40" y="30" width="120" height="100" rx="12" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M60 55H140" stroke="#F3F4F6" strokeWidth="8" strokeLinecap="round" />
          <path d="M60 75H110" stroke="#F3F4F6" strokeWidth="8" strokeLinecap="round" />
          <path d="M60 95H130" stroke="#F3F4F6" strokeWidth="8" strokeLinecap="round" />
          {/* Floating 'Doc' element */}
          <rect x="100" y="60" width="70" height="80" rx="8" fill="white" stroke="#3B82F6" strokeWidth="0.5" className="animate-bounce" style={{ animationDuration: '3s' }} />
          <path d="M115 80H155" stroke="#DBEAFE" strokeWidth="4" strokeLinecap="round" />
          <path d="M115 95H140" stroke="#DBEAFE" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    )
  },
  {
    title: "Actionable Insights",
    description: "Access real-time dashboards and KPI tracking that turn raw data into clear insights, empowering faster, smarter business decisions.",
    renderIcon: () => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-40 h-40 bg-indigo-400/10 blur-3xl rounded-full" />
        <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="180" height="110" rx="10" fill="white" stroke="#F3F4F6" />
          <rect x="35" y="40" width="40" height="30" rx="4" fill="#EEF2FF" />
          <rect x="85" y="40" width="40" height="30" rx="4" fill="#EEF2FF" />
          <rect x="135" y="40" width="40" height="30" rx="4" fill="#EEF2FF" />
          <path d="M40 110 L70 85 L100 95 L150 60 L180 70" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="180" cy="70" r="4" fill="#4F46E5" />
        </svg>
      </div>
    )
  },
  {
    title: "Enterprise Security",
    description: "Protect sensitive financial data with bank-grade encryption and enterprise compliance standards, including SOC 2, GDPR, and ISO certifications.",
    renderIcon: () => (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-32 h-32 bg-emerald-400/15 blur-3xl rounded-full" />
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="80" r="40" fill="white" stroke="#ECFDF5" strokeWidth="2" />
          <path d="M100 65V75M100 75L105 70M100 75L95 70" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          <rect x="88" y="78" width="24" height="18" rx="2" fill="#10B981" />
          <path d="M92 78V74C92 69.5817 95.5817 66 100 66C104.418 66 108 69.5817 108 74V78" stroke="#059669" strokeWidth="2" />
          <rect x="130" y="40" width="30" height="30" rx="6" fill="white" stroke="#F3F4F6" className="drop-shadow-sm" />
          <text x="137" y="59" fontSize="8" fontWeight="bold" fill="#9CA3AF">ISO</text>
          <rect x="40" y="100" width="35" height="30" rx="6" fill="white" stroke="#F3F4F6" className="drop-shadow-sm" />
          <text x="45" y="119" fontSize="8" fontWeight="bold" fill="#9CA3AF">SOC2</text>
        </svg>
      </div>
    )
  },
  {
    title: "Seamless Integration",
    description: "Integrate with over 100 enterprise tools, including ERP, CRM, payroll, and analytics, to keep your financial operations smooth and connected.",
    renderIcon: () => (
      <div className="relative w-full h-full flex items-center justify-center p-8">
         <div className="grid grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="w-12 h-12 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                 <div className={`w-6 h-6 rounded-sm ${i % 2 === 0 ? 'bg-indigo-100' : 'bg-blue-50'}`} />
              </div>
            ))}
         </div>
      </div>
    )
  }
];

export default function TrustedBrands() {
  const brands = ["Stripe", "Shopify", "Slack", "Paystack"];

  return (
    <>
      <section className="w-full py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400 text-lg mb-8">Trusted by modern businesses</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {brands.map((brand, i) => (
              <span key={i} className="text-3xl md:text-4xl font-bold text-gray-200 grayscale hover:grayscale-0 hover:text-gray-700 transition duration-300 cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 border-t border-gray-100 pt-16">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
              Built to Enhance Business Operations.
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
              Streamline financial operations with automation, insights, and security.
            </p>
          </div>

          <div className="grid md:grid-cols-2 border-t border-l border-gray-100">
            {bentoFeatures.map((item, index) => (
              <div key={index} className="p-12 border-b border-r border-gray-100 flex flex-col items-start group">
                <div className="w-full h-64 mb-8 flex items-center justify-center bg-gray-50/50 rounded-xl overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                  {item.renderIcon()}
                </div>
                <div className="max-w-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}