import React from 'react';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export function Step4PartnerEligibility({
  partners,
  insuranceCategory,
  selectedCompanyIds,
  setSelectedCompanyIds,
  onNext,
  onPrev
}) {
  // Filter eligible partners based on category
  const eligiblePartners = partners.filter((p) =>
    insuranceCategory === 'MOTOR' ? p.motorSupported : p.healthSupported
  );

  const toggleCompany = (id) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCompanyIds.length === eligiblePartners.length) {
      setSelectedCompanyIds([]);
    } else {
      setSelectedCompanyIds(eligiblePartners.map((p) => p.id));
    }
  };

  const handleProceed = () => {
    if (selectedCompanyIds.length === 0) {
      alert('Please select at least one insurance partner company to generate quotations.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview & Quick Select Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Underwriting Appetite & Partner Eligibility Filter
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {eligiblePartners.length} of 15 Eligible
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matching risk criteria against licensed underwriting parameters across public and private sector insurers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedCompanyIds.length === eligiblePartners.length
              ? 'Deselect All'
              : `Select All (${eligiblePartners.length})`}
          </Button>
        </div>
      </div>

      {/* Grid of 15 Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eligiblePartners.map((partner) => {
          const isSelected = selectedCompanyIds.includes(partner.id);

          return (
            <div
              key={partner.id}
              onClick={() => toggleCompany(partner.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-gradient-to-br from-white to-indigo-50/40 shadow-sm ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 opacity-80'
              }`}
            >
              <div>
                {/* Header with Logo Pill & Checkbox */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs ${
                        partner.type === 'PSU'
                          ? 'bg-gradient-to-tr from-amber-600 to-amber-500'
                          : partner.type === 'Standalone Health'
                          ? 'bg-gradient-to-tr from-teal-600 to-cyan-500'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                      }`}
                    >
                      {partner.shortName.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {partner.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {partner.licenceNo || 'IRDAI-LIC-2024'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Badges & Metrics */}
                <div className="grid grid-cols-2 gap-2 my-3 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Claim Ratio (ICR)</span>
                    <span className="text-xs font-black text-slate-800">{partner.claimSettlementRatio}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Cashless Network</span>
                    <span className="text-xs font-black text-slate-800">{partner.cashlessNetwork}</span>
                  </div>
                </div>

                {/* Features Pill */}
                <div className="flex flex-wrap gap-1">
                  {(partner.keyFeatures || ['Instant Policy', 'Fast Claim']).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-indigo-50/70 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Appetite Status */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Underwriting Status:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Instant Eligible
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="lg" icon={ArrowLeft} onClick={onPrev}>
          Back to Coverage & Add-ons
        </Button>
        <Button
          variant="primary"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          onClick={handleProceed}
        >
          Generate Comparative Quotes ({selectedCompanyIds.length} Selected)
        </Button>
      </div>
    </div>
  );
}

export default Step4PartnerEligibility;
