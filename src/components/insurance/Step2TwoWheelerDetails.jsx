import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import Button from '../ui/Button';

export function Step2TwoWheelerDetails({
  motorIntent,
  motorData,
  setMotorData,
  renewalData,
  onNext,
  onPrev
}) {
  const isNew = motorIntent === 'NEW';

  // Sync with renewalData if renewal flow
  useEffect(() => {
    if (!isNew && renewalData) {
      setMotorData((prev) => ({
        ...prev,
        regNo: renewalData.vehicleRegNo || prev.regNo,
        hasPreviousNcb: !renewalData.hasPreviousClaim,
        ncbPercentage: renewalData.hasPreviousClaim ? 0 : (renewalData.previousNcb || 20)
      }));
    }
  }, [renewalData, isNew]);

  // Auto-Calculate IDV & Total IDV based on Age or New Vehicle Schedule
  useEffect(() => {
    const invoice = Number(motorData.invoicePrice) || 185000;
    const mfgYear = Number(motorData.mfgYear) || new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const ageInYears = Math.max(0, currentYear - mfgYear);

    let depRate = 0.05; // 5% for brand new
    if (!isNew) {
      if (ageInYears === 1) depRate = 0.15;
      else if (ageInYears === 2) depRate = 0.20;
      else if (ageInYears === 3) depRate = 0.30;
      else if (ageInYears === 4) depRate = 0.40;
      else if (ageInYears >= 5) depRate = 0.50;
    }

    const baseIdv = Math.round(invoice * (1 - depRate));
    const accessoriesVal = Number(motorData.twoWheelerAccVal) || 0;
    const totalIdv = baseIdv + accessoriesVal;

    setMotorData((prev) => ({
      ...prev,
      calculatedIdv: baseIdv,
      totalIdv: totalIdv,
      depPercent: depRate * 100
    }));
  }, [motorData.invoicePrice, motorData.mfgYear, motorData.twoWheelerAccVal, isNew]);

  const handleChange = (field, value) => {
    setMotorData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNcbToggle = (hasNcb) => {
    setMotorData((prev) => ({
      ...prev,
      hasPreviousNcb: hasNcb,
      ncbPercentage: hasNcb ? (prev.ncbPercentage === 0 ? 20 : prev.ncbPercentage) : 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motorData.make || !motorData.model || !motorData.invoicePrice) {
      alert('Please fill Make, Model, and Invoice Value');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-black text-[#0F172A] tracking-wider uppercase">
            STEP 02 — TWO WHEELER DETAILS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure vehicle specifications, registration zone, valuation, and previous policy bonus
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full border border-blue-200">
          🏍️ Two Wheeler • {isNew ? 'New Vehicle' : 'Renewal'}
        </span>
      </div>

      {/* ┌─────────────────────────────────────┐
          │ 1. VEHICLE INFORMATION              │
          └─────────────────────────────────────┘ */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-black">1</span>
          1. VEHICLE INFORMATION
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Registration No *
            </label>
            <input
              type="text"
              required={!isNew}
              placeholder={isNew ? 'NEW-VEHICLE / UNREGISTERED' : 'TN 09 BX 4512'}
              value={motorData.regNo || ''}
              onChange={(e) => handleChange('regNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase font-black text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Manufacture Year *
            </label>
            <select
              value={motorData.mfgYear || 2024}
              onChange={(e) => handleChange('mfgYear', Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-bold text-slate-800"
            >
              <option value={2024}>2024 (Brand New / Current)</option>
              <option value={2023}>2023 (1 Year Old)</option>
              <option value={2022}>2022 (2 Years Old)</option>
              <option value={2021}>2021 (3 Years Old)</option>
              <option value={2020}>2020 (4 Years Old)</option>
              <option value={2019}>2019 (5 Years Old)</option>
              <option value={2018}>2018 (6 Years Old)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Make (Manufacturer) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Enfield / Honda / TVS / Yamaha"
              value={motorData.make || ''}
              onChange={(e) => handleChange('make', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Model *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Classic 350 / Activa 6G / Hunter 350"
              value={motorData.model || ''}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Variant
            </label>
            <input
              type="text"
              placeholder="e.g. Dual Channel ABS / Disc / STD"
              value={motorData.variant || ''}
              onChange={(e) => handleChange('variant', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-slate-800"
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
              <option value="EV">Electric (EV Battery)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Engine No *
            </label>
            <input
              type="text"
              required
              placeholder="J350E-1049281"
              value={motorData.engineNo || ''}
              onChange={(e) => handleChange('engineNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chassis No *
            </label>
            <input
              type="text"
              required
              placeholder="ME3J350FLNM109284"
              value={motorData.chassisNo || ''}
              onChange={(e) => handleChange('chassisNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seating
              </label>
              <select
                value={motorData.seatingCapacity || '2'}
                onChange={(e) => handleChange('seatingCapacity', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-bold text-slate-800"
              >
                <option value="2">2 Seater</option>
                <option value="1">1 Seater</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CC (Cubic Cap) *
              </label>
              <input
                type="number"
                required
                placeholder="349"
                value={motorData.cubicCapacity || ''}
                onChange={(e) => handleChange('cubicCapacity', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ┌─────────────────────────────────────┐
          │ 2. REGISTRATION & ZONE              │
          └─────────────────────────────────────┘ */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-black">2</span>
          2. REGISTRATION & ZONE
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              First Purchase / Registration Date *
            </label>
            <input
              type="date"
              required
              value={motorData.regDate || '2023-11-15'}
              onChange={(e) => handleChange('regDate', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Vehicle Zone *
            </label>
            <select
              value={motorData.vehicleZone || 'ZONE_A'}
              onChange={(e) => handleChange('vehicleZone', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            >
              <option value="ZONE_A">Zone A (Chennai / Metro RTO)</option>
              <option value="ZONE_B">Zone B (Rest of Tamil Nadu / Non-Metro)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Vehicle Colour
            </label>
            <input
              type="text"
              placeholder="e.g. Stealth Black / Signals Desert Sand"
              value={motorData.vehicleColor || ''}
              onChange={(e) => handleChange('vehicleColor', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              RC Book Colour
            </label>
            <input
              type="text"
              placeholder="e.g. Black / Matte Grey"
              value={motorData.rcColor || ''}
              onChange={(e) => handleChange('rcColor', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* ┌─────────────────────────────────────┐
          │ 3. VEHICLE VALUE                    │
          └─────────────────────────────────────┘ */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-black">3</span>
            3. VEHICLE VALUE
          </h3>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Two-Wheeler Valuation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Invoice Value (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="185000"
              value={motorData.invoicePrice || ''}
              onChange={(e) => handleChange('invoicePrice', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono font-black text-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Dealer invoice or previous year declared price</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              IDV (Insured Declared Value -{motorData.depPercent || 5}%)
            </label>
            <input
              type="number"
              readOnly
              value={motorData.calculatedIdv || 157250}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-800 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Base calculated value per IRDAI schedule</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Total IDV (₹)
            </label>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-3.5 py-1.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-[#2563EB] uppercase block">Total Net IDV</span>
                <span className="text-lg font-black text-[#0F172A]">
                  ₹{(motorData.totalIdv || motorData.calculatedIdv || 157250).toLocaleString('en-IN')}
                </span>
              </div>
              <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Final risk amount bound with insurer</span>
          </div>
        </div>
      </div>

      {/* ┌─────────────────────────────────────┐
          │ 4. PREVIOUS POLICY / NCB            │
          └─────────────────────────────────────┘ */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-black">4</span>
          4. PREVIOUS POLICY / NCB
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Previous NCB? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleNcbToggle(true)}
                className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  motorData.hasPreviousNcb !== false
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Yes (Eligible for Discount)
              </button>
              <button
                type="button"
                onClick={() => handleNcbToggle(false)}
                className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  motorData.hasPreviousNcb === false
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                No (New / Claimed)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              NCB % (Applicable No Claim Bonus) *
            </label>
            <select
              disabled={motorData.hasPreviousNcb === false}
              value={motorData.hasPreviousNcb === false ? 0 : (motorData.ncbPercentage || 20)}
              onChange={(e) => handleChange('ncbPercentage', Number(e.target.value))}
              className={`w-full px-3.5 py-2.5 text-xs border rounded-xl font-bold transition-colors ${
                motorData.hasPreviousNcb === false
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-[#0F172A] border-slate-200 focus:ring-2 focus:ring-[#2563EB]'
              }`}
            >
              <option value={0}>0% (New Vehicle / Claimed in Previous Term)</option>
              <option value={20}>20% (1 Claim-Free Year)</option>
              <option value={25}>25% (2 Claim-Free Years)</option>
              <option value={35}>35% (3 Claim-Free Years)</option>
              <option value={45}>45% (4 Claim-Free Years)</option>
              <option value={50}>50% Maximum Allowed Two-Wheeler NCB</option>
            </select>
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

export default Step2TwoWheelerDetails;
