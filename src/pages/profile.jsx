import React, { useEffect, useState } from 'react';
import { auth, db } from "../../firebase.config";
import { ref, onValue } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import EditBusiness from '../components/fetch-data';
import { Download, Edit, Building2, User, Mail, MapPin, Phone } from 'lucide-react';

function BusinessProfile() {
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);
  const [edit, setEdit] = useState(false);
  const navigate = useNavigate();
  const bizId = localStorage.getItem("active_business_id");
      const userRole = localStorage.getItem("user_role") || "sales";

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate('/login');
      return;
    }

    const businessRef = ref(db, `businessData/${bizId}/businessInfo`);
    const unsubscribe = onValue(businessRef, (snapshot) => {
      setBusinessData(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const downloadCardAsHTML = () => {
    if (!businessData) return;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${businessData.businessName} - Business Card</title>
      <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
      <style>
        body { background: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
        .card { 
          width: 500px; height: 280px; background: white; border-radius: 15px; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); padding: 30px; 
          display: flex; flex-direction: column; justify-content: space-between;
          border: 1px solid #e2e8f0; position: relative; overflow: hidden;
        }
        .accent { position: absolute; top: 0; right: 0; width: 150px; height: 150px; background: #2563eb; border-bottom-left-radius: 100%; opacity: 0.1; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="accent"></div>
        <div class="flex justify-between items-start relative">
          <div>
            <h1 class="text-3xl font-black text-slate-800 uppercase m-0">${businessData.businessName}</h1>
            <p class="text-blue-600 font-bold text-sm tracking-widest uppercase mt-1">${businessData.businessType}</p>
          </div>
          <div class="w-12 h-12 bg-slate-800 text-white flex items-center justify-center rounded-lg text-2xl font-bold">
            ${businessData.businessName.charAt(0)}
          </div>
        </div>
        <div class="relative">
          <div class="h-1 w-12 bg-blue-600 mb-4"></div>
          <p class="text-slate-800 font-bold text-lg mb-2">${businessData.ownerName}</p>
          <div class="text-slate-500 text-xs space-y-1 font-medium">
            <p>📞 ${businessData.contact}</p>
            <p>✉️ ${businessData.adminEmail}</p>
            <p>📍 ${businessData.address}, ${businessData.state}</p>
            <p>🌐 ${businessData.website || ''}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessData.businessName}_Card.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading Business Profile...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Business Settings</h2>
          <p className="text-sm text-gray-500">Overview of your registered business identity.</p>
        </div>
        <div className="flex gap-2">
          {userRole === 'admin' || userRole === 'manager' && (
            <button
            onClick={() => setEdit(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit size={16} /> Edit Profile
          </button>
          )}
          <button
            onClick={downloadCardAsHTML}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-md text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download size={16} /> Save Digital Card
          </button>
        </div>
      </div>

      <div className=" mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Left Column: Info Grid */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Building2 size={18} className="text-gray-400" />
              <h3 className="font-bold text-gray-700">General Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoBox label="Business Name" value={businessData?.businessName} />
              <InfoBox label="Business Type" value={businessData?.businessType} />
              <InfoBox label="Owner / CEO" value={businessData?.ownerName} />
              <InfoBox label="Contact Number" value={businessData?.contact} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" />
              <h3 className="font-bold text-gray-700">Location & Contact</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-1 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Admin Email</p>
                  <p className="text-sm text-gray-700 font-medium">{businessData?.adminEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Office Address</p>
                  <p className="text-sm text-gray-700 font-medium">{businessData?.address}, {businessData?.state}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Preview */}
        {/* Right Column: Card Preview */}
        <div className="space-y-4 md:col-span-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Card Preview</p>

          {/* The Card Container */}
          <div className="relative w-full aspect-[5/2.8] bg-white rounded-[15px] border border-[#e2e8f0] shadow-xl p-[30px] flex flex-col justify-between overflow-hidden">

            {/* The Accent Circle */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#2563eb] rounded-bl-full opacity-10 pointer-events-none"></div>

            {/* Card Top Section */}
            <div className="flex justify-between items-start relative z-10">
              <div className="min-w-0 flex-1 pr-4">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase leading-none truncate m-0">
                  {businessData?.businessName}
                </h1>
                <p className="text-[#2563eb] font-bold text-xs tracking-widest uppercase mt-1 truncate">
                  {businessData?.businessType}
                </p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 bg-slate-800 text-white flex items-center justify-center rounded-lg text-2xl font-bold shadow-md">
                {businessData?.businessName?.charAt(0)}
              </div>
            </div>

            {/* Card Bottom Section */}
            <div className="relative z-10">
              <div className="h-1 w-12 bg-[#2563eb] mb-4"></div>
              <p className="text-slate-800 font-bold text-lg mb-2 truncate">
                {businessData?.ownerName}
              </p>
              <div className="text-slate-500 text-[10px] sm:text-xs space-y-1 font-medium leading-tight">
                <p className="truncate">📞 {businessData?.contact}</p>
                <p className="truncate">✉️ {businessData?.adminEmail}</p>
                <p className="truncate text-wrap line-clamp-1">📍 {businessData?.address}, {businessData?.state}</p>
                {businessData?.website && <p className="truncate text-blue-500 font-semibold">🌐 {businessData.website}</p>}
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 italic">This is a live preview of your generated business card.</p>
        </div>

      </div>

      {/* Simple Modal Overlay */}
      {edit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEdit(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            <EditBusiness businessData={businessData} onClose={() => setEdit(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for clean layout
function InfoBox({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{label}</p>
      <p className="text-sm text-gray-800 font-semibold mt-0.5">{value || 'Not provided'}</p>
    </div>
  );
}

export default BusinessProfile;