import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Button from '../ui/Button';

export function Step2CompanySelector({
  partners,
  selectedCompanyIds,
  setSelectedCompanyIds,
  insuranceType,
  onNext,
  onPrev
}) {
  const filteredPartners = partners.filter((p) => {
    if (insuranceType === 'motor') return p.motorSupported;
    if (insuranceType === 'health') return p.healthSupported;
    return true;
  });

  const toggleSelect = (id) => {
    if (selectedCompanyIds.includes(id)) {
      setSelectedCompanyIds(selectedCompanyIds.filter((item) => item !== id));
    } else {
      setSelectedCompanyIds([...selectedCompanyIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCompanyIds.length === filteredPartners.length) {
      setSelectedCompanyIds([]);
    } else {
      setSelectedCompanyIds(filteredPartners.map((p) => p.id));
    }
  };

  const handleSelectTop4 = () => {
    const top4 = filteredPartners.slice(0, 4).map((p) => p.id);
    setSelectedCompanyIds(top4);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Select Insurance Companies for Quotation Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose preferred insurers from our 15 licensed partners to generate side-by-side comparative quotes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSelectTop4}
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200/80 transition-colors cursor-pointer"
          >
            Select Top 4 Recommended
          </button>
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            {selectedCompanyIds.length === filteredPartners.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Grid of Partner Companies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPartners.map((company) => {
          const isSelected = selectedCompanyIds.includes(company.id);

          return (
            <div
              key={company.id}
              onClick={() => toggleSelect(company.id)}
              className={`p-5 rounded-2xl border-2 transition-all duration-150 cursor-pointer select-none relative flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-gradient-to-tr from-blue-50/60 to-indigo-50/60 shadow-sm ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Top Row: Logo Badge & Checkbox */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl ${company.logoBg} text-white flex items-center justify-center font-black text-xs tracking-wider shadow-xs`}
                  >
                    {company.code}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {company.name}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      {company.type}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'border-slate-300 bg-slate-50 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Stats & Broker Payout */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Claim Settlement</span>
                  <span className="font-bold text-emerald-600">{company.claimRatio}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Cashless Network</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {company.networkCount}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Broker Payout</span>
                  <span className="font-bold text-indigo-700 flex items-center gap-0.5">
                    {company.commissionRate}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Helpline</span>
                  <span className="font-mono text-slate-600 text-[10px] truncate block">
                    {company.helpline}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="lg"
          icon={ArrowLeft}
          onClick={onPrev}
        >
          Back to Client Details
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">
            {selectedCompanyIds.length} of {filteredPartners.length} companies selected
          </span>
          <Button
            variant="primary"
            size="lg"
            disabled={selectedCompanyIds.length === 0}
            icon={ArrowRight}
            iconPosition="right"
            onClick={onNext}
          >
            Generate Comparison Matrix ({selectedCompanyIds.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Step2CompanySelector;
