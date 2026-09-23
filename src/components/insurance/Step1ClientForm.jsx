import React from 'react';
import { User, Phone, Mail, Car, HeartPulse, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

export function Step1ClientForm({ formData, setFormData, onNext }) {
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.phone) {
      alert('Please fill Client Name and Phone number');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Insurance Category Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4">
          1. Select Insurance Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            className={`flex items-center gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.insuranceType === 'motor'
                ? 'border-indigo-600 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="insuranceType"
              checked={formData.insuranceType === 'motor'}
              onChange={() => handleChange('insuranceType', 'motor')}
              className="sr-only"
            />
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Motor Comprehensive / Commercial</p>
              <p className="text-xs text-slate-500 mt-0.5">Private Cars, Two-Wheelers, Commercial Fleets</p>
            </div>
          </label>

          <label
            className={`flex items-center gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.insuranceType === 'health'
                ? 'border-teal-600 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="insuranceType"
              checked={formData.insuranceType === 'health'}
              onChange={() => handleChange('insuranceType', 'health')}
              className="sr-only"
            />
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Health & Mediclaim (Family Floater)</p>
              <p className="text-xs text-slate-500 mt-0.5">Individual, Senior Citizen & Family Floater</p>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Client KYC Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          2. Client KYC & Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Client Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g., Sundaramurthy M."
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile Number (WhatsApp) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="+91 98400 12345"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="client@gmail.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City / District
            </label>
            <input
              type="text"
              placeholder="e.g., Chennai / Madurai / Salem"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              PAN / Aadhaar Reference
            </label>
            <input
              type="text"
              placeholder="ABCDE1234F"
              value={formData.panNumber}
              onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Postal Pincode
            </label>
            <input
              type="text"
              placeholder="600001"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Conditional Vehicle or Health Coverage Details */}
      {formData.insuranceType === 'motor' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            3. Vehicle Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Vehicle Registration No *
              </label>
              <input
                type="text"
                placeholder="TN 09 BX 4512"
                value={formData.vehicleNumber}
                onChange={(e) => handleChange('vehicleNumber', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Make & Model
              </label>
              <input
                type="text"
                placeholder="Hyundai Creta SX / Maruti Swift"
                value={formData.vehicleModel}
                onChange={(e) => handleChange('vehicleModel', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registration Year
              </label>
              <select
                value={formData.regYear}
                onChange={(e) => handleChange('regYear', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="2024">2024 (Brand New)</option>
                <option value="2023">2023 (1 Year Old)</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019 or Older</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Insured Declared Value (IDV ₹)
              </label>
              <input
                type="number"
                placeholder="650000"
                value={formData.idv}
                onChange={(e) => handleChange('idv', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                No Claim Bonus (NCB %)
              </label>
              <select
                value={formData.ncb}
                onChange={(e) => handleChange('ncb', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="0">0% (New / Claimed last term)</option>
                <option value="20">20% Discount</option>
                <option value="25">25% Discount</option>
                <option value="35">35% Discount</option>
                <option value="45">45% Discount</option>
                <option value="50">50% Discount (Max Bonus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Add-ons
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                  Zero Depreciation
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                  Roadside 24x7
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                  Engine Secure
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            3. Health Insurance Coverage & Members
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sum Insured (Coverage Amount)
              </label>
              <select
                value={formData.sumInsured}
                onChange={(e) => handleChange('sumInsured', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="500000">₹5,00,000 (5 Lakhs)</option>
                <option value="1000000">₹10,00,000 (10 Lakhs)</option>
                <option value="1500000">₹15,00,000 (15 Lakhs)</option>
                <option value="2500000">₹25,00,000 (25 Lakhs)</option>
                <option value="5000000">₹50,00,000 (50 Lakhs)</option>
                <option value="10000000">₹1 Crore (Ultra Health)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Eldest Member Age
              </label>
              <input
                type="number"
                placeholder="42"
                value={formData.eldestAge}
                onChange={(e) => handleChange('eldestAge', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Plan Structure
              </label>
              <select
                value={formData.planType}
                onChange={(e) => handleChange('planType', e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="1A">Individual (1 Adult)</option>
                <option value="2A">2 Adults (Self + Spouse)</option>
                <option value="2A1C">2 Adults + 1 Child</option>
                <option value="2A2C">2 Adults + 2 Children</option>
                <option value="parents">Senior Citizens / Parents</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Navigation CTA */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
        >
          Select Insurance Partners (15 Licensed Insurers)
        </Button>
      </div>
    </form>
  );
}

export default Step1ClientForm;
