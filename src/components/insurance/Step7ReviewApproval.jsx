import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  User,
  Building,
  Percent,
  AlertTriangle
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export function Step7ReviewApproval({
  customerData,
  insuranceCategory,
  motorData,
  motorAddons,
  healthCoverage,
  healthMembers,
  selectedQuote,
  onNext,
  onPrev
}) {
  const [brokerDiscountPct, setBrokerDiscountPct] = useState(0);
  const [approvalDecision, setApprovalDecision] = useState('APPROVED');
  const [underwriterNotes, setUnderwriterNotes] = useState(
    'Risk profile verified against IRDAI guidelines. All KYC & inspection documents cleared.'
  );

  const baseFinalPremium = selectedQuote ? selectedQuote.finalPremium : 18486;
  const brokerDiscountAmt = Math.round((baseFinalPremium * brokerDiscountPct) / 100);
  const adjustedFinalPremium = baseFinalPremium - brokerDiscountAmt;

  // Underwriting Flags Check
  const exceptionFlags = [];
  if (insuranceCategory === 'MOTOR') {
    if (motorData.calculatedIdv > 1000000) {
      exceptionFlags.push({
        title: 'High IDV Risk (>₹10 Lakhs)',
        level: 'warning',
        desc: 'Requires Principal Broker inspection waiver clearance.'
      });
    }
    if (motorData.hasPreviousClaim) {
      exceptionFlags.push({
        title: 'Adverse Claim History',
        level: 'warning',
        desc: 'Previous claim reset NCB to 0%. Underwriter load applied.'
      });
    }
  } else {
    if (healthCoverage.pedDiabetes || healthCoverage.pedHypertension || healthCoverage.pedHeartCondition) {
      exceptionFlags.push({
        title: 'Pre-Existing Disease (PED) Declared',
        level: 'warning',
        desc: 'Standard 24-36 month waiting period endorsement applies.'
      });
    }
    if (Number(healthCoverage.sumInsured) >= 2500000) {
      exceptionFlags.push({
        title: 'High Sum Insured Medical Cover',
        level: 'info',
        desc: 'Requires Senior Medical Underwriter clearance.'
      });
    }
  }

  const handleProceed = () => {
    onNext({
      adjustedFinalPremium,
      brokerDiscountAmt,
      brokerDiscountPct,
      approvalDecision,
      underwriterNotes
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Underwriting Review & Brokerage Sign-Off
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              IRDA Compliance Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validate client risk profile, evaluate exception flags, and adjust broker margin before triggering payment gateway.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Reviewing Broker</span>
            <span className="text-xs font-black text-slate-900">R. Rajkumar (Principal Broker)</span>
          </div>
        </div>
      </div>

      {/* 2-Column Layout: Summary & Exception Review */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Comprehensive Policy Docket Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Policyholder & Insurer Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Proposal Dossier Summary
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Proposer / Entity</span>
                <span className="font-bold text-slate-900">{customerData.legalName}</span>
                <span className="text-[10px] text-slate-500 block">{customerData.customerType}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Contact Details</span>
                <span className="font-semibold text-slate-800">{customerData.mobile}</span>
                <span className="text-[10px] text-slate-500 block truncate">{customerData.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">PAN / GSTIN</span>
                <span className="font-mono font-bold text-slate-800">{customerData.panNumber}</span>
                {customerData.gstin && (
                  <span className="font-mono text-[10px] text-slate-500 block">{customerData.gstin}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Selected Insurer</span>
                <span className="font-bold text-indigo-900">{selectedQuote?.company?.name}</span>
                <span className="text-[10px] text-slate-500 block">Licence: {selectedQuote?.company?.licenceNo}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Product Line</span>
                <span className="font-semibold text-slate-800">
                  {insuranceCategory === 'MOTOR' ? 'Motor Comprehensive' : 'Health & Mediclaim Floater'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {insuranceCategory === 'MOTOR' ? motorData.regNo : `${healthMembers.length} Family Lives`}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Coverage Value</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  ₹{(selectedQuote?.idvOffered || 850000).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {insuranceCategory === 'MOTOR' ? 'Calculated IDV' : 'Sum Insured'}
                </span>
              </div>
            </div>
          </div>

          {/* Underwriting Exception Flags */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Underwriting Risk Flags</span>
              <span className="text-[11px] font-bold text-slate-500">
                {exceptionFlags.length === 0 ? 'No Critical Flags' : `${exceptionFlags.length} Flags Detected`}
              </span>
            </h4>

            {exceptionFlags.length === 0 ? (
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Standard Risk Profile Cleared</p>
                  <p className="text-[11px] text-emerald-700">
                    No adverse claim history or high-risk medical declarations. Eligible for instant binding.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {exceptionFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-950">{flag.title}</h5>
                      <p className="text-[11px] text-amber-800 mt-0.5">{flag.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Broker Margin & Manager Sign-Off */}
        <div className="space-y-6">
          {/* Brokerage Margin Adjustment */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Broker Margin Adjustment
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pass-Through Broker Discount (%)
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={brokerDiscountPct}
                    onChange={(e) => setBrokerDiscountPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0}>0% (Retain Full Brokerage)</option>
                    <option value={2}>2% Client Courtesy Discount</option>
                    <option value={3}>3% Preferred Client Discount</option>
                    <option value={5}>5% Maximum Allowed Override</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Premium:</span>
                  <span className="font-mono font-semibold">₹{baseFinalPremium.toLocaleString('en-IN')}</span>
                </div>
                {brokerDiscountAmt > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Broker Discount ({brokerDiscountPct}%):</span>
                    <span className="font-mono">- ₹{brokerDiscountAmt.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-indigo-950 pt-1 border-t border-slate-200 text-sm">
                  <span>Payable Premium:</span>
                  <span className="font-mono text-base">₹{adjustedFinalPremium.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Underwriting Sign-Off Action */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Manager Sign-Off Decision
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approval Decision</label>
                <select
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="APPROVED">Approved for Binding & Payment</option>
                  <option value="APPROVED_WITH_TERMS">Approved with Endorsements</option>
                  <option value="COUNTER_OFFER">Counter-Offer Revised Premium</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Underwriter Audit Notes</label>
                <textarea
                  rows={3}
                  value={underwriterNotes}
                  onChange={(e) => setUnderwriterNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="lg" icon={ArrowLeft} onClick={onPrev}>
          Back to Document Upload
        </Button>
        <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" onClick={handleProceed}>
          Approve & Proceed to Step 8: Payment & Issuance
        </Button>
      </div>
    </div>
  );
}

export default Step7ReviewApproval;
