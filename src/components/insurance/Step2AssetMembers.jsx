import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Car, Users, Plus, Trash2, Calculator, Info } from 'lucide-react';
import Button from '../ui/Button';

export function Step2AssetMembers({
  insuranceCategory,
  motorData,
  setMotorData,
  healthMembers,
  setHealthMembers,
  partners,
  onNext,
  onPrev
}) {
  // Motor IDV Auto-Calculation Logic
  useEffect(() => {
    if (insuranceCategory === 'MOTOR' && motorData.invoicePrice) {
      const invoice = Number(motorData.invoicePrice) || 0;
      const mfgYear = Number(motorData.mfgYear) || new Date().getFullYear();
      const currentYear = new Date().getFullYear();
      const ageInYears = Math.max(0, currentYear - mfgYear);

      let depRate = 0.05; // 0-6 months: 5%
      if (ageInYears === 1) depRate = 0.15;
      else if (ageInYears === 2) depRate = 0.20;
      else if (ageInYears === 3) depRate = 0.30;
      else if (ageInYears === 4) depRate = 0.40;
      else if (ageInYears >= 5) depRate = 0.50;

      const calculated = Math.round(invoice * (1 - depRate));
      setMotorData((prev) => ({ ...prev, calculatedIdv: calculated, depPercent: depRate * 100 }));
    }
  }, [motorData.invoicePrice, motorData.mfgYear, insuranceCategory]);

  const handleMotorChange = (field, value) => {
    setMotorData((prev) => ({ ...prev, [field]: value }));
  };

  // Health Members Dynamic Handlers
  const addHealthMember = (relation = 'CHILD') => {
    const newMember = {
      id: `MEM-${Date.now()}`,
      relation,
      memberName: '',
      dob: '2000-01-01',
      age: 24,
      gender: relation === 'SPOUSE' ? 'FEMALE' : 'MALE',
      heightCm: 170,
      weightKg: 65,
      bmi: 22.5,
      occupation: 'SALARIED'
    };
    setHealthMembers((prev) => [...prev, newMember]);
  };

  const removeHealthMember = (id) => {
    if (healthMembers.length <= 1) {
      alert('At least one insured member is required');
      return;
    }
    setHealthMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateHealthMember = (id, field, value) => {
    setHealthMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, [field]: value };

        // Auto calculate age from DOB
        if (field === 'dob') {
          const birthDate = new Date(value);
          const diff = Date.now() - birthDate.getTime();
          const ageDate = new Date(diff);
          updated.age = Math.max(0, Math.abs(ageDate.getUTCFullYear() - 1970));
        }

        // Auto calculate BMI from Height & Weight
        if (field === 'heightCm' || field === 'weightKg') {
          const h = Number(updated.heightCm) / 100;
          const w = Number(updated.weightKg);
          if (h > 0 && w > 0) {
            updated.bmi = Number((w / (h * h)).toFixed(1));
          }
        }

        return updated;
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (insuranceCategory === 'MOTOR') {
      if (!motorData.regNo || !motorData.make || !motorData.model) {
        alert('Please fill Vehicle Registration, Make and Model');
        return;
      }
    } else {
      if (healthMembers.some((m) => !m.memberName)) {
        alert('Please provide names for all insured members');
        return;
      }
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* PATH A: MOTOR INSURANCE VEHICLE SPECIFICATIONS */}
      {insuranceCategory === 'MOTOR' ? (
        <div className="space-y-6">
          {/* Policy Type & Registration Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Vehicle Identification & Policy Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Policy Nature *
                </label>
                <select
                  value={motorData.policyNature}
                  onChange={(e) => handleMotorChange('policyNature', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ROLLOVER_RENEWAL">Rollover Renewal (Expiring Policy)</option>
                  <option value="NEW_VEHICLE">Brand New Vehicle (Zero Reg)</option>
                  <option value="USED_PURCHASE">Used Vehicle Ownership Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vehicle Registration No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="TN 09 BX 4512"
                  value={motorData.regNo}
                  onChange={(e) => handleMotorChange('regNo', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  RTO & Tariff Zone *
                </label>
                <select
                  value={motorData.vehicleZone}
                  onChange={(e) => handleMotorChange('vehicleZone', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ZONE_A">Zone A (Chennai / Metro Cities)</option>
                  <option value="ZONE_B">Zone B (Rest of Tamil Nadu / Non-Metro)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vehicle Category *
                </label>
                <select
                  value={motorData.vehicleClass}
                  onChange={(e) => handleMotorChange('vehicleClass', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PRIVATE_CAR">Private 4-Wheeler Car</option>
                  <option value="TWO_WHEELER">Two-Wheeler / Motorcycle</option>
                  <option value="COMMERCIAL_GOODS">Commercial Goods Carrier</option>
                  <option value="PASSENGER_TAXI">Passenger Carrying Taxi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Detailed Vehicle Specs & IDV Formula */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Technical Specifications & Auto-Calculated IDV
              </h3>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                IRDAI Depreciation Grid
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Make (Manufacturer) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyundai / Maruti Suzuki"
                  value={motorData.make}
                  onChange={(e) => handleMotorChange('make', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Model & Sub-Variant *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Creta SX (O) 1.5 Petrol"
                  value={motorData.model}
                  onChange={(e) => handleMotorChange('model', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Engine Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="G4FLM891240"
                  value={motorData.engineNo}
                  onChange={(e) => handleMotorChange('engineNo', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
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
                  value={motorData.chassisNo}
                  onChange={(e) => handleMotorChange('chassisNo', e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Engine CC & Fuel Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="1497"
                    value={motorData.cubicCapacity}
                    onChange={(e) => handleMotorChange('cubicCapacity', e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <select
                    value={motorData.fuelType}
                    onChange={(e) => handleMotorChange('fuelType', e.target.value)}
                    className="w-full px-2 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG_COMPANY">CNG</option>
                    <option value="EV">Electric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Year of Manufacture
                </label>
                <select
                  value={motorData.mfgYear}
                  onChange={(e) => handleMotorChange('mfgYear', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="2024">2024 (Brand New)</option>
                  <option value="2023">2023 (1 Year Old)</option>
                  <option value="2022">2022 (2 Years Old)</option>
                  <option value="2021">2021 (3 Years Old)</option>
                  <option value="2020">2020 (4 Years Old)</option>
                  <option value="2019">2019 (5 Years Old)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Showroom Invoice Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="1000000"
                  value={motorData.invoicePrice}
                  onChange={(e) => handleMotorChange('invoicePrice', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              {/* Auto-Calculated IDV Output Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200/80 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Auto-Calculated IDV (-{motorData.depPercent || 15}%)
                </span>
                <span className="text-xl font-black text-indigo-950 mt-0.5">
                  ₹{(motorData.calculatedIdv || 850000).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-indigo-600">Insured Declared Value</span>
              </div>
            </div>
          </div>

          {/* Previous Policy & NCB Rollover */}
          {motorData.policyNature !== 'NEW_VEHICLE' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Previous Policy & No Claim Bonus (NCB) History
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Previous Policy Number
                  </label>
                  <input
                    type="text"
                    placeholder="POL-2023-998821"
                    value={motorData.prevPolicyNo}
                    onChange={(e) => handleMotorChange('prevPolicyNo', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Previous Insurer
                  </label>
                  <select
                    value={motorData.prevInsurerId}
                    onChange={(e) => handleMotorChange('prevInsurerId', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {partners.filter((p) => p.motorSupported).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Claim in Previous Term?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleMotorChange('hasPreviousClaim', false);
                        handleMotorChange('ncbPercentage', 25);
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        !motorData.hasPreviousClaim
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      No Claim (Eligible)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleMotorChange('hasPreviousClaim', true);
                        handleMotorChange('ncbPercentage', 0);
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        motorData.hasPreviousClaim
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Claimed (0% NCB)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Applicable NCB Discount %
                  </label>
                  <select
                    disabled={motorData.hasPreviousClaim}
                    value={motorData.ncbPercentage}
                    onChange={(e) => handleMotorChange('ncbPercentage', Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value={0}>0% (New / Claimed)</option>
                    <option value={20}>20% (1 Claim-Free Year)</option>
                    <option value={25}>25% (2 Claim-Free Years)</option>
                    <option value={35}>35% (3 Claim-Free Years)</option>
                    <option value={45}>45% (4 Claim-Free Years)</option>
                    <option value={50}>50% Maximum Discount</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PATH B: HEALTH INSURANCE MEMBERS DYNAMIC CARDS */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Insured Family Members & Demographics
                </h3>
                <p className="text-xs text-slate-400">Add dynamic member profiles with automatic Age and BMI calculations</p>
              </div>

              {/* Quick Add Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => addHealthMember('SPOUSE')}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Spouse
                </button>
                <button
                  type="button"
                  onClick={() => addHealthMember('CHILD')}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Child
                </button>
                <button
                  type="button"
                  onClick={() => addHealthMember('FATHER')}
                  className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Parent
                </button>
              </div>
            </div>

            {/* Dynamic Member Cards List */}
            <div className="space-y-4 mt-4">
              {healthMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-900 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                        Member #{index + 1}: {member.relation}
                      </span>
                    </div>

                    {healthMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHealthMember(member.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50 cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Member Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Name as per Aadhaar"
                        value={member.memberName}
                        onChange={(e) => updateHealthMember(member.id, 'memberName', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Relation
                      </label>
                      <select
                        value={member.relation}
                        onChange={(e) => updateHealthMember(member.id, 'relation', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="SELF">Proposer (Self)</option>
                        <option value="SPOUSE">Spouse</option>
                        <option value="SON">Son</option>
                        <option value="DAUGHTER">Daughter</option>
                        <option value="FATHER">Father</option>
                        <option value="MOTHER">Mother</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={member.dob}
                        onChange={(e) => updateHealthMember(member.id, 'dob', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Age (Auto)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${member.age} Yrs`}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg bg-slate-100 font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Gender
                      </label>
                      <select
                        value={member.gender}
                        onChange={(e) => updateHealthMember(member.id, 'gender', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="TRANSGENDER">Transgender</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="170"
                        value={member.heightCm}
                        onChange={(e) => updateHealthMember(member.id, 'heightCm', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        placeholder="68"
                        value={member.weightKg}
                        onChange={(e) => updateHealthMember(member.id, 'weightKg', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        BMI (Auto)
                      </label>
                      <span className={`inline-block w-full text-center px-3 py-1.5 text-xs font-black rounded-lg border ${
                        member.bmi > 28 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {member.bmi || 23.5}
                      </span>
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Occupation / Employment
                      </label>
                      <select
                        value={member.occupation}
                        onChange={(e) => updateHealthMember(member.id, 'occupation', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="SALARIED">Salaried Employee</option>
                        <option value="BUSINESS">Business / Self Employed</option>
                        <option value="PROFESSIONAL">Doctor / Lawyer / CA</option>
                        <option value="HOMEMAKER">Homemaker</option>
                        <option value="STUDENT">Student</option>
                        <option value="RETIRED">Retired</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="lg" icon={ArrowLeft} onClick={onPrev}>
          Back to Customer KYC
        </Button>
        <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" type="submit">
          Proceed to Step 3: Coverage & Add-ons
        </Button>
      </div>
    </form>
  );
}

export default Step2AssetMembers;
