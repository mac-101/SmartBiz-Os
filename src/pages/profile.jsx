import React, { useEffect, useState } from 'react';
import { auth, db } from "../../firebase.config";
import { ref, onValue } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import EditBusiness from '../components/fetch-data';

function BusinessProfile() {
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const businessRef = ref(db, `businessData/${user.uid}/businessInfo`);
    const unsubscribe = onValue(businessRef, (snapshot) => {
      setBusinessData(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const downloadCardAsHTML = () => {
    if (!businessData) return;

    // This is the raw HTML/CSS for the standalone file
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

    // Create a blob and download it
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${businessData.businessName.replace(/\s+/g, '_')}_Card.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen relative bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">

      {/* Visual Preview on Page */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {businessData?.businessName?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{businessData?.businessName}</h2>
            <p className="text-slate-500 text-sm italic">{businessData?.businessType}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-600 border-t pt-4">
          <p><strong>Owner:</strong> {businessData?.ownerName}</p>
          <p><strong>Email:</strong> {businessData?.adminEmail}</p>
          <p><strong>Location:</strong> {businessData?.address}</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={downloadCardAsHTML}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          📄 Save Card as HTML File
        </button>

        <button
          onClick={() => setEdit(true)}
          className="w-full bg-white text-slate-700 font-semibold py-3 rounded-xl border border-slate-300 hover:bg-slate-50 transition-all"
        >
          Edit Business Info
        </button>
      </div>

      {edit &&
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <EditBusiness businessData={businessData} onClose={() => setEdit(false)} />
        </div>
      }


    </div>
  );
}

export default BusinessProfile;