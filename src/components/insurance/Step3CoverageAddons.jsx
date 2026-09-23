import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  PlusCircle,
  Percent,
  Banknote,
  HeartPulse,
  AlertCircle,
  Check
} from 'lucide-react';
import Button from '../ui/Button';

export function Step3CoverageAddons({
  insuranceCategory,
  motorAddons,
  setMotorAddons,
  healthCoverage,
  setHealthCoverage,
  onNext,
  onPrev
}) {
  const handleMotorToggle = (key) => {
    setMotorAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMotorChange = (key, value) => {
    setMotorAddons((prev) => ({ ...prev, [key]: value }));
  };

  const handleHealthChange = (key, value) => {
    setHealthCoverage((prev) => ({ ...prev, [key]: value }));
  };

  const handleHealthToggle = (key) => {
    setHealthCoverage((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const motorAddonList = [
    {
      id: 'addonZeroDep',
      title: 'Zero Depreciation (Bumper to Bumper)',
      desc: '100% full claim payout on plastic, nylon, rubber and metal parts without depreciation deduction.',
      badge: 'Most Popular',
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'addonEngineProtect',
      title: 'Engine & Gearbox Protection',
      desc: 'Covers water ingression (hydrostatic lock) and engine oil leakage damage.',
      badge: 'Monsoon Essential',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'addonRsa',
      title: '24x7 Roadside Assistance (RSA)',
      desc: 'Pan-India towing, flat tyre assistance, battery jumpstart, emergency fuel & minor repairs.',
      badge: '24x7 Support',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'addonRti',
      title: 'Return to Invoice (RTI)',
      desc: 'Pays showroom invoice price + registration + road tax in case of total loss or vehicle theft.',
      badge: 'High Value',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'addonConsumables',
      title: 'Consumables Cover',
      desc: 'Covers engine oil, lubricants, nut-bolts, washers, AC gas, and brake fluid during claims.',
      badge: 'Cost Saver',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'addonKeyReplace',
      title: 'Key & Lock Replacement',
      desc: 'Reimburses cost of replacement keys and lock cylinders up to ₹25,000 if keys are lost.',
      badge: 'Security',
      badgeColor: 'bg-slate-100 text-slate-800'
    },
    {
      id: 'addonTyreSecure',
      title: 'Tyre & Rim Secure',
      desc: 'Covers accidental cuts, bulges, and rim damage beyond normal tread wear.',
      badge: 'Protection',
      badgeColor: 'bg-teal-100 text-teal-800'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {insuranceCategory === 'MOTOR' ? (
        /* MOTOR INSURANCE COVERAGES & ADD-ONS */
        <div className="space-y-6">
          {/* Core Liability & PA Covers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              1. Statutory Third Party Liability & Personal Accident Covers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Third Party Property Damage (TPPD) Limit
                </label>
                <select
                  value={motorAddons.tppdLimit || '750000'}
                  onChange={(e) => handleMotorChange('tppdLimit', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="750000">Standard ₹7,50,000 (Recommended)</option>
                  <option value="6000">Restricted ₹6,000 (₹100 Discount)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Compulsory PA Cover for Owner-Driver (₹15 Lakhs)
                </label>
                <select
                  value={motorAddons.paOwnerDriver ? 'INCLUDED' : 'EXEMPT'}
                  onChange={(e) => handleMotorChange('paOwnerDriver', e.target.value === 'INCLUDED')}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="INCLUDED">Included (₹375 / Year)</option>
                  <option value="EXEMPT">Exempted (Client has Standalone PA Cover)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Passenger Unnamed PA Cover (Per Seat)
                </label>
                <select
                  value={motorAddons.paPassengerSum || '200000'}
                  onChange={(e) => handleMotorChange('paPassengerSum', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="0">None</option>
                  <option value="100000">₹1,00,000 / Passenger</option>
                  <option value="200000">₹2,00,000 / Passenger (Standard)</option>
                  <option value="500000">₹5,00,000 / Passenger</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-6 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={motorAddons.llPaidDriver}
                  onChange={() => handleMotorToggle('llPaidDriver')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">Legal Liability to Paid Driver (IMT 28 - ₹50)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={motorAddons.hasAntiTheft}
                  onChange={() => handleMotorToggle('hasAntiTheft')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700">ARAI-Approved Anti-Theft Device (2.5% OD Discount)</span>
              </label>
            </div>
          </div>

          {/* Electrical & Non-Electrical Accessories */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              2. Accessories & Bi-Fuel Kit Declarations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Electrical Fittings Value (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={motorAddons.electricalFittingsVal || ''}
                  onChange={(e) => handleMotorChange('electricalFittingsVal', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">Audio, Touchscreen, Fog Lamps (4% rate)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Non-Electrical Fittings Value (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={motorAddons.nonElectricalVal || ''}
                  onChange={(e) => handleMotorChange('nonElectricalVal', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">Seat Covers, Alloy Wheels, Body Kits</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  CNG / LPG Bi-Fuel Kit Value (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={motorAddons.cngValue || ''}
                  onChange={(e) => handleMotorChange('cngValue', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-400">External Kit (₹60 TP + 4% OD)</span>
              </div>
            </div>

            {/* Hypothecation Details */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={motorAddons.isHypothecated}
                  onChange={() => handleMotorToggle('isHypothecated')}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  Vehicle is under Hypothecation / Bank Loan (Financier Agreement)
                </span>
              </label>

              {motorAddons.isHypothecated && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bank / Financier Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank Ltd"
                      value={motorAddons.bankName || ''}
                      onChange={(e) => handleMotorChange('bankName', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Financier Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. Guindy Branch"
                      value={motorAddons.bankBranch || ''}
                      onChange={(e) => handleMotorChange('bankBranch', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loan Account No.</label>
                    <input
                      type="text"
                      placeholder="e.g. LN-98421002"
                      value={motorAddons.loanAccountNo || ''}
                      onChange={(e) => handleMotorChange('loanAccountNo', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Motor Add-on Bundles */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                3. Comprehensive Add-on Covers & Riders
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Select desired coverage enhancements</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {motorAddonList.map((addon) => {
                const isSelected = !!motorAddons[addon.id];
                return (
                  <div
                    key={addon.id}
                    onClick={() => handleMotorToggle(addon.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{addon.title}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${addon.badgeColor}`}>
                          {addon.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{addon.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* HEALTH INSURANCE COVERAGES, RIDERS & PED DECLARATIONS */
        <div className="space-y-6">
          {/* Sum Insured & Room Rent Preference */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              1. Sum Insured & Hospitalization Terms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sum Insured (Family Floater / Individual) *
                </label>
                <select
                  value={healthCoverage.sumInsured || '1000000'}
                  onChange={(e) => handleHealthChange('sumInsured', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-teal-500 font-bold text-teal-900"
                >
                  <option value="300000">₹3,00,000 (Basic)</option>
                  <option value="500000">₹5,00,000 (Standard)</option>
                  <option value="1000000">₹10,00,000 (Most Popular)</option>
                  <option value="1500000">₹15,00,000 (Enhanced)</option>
                  <option value="2500000">₹25,00,000 (Executive)</option>
                  <option value="5000000">₹50,00,000 (Super Top-up)</option>
                  <option value="10000000">₹1,00,00,000 (1 Crore High Net)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Room Rent Capping Preference
                </label>
                <select
                  value={healthCoverage.roomRentPreference || 'NO_CAPPING'}
                  onChange={(e) => handleHealthChange('roomRentPreference', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="NO_CAPPING">No Capping / Any Room (Recommended)</option>
                  <option value="SINGLE_PRIVATE_AC">Single Private A/C Room</option>
                  <option value="1_PERCENT_SI">1% of Sum Insured / Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Copay Preference (Lowers Annual Premium)
                </label>
                <select
                  value={healthCoverage.copayPreference || '0_PERCENT'}
                  onChange={(e) => handleHealthChange('copayPreference', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="0_PERCENT">0% Copay (100% Claim by Insurer)</option>
                  <option value="10_PERCENT">10% Copay (15% Premium Discount)</option>
                  <option value="20_PERCENT">20% Copay (25% Premium Discount)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Health Optional Riders */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              2. Optional Health Riders
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  healthCoverage.riderMaternity
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Maternity & Newborn Cover</span>
                  <input
                    type="checkbox"
                    checked={healthCoverage.riderMaternity}
                    onChange={() => handleHealthToggle('riderMaternity')}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Covers normal & C-section deliveries after 2-year waiting period.</p>
              </label>

              <label
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  healthCoverage.riderCriticalIllness
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Critical Illness Lump-Sum</span>
                  <input
                    type="checkbox"
                    checked={healthCoverage.riderCriticalIllness}
                    onChange={() => handleHealthToggle('riderCriticalIllness')}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-slate-500">₹10 Lakhs lump-sum payout on 32 critical illnesses diagnosis.</p>
              </label>

              <label
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  healthCoverage.riderHospitalCash
                    ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Hospital Daily Cash</span>
                  <input
                    type="checkbox"
                    checked={healthCoverage.riderHospitalCash}
                    onChange={() => handleHealthToggle('riderHospitalCash')}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-slate-500">₹2,000 / day cash allowance for out-of-pocket hospital expenses.</p>
              </label>
            </div>
          </div>

          {/* Medical Declarations & Pre-Existing Diseases (PED) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                3. Medical Declarations & Pre-Existing Diseases (PED)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={healthCoverage.pedDiabetes}
                  onChange={() => handleHealthToggle('pedDiabetes')}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Diabetes Mellitus</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={healthCoverage.pedHypertension}
                  onChange={() => handleHealthToggle('pedHypertension')}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Hypertension (High BP)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={healthCoverage.pedHeartCondition}
                  onChange={() => handleHealthToggle('pedHeartCondition')}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Cardiac / Heart History</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={healthCoverage.pedAsthma}
                  onChange={() => handleHealthToggle('pedAsthma')}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Asthma / Respiratory</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospitalization / Surgical History in Past 48 Months
              </label>
              <textarea
                rows={2}
                placeholder="Declare any past surgery, hospitalization, or continuous medication for any family member (leave blank if None)..."
                value={healthCoverage.pastHospitalization || ''}
                onChange={(e) => handleHealthChange('pastHospitalization', e.target.value)}
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="lg" icon={ArrowLeft} onClick={onPrev}>
          Back to Asset / Members
        </Button>
        <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" onClick={onNext}>
          Proceed to Step 4: Partner Eligibility
        </Button>
      </div>
    </div>
  );
}

export default Step3CoverageAddons;
