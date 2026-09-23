import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sliders,
  TrendingDown,
  Sparkles,
  Percent,
  Info
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export function Step5QuoteComparison({
  partners,
  selectedCompanyIds,
  insuranceCategory,
  motorData,
  motorAddons,
  healthCoverage,
  onSelectQuote,
  onPrev
}) {
  const [activeView, setActiveView] = useState('CARDS'); // 'CARDS' | 'TABLE'

  // Calculate dynamic quotes for selected companies
  const generatedQuotes = selectedCompanyIds.map((cid, index) => {
    const partner = partners.find((p) => p.id === cid) || partners[0];

    if (insuranceCategory === 'MOTOR') {
      const idv = Number(motorData.calculatedIdv) || 850000;
      // OD rate varies slightly by insurer (between 1.1% to 1.35%)
      const odRate = 0.011 + (index % 4) * 0.0008;
      const basicOd = Math.round(idv * odRate);

      // TP statutory rate (1497cc = ₹3416 standard)
      const tpRate = 3416;

      // Addons calculation
      let addonsSum = 0;
      if (motorAddons.addonZeroDep) addonsSum += Math.round(idv * 0.0045);
      if (motorAddons.addonEngineProtect) addonsSum += 1200;
      if (motorAddons.addonRsa) addonsSum += 499;
      if (motorAddons.addonRti) addonsSum += Math.round(idv * 0.002);
      if (motorAddons.addonConsumables) addonsSum += 850;
      if (motorAddons.addonKeyReplace) addonsSum += 450;
      if (motorAddons.addonTyreSecure) addonsSum += 1100;
      if (motorAddons.paOwnerDriver) addonsSum += 375;

      // NCB discount
      const ncbPct = Number(motorData.ncbPercentage) || 0;
      const ncbDiscount = Math.round((basicOd * ncbPct) / 100);

      const netTaxable = basicOd + tpRate + addonsSum - ncbDiscount;
      const gst = Math.round(netTaxable * 0.18);
      const finalPremium = netTaxable + gst;

      // Broker commission rate (15% to 17.5% on OD)
      const commRate = 0.15 + (index % 3) * 0.01;
      const brokerEarning = Math.round((basicOd + addonsSum - ncbDiscount) * commRate);

      return {
        id: `QT-${cid}-${Date.now().toString().slice(-4)}`,
        company: partner,
        idvOffered: idv,
        basicOd,
        tpRate,
        addonsSum,
        ncbPct,
        ncbDiscount,
        netTaxable,
        gst,
        finalPremium,
        commRate: Math.round(commRate * 100),
        brokerEarning,
        claimRatio: partner.claimSettlementRatio,
        networkCount: partner.cashlessNetwork,
        isBestValue: index === 0,
        isLowest: index === 1
      };
    } else {
      // HEALTH QUOTE CALCULATION
      const sumInsured = Number(healthCoverage.sumInsured) || 1000000;
      const baseHealthRate = 0.014 + (index % 4) * 0.001;
      const basePremium = Math.round(sumInsured * baseHealthRate);

      let ridersSum = 0;
      if (healthCoverage.riderMaternity) ridersSum += 4500;
      if (healthCoverage.riderCriticalIllness) ridersSum += 3200;
      if (healthCoverage.riderHospitalCash) ridersSum += 1100;

      // Copay discount
      let copayDiscount = 0;
      if (healthCoverage.copayPreference === '10_PERCENT') copayDiscount = Math.round(basePremium * 0.15);
      if (healthCoverage.copayPreference === '20_PERCENT') copayDiscount = Math.round(basePremium * 0.25);

      const netTaxable = basePremium + ridersSum - copayDiscount;
      const gst = Math.round(netTaxable * 0.18);
      const finalPremium = netTaxable + gst;

      const commRate = 0.15;
      const brokerEarning = Math.round(netTaxable * commRate);

      return {
        id: `QT-${cid}-${Date.now().toString().slice(-4)}`,
        company: partner,
        idvOffered: sumInsured,
        basicOd: basePremium,
        tpRate: 0,
        addonsSum: ridersSum,
        ncbPct: 0,
        ncbDiscount: copayDiscount,
        netTaxable,
        gst,
        finalPremium,
        commRate: 15,
        brokerEarning,
        claimRatio: partner.claimSettlementRatio,
        networkCount: partner.cashlessNetwork,
        isBestValue: index === 0,
        isLowest: index === 1
      };
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Controls & Layout Switcher */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Comparative Quotations Engine
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
              {generatedQuotes.length} Real-Time Quotes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare official IRDAI-compliant premium breakups, garage networks, and brokerage margins side-by-side.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView('CARDS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeView === 'CARDS'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Highlighted Cards
          </button>
          <button
            type="button"
            onClick={() => setActiveView('TABLE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeView === 'TABLE'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Detailed Comparison Table
          </button>
        </div>
      </div>

      {/* VIEW A: CARDS GRID (Top 3 Highlighted + Remaining) */}
      {activeView === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedQuotes.map((quote) => (
            <div
              key={quote.id}
              className={`rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden relative ${
                quote.isBestValue
                  ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-500/20 bg-white'
                  : quote.isLowest
                  ? 'border-emerald-500 shadow-md bg-white'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Highlight Badges */}
              {quote.isBestValue && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase text-center py-1 tracking-wider flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Best Overall Value (Broker Recommended)
                </div>
              )}
              {quote.isLowest && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black uppercase text-center py-1 tracking-wider flex items-center justify-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Lowest Premium Rate
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* Insurer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-base font-black text-slate-900">{quote.company.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Claim Ratio: {quote.claimRatio} • {quote.networkCount}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-indigo-900">
                    {quote.company.shortName.substring(0, 3)}
                  </div>
                </div>

                {/* Main Premium Display */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Payable Premium (Incl. 18% GST)
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    ₹{quote.finalPremium.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Net: ₹{quote.netTaxable.toLocaleString('en-IN')} + GST: ₹{quote.gst.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Financial Breakup List */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>{insuranceCategory === 'MOTOR' ? 'Insured Declared Value (IDV)' : 'Sum Insured'}</span>
                    <span className="font-bold text-slate-800">₹{quote.idvOffered.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>{insuranceCategory === 'MOTOR' ? 'Basic OD Premium' : 'Base Medical Premium'}</span>
                    <span className="font-semibold text-slate-800">₹{quote.basicOd.toLocaleString('en-IN')}</span>
                  </div>

                  {insuranceCategory === 'MOTOR' && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Statutory Third Party (TP)</span>
                      <span className="font-semibold text-slate-800">₹{quote.tpRate.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>{insuranceCategory === 'MOTOR' ? 'Selected Add-on Bundles' : 'Optional Riders'}</span>
                    <span className="font-semibold text-slate-800">₹{quote.addonsSum.toLocaleString('en-IN')}</span>
                  </div>

                  {quote.ncbDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span>{insuranceCategory === 'MOTOR' ? `Less: NCB Discount (${quote.ncbPct}%)` : 'Less: Copay Discount'}</span>
                      <span>- ₹{quote.ncbDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Broker Commission Strip */}
                <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-700 block">
                      Broker Commission ({quote.commRate}%)
                    </span>
                    <span className="font-extrabold text-indigo-950">
                      ₹{quote.brokerEarning.toLocaleString('en-IN')} Earning
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    IRDA Agency Code
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <Button
                  variant={quote.isBestValue ? 'primary' : 'outline'}
                  size="md"
                  fullWidth
                  icon={CheckCircle}
                  onClick={() => onSelectQuote(quote)}
                >
                  Select & Proceed to Verification
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VIEW B: COMPREHENSIVE COMPARISON TABLE */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-4">Insurer Line Item</th>
                  {generatedQuotes.map((q) => (
                    <th key={q.id} className="p-4 min-w-[200px]">
                      <div>{q.company.shortName}</div>
                      <span className="text-[10px] font-normal text-slate-300">
                        {q.company.licenceType || 'General'}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">
                    {insuranceCategory === 'MOTOR' ? 'Insured Declared Value (IDV)' : 'Sum Insured'}
                  </td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-mono font-bold text-slate-900">
                      ₹{q.idvOffered.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">
                    {insuranceCategory === 'MOTOR' ? 'Basic Own Damage' : 'Base Health Premium'}
                  </td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-mono text-slate-800">
                      ₹{q.basicOd.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                {insuranceCategory === 'MOTOR' && (
                  <tr className="hover:bg-slate-50">
                    <td className="p-4 text-slate-600">Statutory Third Party (TP)</td>
                    {generatedQuotes.map((q) => (
                      <td key={q.id} className="p-4 font-mono text-slate-800">
                        ₹{q.tpRate.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>
                )}

                <tr className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">Add-ons / Riders Total</td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-mono text-slate-800">
                      ₹{q.addonsSum.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50 text-emerald-700 font-semibold">
                  <td className="p-4">Discount (NCB / Copay)</td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-mono">
                      - ₹{q.ncbDiscount.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="p-4">Net Taxable Total</td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-mono text-slate-900">
                      ₹{q.netTaxable.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">GST (18% Statutory)</td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-mono text-slate-800">
                      ₹{q.gst.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 font-black text-indigo-950 text-sm">
                  <td className="p-4">Total Payable Premium</td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-mono text-base text-indigo-900">
                      ₹{q.finalPremium.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">Brokerage Commission</td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-bold text-emerald-700">
                      {q.commRate}% (₹{q.brokerEarning.toLocaleString('en-IN')})
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">Claim Settlement Ratio</td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4 font-semibold text-slate-800">
                      {q.claimRatio}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-4 font-bold text-slate-800">Action</td>
                  {generatedQuotes.map((q) => (
                    <td key={q.id} className="p-4">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => onSelectQuote(q)}
                      >
                        Select Quote
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="lg" icon={ArrowLeft} onClick={onPrev}>
          Back to Partner Eligibility
        </Button>
      </div>
    </div>
  );
}

export default Step5QuoteComparison;
