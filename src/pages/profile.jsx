import React, { useEffect, useState } from 'react';
import { auth, db } from "../../firebase.config";
import { ref, onValue, get } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import EditBusiness from '../components/fetch-data';
import { Download, Edit, Building2, User, Mail, MapPin, CreditCard, ExternalLink, Crown } from 'lucide-react';

function BusinessProfile() {
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);
  const [staffName, setStaffName] = useState("");
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

    // 1. Fetch Staff Name if the user is not the Manager
    if (userRole !== 'manager') {
      const staffRef = ref(db, `businessData/${bizId}/staff/${user.uid}`);
      get(staffRef).then((snap) => {
        if (snap.exists()) setStaffName(snap.val().name);
      });
    }

    // 2. Fetch Business Info (including Subscription)
    const businessRef = ref(db, `businessData/${bizId}/businessInfo`);
    const unsubscribe = onValue(businessRef, (snapshot) => {
      setBusinessData(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, bizId, userRole]);

  // Determine whose name appears on the card
  const cardDisplayName = staffName || businessData?.ownerName || "Member";

  const downloadCardAsHTML = () => {
    if (!businessData) return;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${businessData.businessName} - Card</title>
      <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
      <style>
        body { background: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
        .card { width: 500px; height: 280px; background: white; border-radius: 15px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); padding: 30px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
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
          <div class="w-12 h-12 bg-slate-800 text-white flex items-center justify-center rounded-lg text-2xl font-bold">${businessData.businessName.charAt(0)}</div>
        </div>
        <div class="relative">
          <div class="h-1 w-12 bg-blue-600 mb-4"></div>
          <p class="text-slate-800 font-bold text-lg mb-2">${cardDisplayName}</p>
          <div class="text-slate-500 text-xs space-y-1 font-medium">
            <p>📞 ${businessData.contact}</p>
            <p>✉️ ${businessData.adminEmail}</p>
            <p>📍 ${businessData.address}, ${businessData.state}</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardDisplayName}_${businessData.businessName}_Card.html`;
    link.click();
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading Business Profile...</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Business Profile</h2>
          <p className="text-sm text-gray-500 font-medium italic">Logged in as: <span className="text-blue-600 font-bold">{userRole}</span></p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(userRole === 'admin' || userRole === 'manager') && (
            <>
              <a
                href="/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Crown size={16} /> View Plans
              </a>
              <button
                onClick={() => setEdit(true)}
                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit size={16} /> Edit Profile
              </button>
            </>
          )}
          <button
            onClick={downloadCardAsHTML}
            className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <Download size={16} /> Save Digital Card
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-3 space-y-6">
          {/* Subscription Info Card */}
          {(userRole === 'admin' || userRole === 'manager') && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-600" />
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Billing & Plan</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${businessData?.subscription?.plan === 'free' ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700'}`}>
                  {businessData?.subscription?.plan || 'No Plan'}
                </span>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Plan</p>
                  <p className="text-lg font-black text-slate-800 capitalize">{businessData?.subscription?.plan || 'Free'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry Date</p>
                  <p className="text-sm font-bold text-slate-700">{businessData?.subscription?.planEndDate.split('T')[0] || 'Never'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Building2 size={18} className="text-gray-400" />
              <h3 className="font-bold text-gray-700 uppercase text-xs">General Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoBox label="Business Name" value={businessData?.businessName} />
              <InfoBox label="Business Type" value={businessData?.businessType} />
              <InfoBox label="Owner / CEO" value={businessData?.ownerName} />
              <InfoBox label="Your Identity" value={cardDisplayName} />
            </div>
          </div>
        </div>

        {/* Card Preview */}
        <div className="space-y-4 lg:col-span-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Personalized Card Preview</p>
          <div className="relative w-full aspect-[5/2.8] bg-white rounded-[15px] border border-slate-200 shadow-xl p-[30px] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-blue-600 rounded-bl-full opacity-5"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="min-w-0 flex-1 pr-4">
                <h1 className="text-2xl font-black text-slate-800 uppercase leading-none truncate">{businessData?.businessName}</h1>
                <p className="text-blue-600 font-bold text-[10px] tracking-[0.2em] uppercase mt-2">{businessData?.businessType}</p>
              </div>
              <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center rounded-lg text-xl font-bold">
                {businessData?.businessName?.charAt(0)}
              </div>
            </div>

            <div className="relative z-10">
              <div className="h-1 w-8 bg-blue-600 mb-3"></div>
              <p className="text-slate-900 font-black text-lg truncate">{cardDisplayName}</p>
              <div className="text-slate-500 text-[10px] space-y-0.5 font-bold">
                <p>📞 {businessData?.contact}</p>
                <p>✉️ {businessData?.adminEmail}</p>
                <p className="truncate">📍 {businessData?.address}, {businessData?.state}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {edit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-slate-800 uppercase text-sm tracking-widest">Update Profile</h2>
              <button onClick={() => setEdit(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="overflow-y-auto p-6">
              <EditBusiness businessData={businessData} onClose={() => setEdit(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm text-slate-800 font-bold mt-1">{value || 'N/A'}</p>
    </div>
  );
}

export default BusinessProfile;