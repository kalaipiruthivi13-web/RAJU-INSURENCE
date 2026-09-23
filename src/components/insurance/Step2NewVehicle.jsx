import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Check, Info } from 'lucide-react';
import Button from '../ui/Button';

export function Step2NewVehicle({
  motorProduct,
  motorData,
  setMotorData,
  onNext,
  onPrev
}) {
  const isCar = motorProduct === 'CAR';

  // Auto-calculate New Vehicle IDV (Standard 5% IRDAI depreciation on showroom invoice price)
  useEffect(() => {
    const invoice = Number(motorData.invoicePrice) || 0;
    if (invoice > 0) {
      const depRate = 0.05; // 5% for brand new zero-depreciation showroom vehicles
      const idv = Math.round(invoice * (1 - depRate));
      setMotorData((prev) => ({
        ...prev,
        calculatedIdv: idv,
        depPercent: 5
      }));
    }
  }, [motorData.invoicePrice]);

  const handleChange = (field, value) => {
    setMotorData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motorData.make || !motorData.model || !motorData.invoicePrice) {
      alert('Please fill Make, Model, and Showroom Invoice Price');
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Registration Status & Vehicle Classification */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
              1. Registration Status & Delivery Classification
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify registration stage for the brand new {isCar ? 'car' : 'two-wheeler'}
            </p>
          </div>
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
            Brand New Vehicle
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Registration Status *
            </label>
            <select
              value={motorData.registrationStatus || 'UNREGISTERED'}
              onChange={(e) => handleChange('registrationStatus', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            >
              <option value="UNREGISTERED">Brand New (Unregistered / Direct from Dealer)</option>
              <option value="TEMPORARY">Temporary Registration (TR Number)</option>
              <option value="PERMANENT">Permanent Number Allotted</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {motorData.registrationStatus === 'UNREGISTERED'
                ? 'Temporary / Chassis Tracking Ref'
                : 'Registration Number *'}
            </label>
            <input
              type="text"
              placeholder={motorData.registrationStatus === 'UNREGISTERED' ? 'NEW-VEHICLE-CHASSIS' : 'TN 09 BX 4512'}
              value={motorData.regNo || ''}
              onChange={(e) => handleChange('regNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase font-bold text-slate-800"
            />
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

      {/* 2. Technical Specifications & Specs */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider pb-3 border-b border-slate-100">
          2. Vehicle Make, Model, Variant & Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Make (Manufacturer) *
            </label>
            <input
              type="text"
              required
              placeholder={isCar ? 'e.g. Hyundai / Tata / Maruti Suzuki' : 'e.g. Royal Enfield / Honda / TVS'}
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
              placeholder={isCar ? 'e.g. Creta SX (O) 1.5' : 'e.g. Classic 350 Dual Channel'}
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
              {isCar && <option value="CNG_COMPANY">CNG (Company Fitted)</option>}
              <option value="EV">Electric (EV)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Engine Displacement (CC) *
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
              Seating Capacity (Including Driver)
            </label>
            <select
              value={motorData.seatingCapacity || (isCar ? '5' : '2')}
              onChange={(e) => handleChange('seatingCapacity', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
            >
              {isCar ? (
                <>
                  <option value="5">5 Seater (Sedan / Hatch / Mid-SUV)</option>
                  <option value="7">7 Seater (MPV / Large SUV)</option>
                  <option value="8">8 Seater</option>
                </>
              ) : (
                <>
                  <option value="2">2 Seater (Standard Two-Wheeler)</option>
                  <option value="1">1 Seater (Solo Rider)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              RC Body Color
            </label>
            <input
              type="text"
              placeholder="e.g. Polar White / Abyss Black"
              value={motorData.rcColor || ''}
              onChange={(e) => handleChange('rcColor', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chassis (VIN) Number
            </label>
            <input
              type="text"
              placeholder="MALC381CLNM441209"
              value={motorData.chassisNo || ''}
              onChange={(e) => handleChange('chassisNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Engine Number
            </label>
            <input
              type="text"
              placeholder="G4FLM891240"
              value={motorData.engineNo || ''}
              onChange={(e) => handleChange('engineNo', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* 3. Showroom Pricing & IDV Calculation */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
            3. Showroom Invoice & Auto-Calculated IDV
          </h3>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Brand New Zero-Depreciation IDV
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dealer Ex-Showroom Price (₹)
            </label>
            <input
              type="number"
              placeholder={isCar ? '950000' : '185000'}
              value={motorData.exShowroomPrice || ''}
              onChange={(e) => handleChange('exShowroomPrice', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono font-bold text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Base vehicle price before taxes</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Total Invoice Price (₹) *
            </label>
            <input
              type="number"
              required
              placeholder={isCar ? '1000000' : '200000'}
              value={motorData.invoicePrice || ''}
              onChange={(e) => handleChange('invoicePrice', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono font-black text-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">As per official dealer sales invoice</span>
          </div>

          {/* Auto IDV Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 flex flex-col justify-center">
            <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-wider block">
              Auto IDV (-5% IRDAI Showroom Dep)
            </span>
            <span className="text-xl font-black text-[#0F172A] mt-0.5">
              ₹{(motorData.calculatedIdv || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Insured Declared Value for New Vehicle</span>
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

export default Step2NewVehicle;
