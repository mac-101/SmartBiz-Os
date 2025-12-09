import React, { useState } from 'react';

function BusinessSignup() {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  const [business, setBusiness] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    country: 'Nigeria',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    industry: '',
    logo: null
  });
  
  const [admin, setAdmin] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const businessTypes = ['Retail', 'Services', 'Restaurant', 'E-commerce', 'Manufacturing', 'Healthcare', 'Education', 'Other'];
  const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom'];
  const industries = ['Technology', 'Retail', 'Food & Beverage', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Transportation'];
  
  // Check if current step is complete
  const isStepComplete = (stepNum) => {
    switch(stepNum) {
      case 1:
        return business.name && business.type && business.email;
      case 2:
        return business.address && business.city && business.state;
      case 3:
        return admin.fullName && admin.email && admin.password && admin.password === admin.confirmPassword;
      default:
        return false;
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (isStepComplete(step)) {
      if (!completedSteps.includes(step)) {
        setCompletedSteps([...completedSteps, step]);
      }
      setStep(step + 1);
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Handle final submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isStepComplete(step)) {
      const businessData = { ...business, admin };
      console.log('Business Signup Data:', businessData);
      alert('Business account created successfully!');
      // Here you would save to localStorage or backend
    }
  };
  
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Your Business Account</h1>
          <p className="text-gray-600">Set up your business in 3 simple steps</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg
                  ${stepNum < step || completedSteps.includes(stepNum) 
                    ? 'bg-green-500' 
                    : stepNum === step 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'}`}
                >
                  {stepNum < step || completedSteps.includes(stepNum) ? '✓' : stepNum}
                </div>
                <span className="text-sm font-medium mt-2">
                  {stepNum === 1 ? 'Business Info' : stepNum === 2 ? 'Location' : 'Admin Account'}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Form Sections */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          
          {/* Step 1: Business Information */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Business Information</h2>
              <p className="text-gray-600 mb-6">Tell us about your business</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={business.name}
                    onChange={(e) => setBusiness({...business, name: e.target.value})}
                    placeholder="e.g., Tech Solutions Ltd"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    required
                    value={business.type}
                    onChange={(e) => setBusiness({...business, type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type.toLowerCase()}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={business.email}
                    onChange={(e) => setBusiness({...business, email: e.target.value})}
                    placeholder="contact@yourbusiness.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={business.phone}
                    onChange={(e) => setBusiness({...business, phone: e.target.value})}
                    placeholder="+234 801 234 5678"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    required
                    value={business.country}
                    onChange={(e) => setBusiness({...business, country: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={business.industry}
                    onChange={(e) => setBusiness({...business, industry: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Business Preview */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Business Preview</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {business.name.charAt(0) || 'B'}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{business.name || 'Your Business Name'}</p>
                    <p className="text-gray-600">{business.type ? `${business.type.charAt(0).toUpperCase() + business.type.slice(1)} • ${business.country}` : 'Select business type'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Location Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Location Details</h2>
              <p className="text-gray-600 mb-6">Where is your business located?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={business.address}
                    onChange={(e) => setBusiness({...business, address: e.target.value})}
                    placeholder="123 Business Street"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={business.city}
                    onChange={(e) => setBusiness({...business, city: e.target.value})}
                    placeholder="e.g., Lagos"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={business.state}
                    onChange={(e) => setBusiness({...business, state: e.target.value})}
                    placeholder="e.g., Lagos State"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={business.zipCode}
                    onChange={(e) => setBusiness({...business, zipCode: e.target.value})}
                    placeholder="100001"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-medium">{business.currency === 'NGN' ? '₦ Nigerian Naira' : business.currency}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-medium">{business.timezone}</span>
                  </div>
                </div>
              </div>
              
              {/* Location Preview */}
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">Location Preview</h3>
                <div className="space-y-2">
                  <p className="font-medium">{business.address || '123 Business Street'}</p>
                  <p className="text-gray-600">
                    {business.city || 'City'}, {business.state || 'State'} {business.zipCode || 'ZIP'}
                  </p>
                  <p className="text-gray-600">{business.country}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Admin Account */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Account</h2>
              <p className="text-gray-600 mb-6">Create your administrator account</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={admin.fullName}
                    onChange={(e) => setAdmin({...admin, fullName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={admin.email}
                    onChange={(e) => setAdmin({...admin, email: e.target.value})}
                    placeholder="john@yourbusiness.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={admin.password}
                    onChange={(e) => setAdmin({...admin, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters with letters and numbers</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={admin.confirmPassword}
                    onChange={(e) => setAdmin({...admin, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {admin.password && admin.confirmPassword && admin.password !== admin.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={admin.phone}
                    onChange={(e) => setAdmin({...admin, phone: e.target.value})}
                    placeholder="+234 801 234 5678"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Terms & Conditions */}
              <div className="mt-6">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" required className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </span>
                </label>
                
                <label className="flex items-center space-x-3 mt-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">
                    Subscribe to monthly business insights and updates
                  </span>
                </label>
              </div>
              
              {/* Account Preview */}
              <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="font-semibold text-purple-800 mb-2">Account Preview</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">
                      {admin.fullName.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{admin.fullName || 'Admin Name'}</p>
                    <p className="text-gray-600">{admin.email || 'admin@email.com'}</p>
                    <p className="text-sm text-gray-500">Administrator • Full Access</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={step === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                step === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Previous
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepComplete(step)}
                className={`px-8 py-3 rounded-lg font-medium ${
                  !isStepComplete(step)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Continue → Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepComplete(step)}
                className={`px-8 py-3 rounded-lg font-medium ${
                  !isStepComplete(step)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                🎉 Create Business Account
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Summary */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Step {step} of 3 • {completedSteps.length} sections completed
        </div>
      </div>
    </div>
  );
}

export default BusinessSignup;