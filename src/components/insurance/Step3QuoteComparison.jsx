import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Award, Star } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export function Step3QuoteComparison({
  partners,
  selectedCompanyIds,
  formData,
  onSelectQuote,
  onPrev
}) {
  const [activeAddons, setActiveAddons] = useState({
    zeroDep: true,
    rsa: true,
    engineProtect: true,
    consumables: false,
    tyreSecure: false
  });

  const toggleAddon = (key) => {
    setActiveAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCompanies = partners.filter((p) =>
    selectedCompanyIds.includes(p.id)
  );

  // Compute quote details dynamically
  const quotes = selectedCompanies.map((company, index) => {
    const base = company.baseRate || 7500;
    const zeroDepAdd = activeAddons.zeroDep ? 1800 : 0;
    const rsaAdd = activeAddons.rsa ? 450 : 0;
    const engineAdd = activeAddons.engineProtect ? 1200 : 0;
    const consumablesAdd = activeAddons.consumables ? 600 : 0;
    const tyreAdd = activeAddons.tyreSecure ? 850 : 0;

    const netPremium = base + zeroDepAdd + rsaAdd + engineAdd + consumablesAdd + tyreAdd;
    const gst = Math.round(netPremium * 0.18);
    const finalPremium = netPremium + gst;

    const commissionPercent = parseFloat(company.commissionRate) || 15;
    const brokerEarnings = Math.round((netPremium * commissionPercent) / 100);

    return {
      company,
      netPremium,
      gst,
      finalPremium,
      brokerEarnings,
      isBestValue: index === 0,
      isPopular: index === 1
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Add-on Controls Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Configure Policy Add-ons & Coverage Riders
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle add-ons to dynamically recalculate comparison quotes across all {quotes.length} companies.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'zeroDep', label: 'Zero Depreciation (₹1,800)' },
              { id: 'rsa', label: '24x7 Roadside (₹450)' },
              { id: 'engineProtect', label: 'Engine Secure (₹1,200)' },
              { id: 'consumables', label: 'Consumables Cover (₹600)' },
              { id: 'tyreSecure', label: 'Tyre Secure (₹850)' },
            ].map((addon) => (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon.id)}
                className={`text-xs px-3.5 py-2 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAddons[addon.id]
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${activeAddons[addon.id] ? 'opacity-100' : 'opacity-0'}`} />
                {addon.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quotes.map((quote) => {
          const { company, netPremium, gst, finalPremium, brokerEarnings, isBestValue, isPopular } = quote;

          return (
            <div
              key={company.id}
              className={`bg-white rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-xl relative overflow-hidden ${
                isBestValue
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Dual-Color Highlight Ribbons */}
              {isBestValue && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-extrabold py-1.5 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-1 shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  Recommended Best Value
                </div>
              )}
              {isPopular && !isBestValue && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-extrabold py-1.5 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5" />
                  Highest Claim Settlement
                </div>
              )}

              <div className="p-6">
                {/* Brand & Type */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl ${company.logoBg} text-white flex items-center justify-center font-black text-xs shadow-xs`}
                  >
                    {company.code}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      {company.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{company.type}</p>
                  </div>
                </div>

                {/* Final Premium Box with Dual-Color Background */}
                <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-4 rounded-xl border border-slate-200/70 mb-5 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Final Payable Premium (incl. 18% GST)
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      ₹{finalPremium.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ year</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Net: ₹{netPremium.toLocaleString('en-IN')}</span>
                    <span>GST (18%): ₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-2.5 text-xs text-slate-600 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cashless Network</span>
                    <span className="font-bold text-slate-800">{company.networkCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Claim Settlement (IRDAI)</span>
                    <span className="font-extrabold text-emerald-600">{company.claimRatio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Broker Commission</span>
                    <span className="font-extrabold text-indigo-700">
                      {company.commissionRate} (₹{brokerEarnings.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Settlement Workflow</span>
                    <span className="font-semibold text-slate-700">Digital / Spot Survey</span>
                  </div>
                </div>

                {/* Inclusion Badges */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                  {activeAddons.zeroDep && (
                    <Badge variant="info" size="sm">Zero Dep Included</Badge>
                  )}
                  {activeAddons.rsa && (
                    <Badge variant="success" size="sm">24x7 Roadside</Badge>
                  )}
                  {activeAddons.engineProtect && (
                    <Badge variant="neutral" size="sm">Engine Secure</Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                <Button
                  variant={isBestValue ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => onSelectQuote({ ...quote, activeAddons })}
                  className="w-full justify-center"
                >
                  Select Quote & Issue Policy
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Back button */}
      <div className="flex justify-start pt-2">
        <Button
          variant="outline"
          size="lg"
          icon={ArrowLeft}
          onClick={onPrev}
        >
          Modify Selected Companies
        </Button>
      </div>
    </div>
  );
}

export default Step3QuoteComparison;
