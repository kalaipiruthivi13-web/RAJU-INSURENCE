import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

export function Step2ExistingVehicle({
  motorProduct,
  motorData,
  setMotorData,
  renewalData,
  partners,
  onNext,
  onPrev
}) {
  const isCar = motorProduct === 'CAR';

  // IDV Auto-Calculation Logic based on Age & IRDAI Depreciation Grid
  useEffect(() => {
    const invoice = Number(motorData.invoicePrice) || (isCar ? 1000000 : 180000);
    const mfgYear = Number(motorData.mfgYear) || (new Date().getFullYear() - 1);
    const currentYear = new Date().getFullYear();
    const ageInYears = Math.max(0, currentYear - mfgYear);

    let depRate = 0.05;
    if (ageInYears === 1) depRate = 0.15;
    else if (ageInYears === 2) depRate = 0.20;
    else if (ageInYears === 3) depRate = 0.30;
    else if (ageInYears === 4) depRate = 0.40;
    else if (ageInYears >= 5) depRate = 0.50;

    const calculated = Math.round(invoice * (1 - depRate));
    setMotorData((prev) => ({
      ...prev,
      calculatedIdv: calculated,
      depPercent: depRate * 100
    }));
  }, [motorData.invoicePrice, motorData.mfgYear, isCar]);

  // Sync with renewalData if available
  useEffect(() => {
    if (renewalData) {
      setMotorData((prev) => ({
        ...prev,
        regNo: renewalData.vehicleRegNo || prev.regNo,
        prevPolicyNo: renewalData.prevPolicyNo || prev.prevPolicyNo,
        prevInsurerId: renewalData.currentInsurerId || prev.prevInsurerId,
        hasPreviousClaim: renewalData.hasPreviousClaim ?? prev.hasPreviousClaim,
        ncbPercentage: renewalData.hasPreviousClaim ? 0 : (renewalData.previousNcb || 25)
      }));
    }
  }, [renewalData]);

  const handleChange = (field, value) => {
    setMotorData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClaimToggle = (hadClaim) => {
    setMotorData((prev) => ({
      ...prev,
      hasPreviousClaim: hadClaim,
      ncbPercentage: hadClaim ? 0 : (prev.ncbPercentage === 0 ? 20 : prev.ncbPercentage)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motorData.regNo || !motorData.make || !motorData.model) {
      alert('Please fill Vehicle Registration Number, Make, and Model');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Renewal Pre-Filled Policy Details Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
              1. Previous Policy & NCB Rollover History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Policyholder rollover parameters imported from existing schedule
            </p>
          </div>
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Policy Rollover / Renewal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Vehicle Registration Number *
            </label>
            <input
              type="text"
              required
              placeholder="TN 07 DJ 2341"
              value={motorData.regNo || ''}
              onChange={(e) => handleChange('regNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase font-black text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Previous Policy Number *
            </label>
            <input
              type="text"
              required
              placeholder="POL-2023-998821"
              value={motorData.prevPolicyNo || ''}
              onChange={(e) => handleChange('prevPolicyNo', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Previous Insurer *
            </label>
            <select
              value={motorData.prevInsurerId || 'hdfc_ergo'}
              onChange={(e) => handleChange('prevInsurerId', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            >
              {(partners || []).filter((p) => p.motorSupported).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Claim in Expiring Term? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleClaimToggle(false)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  !motorData.hasPreviousClaim
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                No (Eligible)
              </button>
              <button
                type="button"
                onClick={() => handleClaimToggle(true)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  motorData.hasPreviousClaim
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Yes (0% NCB)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Applicable NCB Discount % *
            </label>
            <select
              disabled={motorData.hasPreviousClaim}
              value={motorData.ncbPercentage || 0}
              onChange={(e) => handleChange('ncbPercentage', Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-bold text-[#0F172A]"
            >
              <option value={0}>0% (New / Claimed)</option>
              <option value={20}>20% (1 Claim-Free Year)</option>
              <option value={25}>25% (2 Claim-Free Years)</option>
              <option value={35}>35% (3 Claim-Free Years)</option>
              <option value={45}>45% (4 Claim-Free Years)</option>
              <option value={50}>50% Maximum Allowed Bonus</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              RTO & Tariff Zone *
            </label>
            <select
              value={motorData.vehicleZone || 'ZONE_A'}
              onChange={(e) => handleChange('vehicleZone', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            >
              <option value="ZONE_A">Zone A (Chennai / Tier-1 Metro)</option>
              <option value="ZONE_B">Zone B (Rest of Tamil Nadu / Non-Metro)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Existing Vehicle Technical Specifications */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider pb-3 border-b border-slate-100">
          2. Existing Vehicle Make, Model, CC & Chassis Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Make (Manufacturer) *
            </label>
            <input
              type="text"
              required
              placeholder={isCar ? 'e.g. Hyundai' : 'e.g. Royal Enfield'}
              value={motorData.make || ''}
              onChange={(e) => handleChange('make', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Model & Sub-Variant *
            </label>
            <input
              type="text"
              required
              placeholder={isCar ? 'e.g. Creta 1.5 SX' : 'e.g. Classic 350'}
              value={motorData.model || ''}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fuel Type *
            </label>
            <select
              value={motorData.fuelType || 'PETROL'}
              onChange={(e) => handleChange('fuelType', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            >
              <option value="PETROL">Petrol</option>
              {isCar && <option value="DIESEL">Diesel</option>}
              {isCar && <option value="CNG_COMPANY">CNG</option>}
              <option value="EV">Electric (EV)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Engine Displacement (CC)
            </label>
            <input
              type="number"
              placeholder={isCar ? '1497' : '349'}
              value={motorData.cubicCapacity || ''}
              onChange={(e) => handleChange('cubicCapacity', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Year of Manufacture *
            </label>
            <select
              value={motorData.mfgYear || 2023}
              onChange={(e) => handleChange('mfgYear', Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            >
              <option value={2024}>2024 (1 Year Old)</option>
              <option value={2023}>2023 (2 Years Old)</option>
              <option value={2022}>2022 (3 Years Old)</option>
              <option value={2021}>2021 (4 Years Old)</option>
              <option value={2020}>2020 (5 Years Old)</option>
              <option value={2019}>2019 (6 Years Old)</option>
              <option value={2018}>2018 (7 Years Old)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Engine Number *
            </label>
            <input
              type="text"
              required
              placeholder="G4FLM891240"
              value={motorData.engineNo || ''}
              onChange={(e) => handleChange('engineNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chassis (VIN) Number *
            </label>
            <input
              type="text"
              required
              placeholder="MALC381CLNM441209"
              value={motorData.chassisNo || ''}
              onChange={(e) => handleChange('chassisNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Original Invoice Price (₹)
            </label>
            <input
              type="number"
              placeholder={isCar ? '1000000' : '180000'}
              value={motorData.invoicePrice || ''}
              onChange={(e) => handleChange('invoicePrice', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono text-slate-800 font-bold"
            />
          </div>
        </div>

        {/* Calculated IDV Output Card */}
        <div className="pt-2">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider block">
                Calculated Insured Declared Value (IDV)
              </span>
              <div className="text-2xl font-black text-[#0F172A] mt-0.5">
                ₹{(motorData.calculatedIdv || 850000).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Depreciation applied: -{motorData.depPercent || 15}% based on vehicle age (IRDAI Tariff Schedule)
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                Rollover NCB: {motorData.ncbPercentage || 0}% Discount
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="lg" icon={ArrowLeft} onClick={onPrev}>
          Back to Customer KYC
        </Button>
        <Button
          variant="primary"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          type="submit"
          className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
        >
          Proceed to Step 3: Coverage & Add-ons
        </Button>
      </div>
    </form>
  );
}

export default Step2ExistingVehicle;
