import React, { useEffect, useState } from 'react';
import { auth, db } from "../../firebase.config";
import { ref, onValue, update } from "firebase/database";
import { useNavigate } from 'react-router-dom';

function EditBusiness({ businessData, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // State for the form fields
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    address: '',
    contact: '',
    country: '',
    state: '',
    website: '',
    ownerName: ''
  });

  const businessTypes = ['Retail', 'Services', 'Restaurant', 'E-commerce', 'Manufacturing', 'Healthcare', 'Education', 'Other'];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch existing data to populate the form
    const businessRef = ref(db, `businessData/${user.uid}/businessInfo`);
    const unsubscribe = onValue(businessRef, (snapshot) => {
      if (snapshot.exists()) {
        setFormData(snapshot.val());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess(false);

    try {
      const user = auth.currentUser;
      const updates = {};
      
      // Path to the specific business info
      updates[`businessData/${user.uid}/businessInfo`] = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      await update(ref(db), updates);
      
      setSuccess(true);
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update business information.");
    } finally {
      onClose();
    }
  };

  if (loading) return <div className="p-10 text-center">Loading current info...</div>;

  return (
    <div className="">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Business Profile</h1>
          <p className="text-gray-500 text-sm">Update your business details below</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100">Changes saved successfully!</div>}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Business Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Owner/Admin Name</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {businessTypes.map(type => (
                  <option key={type} value={type.toLowerCase()}>{type}</option>
                ))}
              </select>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBusiness;