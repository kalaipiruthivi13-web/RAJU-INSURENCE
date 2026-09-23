import React, { useState } from 'react';
import {
  CheckCircle2,
  FileUp,
  Mail,
  Send,
  Printer,
  ShieldCheck,
  ArrowLeft,
  FileCheck
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export function Step4PolicyReceipt({
  formData,
  selectedQuote,
  onConfirmPolicy,
  onPrev
}) {
  const [uploadedFiles, setUploadedFiles] = useState([
    'RC_Book_Copy_Front_Back.pdf',
    'Previous_Policy_NCB_Proof.pdf'
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSimulateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setUploadedFiles((prev) => [...prev, file.name]);
        setIsUploading(false);
      }, 500);
    }
  };

  const handleSendSms = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  };

  const handleSendEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const expiryStr = nextYear.toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Dual-Color Gradient */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-6 rounded-2xl flex items-center gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-emerald-950">
            Quotation Finalized: {selectedQuote.company.name}
          </h3>
          <p className="text-xs text-emerald-700 mt-0.5">
            Attach client documents, preview official brokerage certificate, and issue policy instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: KYC Docs Upload */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileUp className="w-4 h-4 text-indigo-600" />
            Upload KYC Documents
          </h4>

          {/* Drag & drop box */}
          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30">
            <input
              type="file"
              onChange={handleSimulateUpload}
              className="sr-only"
            />
            <FileUp className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-700">
              Click to browse or drop RC / Aadhaar
            </p>
            <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
          </label>

          {/* Uploaded checklist */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 block">Attached Documents:</span>
            {uploadedFiles.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate font-medium">{doc}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified
                </span>
              </div>
            ))}
          </div>

          {/* Communication triggers */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Auto-Notification Triggers:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSendSms}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  smsSent
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                {smsSent ? 'SMS Sent!' : 'Send SMS'}
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  emailSent
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                {emailSent ? 'Email Sent!' : 'Send Email'}
              </button>
            </div>
            {(smsSent || emailSent) && (
              <p className="text-[11px] font-semibold text-emerald-700 text-center animate-in fade-in">
                Receipt dispatch notification triggered to client successfully!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Official Policy Receipt Preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-7 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Receipt Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">RAJU VENDOR</h3>
                    <Badge variant="primary" size="sm">Official Receipt</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    IRDAI Broker License: IRDA/DB-784/21 • Multi-Company Portal
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Date of Issue</span>
                <span className="text-xs font-bold text-slate-800 font-mono">{todayStr}</span>
              </div>
            </div>

            {/* Policy & Client Details Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Insured Client</span>
                <span className="font-bold text-slate-900 text-sm">{formData.clientName}</span>
                <span className="text-slate-500 text-[11px] block">{formData.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Underwriting Insurer</span>
                <span className="font-bold text-indigo-900 text-sm">{selectedQuote.company.name}</span>
                <span className="text-slate-500 text-[11px] block">Partner Code: {selectedQuote.company.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Coverage Period</span>
                <span className="font-bold text-slate-800">{todayStr} to {expiryStr}</span>
                <span className="text-emerald-600 text-[11px] font-semibold block">1 Year Comprehensive</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Asset / Spec</span>
                <span className="font-bold text-slate-800 font-mono">
                  {formData.vehicleNumber || 'Family Health Plan'}
                </span>
                <span className="text-slate-500 text-[11px] block">
                  {formData.vehicleModel || `Age: ${formData.eldestAge} Yrs`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cashless Network</span>
                <span className="font-bold text-slate-800">{selectedQuote.company.networkCount}</span>
                <span className="text-slate-500 text-[11px] block">Toll-free: {selectedQuote.company.helpline}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Broker Payout Slab</span>
                <span className="font-bold text-emerald-700">{selectedQuote.company.commissionRate}</span>
                <span className="text-slate-500 text-[11px] block">Direct agency credit</span>
              </div>
            </div>

            {/* Premium Computation Breakup Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100/80 px-4 py-2 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Premium Accounting Summary
              </div>
              <div className="divide-y divide-slate-100 p-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Net Own Damage / Health Premium</span>
                  <span className="font-semibold">₹{selectedQuote.netPremium.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5">
                  <span>Integrated GST (18%)</span>
                  <span className="font-semibold">₹{selectedQuote.gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2">
                  <span>Total Premium Paid by Client</span>
                  <span className="text-lg font-black text-indigo-900">
                    ₹{selectedQuote.finalPremium.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              icon={ArrowLeft}
              onClick={onPrev}
            >
              Modify Quote Selection
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Receipt
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle2}
                onClick={() => onConfirmPolicy(expiryStr)}
              >
                Confirm & Issue Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step4PolicyReceipt;
