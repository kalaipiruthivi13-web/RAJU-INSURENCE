import React from 'react';
import { User, Building, Phone, Mail, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

export function Step1CustomerKYC({
  customerData,
  setCustomerData,
  insuranceCategory,
  motorProduct,
  motorIntent,
  onNext,
  onBackToFunnel
}) {
  const handleChange = (field, value) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerData.legalName || !customerData.mobile) {
      alert('Please fill Legal Name and Mobile Number');
      return;
    }
    if (customerData.customerType === 'ORGANIZATION' && !customerData.gstin) {
      alert('GSTIN is required for Organization policies');
      return;
    }
    onNext();
  };

  // Determine flow badge label
  let productBadge = '🚗 Car Insurance • New Vehicle';
  if (insuranceCategory === 'MOTOR') {
    const prod = motorProduct === 'CAR' ? 'Car Insurance' : 'Two Wheeler Insurance';
    const intent = motorIntent === 'NEW' ? 'New Vehicle' : 'Policy Renewal';
    const icon = motorProduct === 'CAR' ? '🚗' : '🏍️';
    productBadge = `${icon} ${prod} • ${intent}`;
  } else {
    productBadge = '🏥 Health & Mediclaim (Family Floater)';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Policyholder Entity & Selected Product Line */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              1. Policyholder Entity & Classification
            </h3>
            <p className="text-xs text-slate-400">Select customer legal status and verify application line</p>
          </div>

          {/* Individual vs Organization Segmented Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleChange('customerType', 'INDIVIDUAL')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                customerData.customerType === 'INDIVIDUAL'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Individual
            </button>
            <button
              type="button"
              onClick={() => handleChange('customerType', 'ORGANIZATION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                customerData.customerType === 'ORGANIZATION'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Organization / Corporate
            </button>
          </div>
        </div>

        {/* Selected Product Pill & Quick Re-route */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-500">Selected Product Flow:</span>
            <span className="text-xs font-black text-[#0F172A] bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {productBadge}
            </span>
          </div>

          {onBackToFunnel && (
            <button
              type="button"
              onClick={onBackToFunnel}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-800 transition-colors cursor-pointer self-start sm:self-auto"
            >
              ← Change Product or Flow
            </button>
          )}
        </div>
      </div>

      {/* 2. Customer KYC & Contact Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          2. {customerData.customerType === 'ORGANIZATION' ? 'Corporate / Legal Entity Details' : 'Customer Identification & KYC'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {customerData.customerType === 'ORGANIZATION' ? 'Company Legal Name *' : 'Proposer Full Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder={customerData.customerType === 'ORGANIZATION' ? 'e.g. Apex Logistics Pvt Ltd' : 'e.g. Sundaramurthy M.'}
                value={customerData.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile Number (WhatsApp Enabled) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="+91 98400 12345"
                value={customerData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="client@company.com"
                value={customerData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              PAN Number *
            </label>
            <input
              type="text"
              required
              placeholder="ABCDE1234F"
              value={customerData.panNumber}
              onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
            />
          </div>

          {/* Organization Specific Fields */}
          {customerData.customerType === 'ORGANIZATION' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  GSTIN (15-Digit Format) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="33AAAAA0000A1Z5"
                  value={customerData.gstin}
                  onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  MSME / Udyam Registration No.
                </label>
                <input
                  type="text"
                  placeholder="UDYAM-TN-02-0012345"
                  value={customerData.msmeRegNo}
                  onChange={(e) => handleChange('msmeRegNo', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Address (Door, Street, Landmark)
            </label>
            <input
              type="text"
              placeholder="14/2, Anna Salai, Guindy"
              value={customerData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City / District
            </label>
            <input
              type="text"
              placeholder="Chennai"
              value={customerData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Postal Pincode
            </label>
            <input
              type="text"
              placeholder="600032"
              value={customerData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
        >
          Proceed to Step 2: Policy / Vehicle / Members
        </Button>
      </div>
    </form>
  );
}

export default Step1CustomerKYC;
