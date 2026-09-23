import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Send,
  CreditCard,
  QrCode,
  Building,
  Smartphone,
  ShieldCheck,
  FileCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export function Step8PaymentIssuance({
  customerData,
  insuranceCategory,
  motorData,
  healthCoverage,
  healthMembers,
  selectedQuote,
  reviewData,
  onConfirmPolicy,
  onPrev
}) {
  const [paymentMode, setPaymentMode] = useState('GATEWAY'); // 'GATEWAY' | 'LINK' | 'UPI' | 'CD_ACCOUNT'
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // 'PENDING' | 'PROCESSING' | 'SUCCESS'
  const [issuedPolicy, setIssuedPolicy] = useState(null);

  const payableAmount = reviewData?.adjustedFinalPremium || selectedQuote?.finalPremium || 18486;

  const handleProcessPayment = () => {
    setPaymentStatus('PROCESSING');

    setTimeout(() => {
      const generatedPolicyNo = `POL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const utr = `UTR-${Date.now().toString().slice(-8)}`;

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      const expiryStr = expiryDate.toISOString().split('T')[0];

      const policyRecord = {
        policyNo: generatedPolicyNo,
        txnId,
        utr,
        expiryDate: expiryStr,
        amountPaid: payableAmount,
        carrierName: selectedQuote?.company?.name || 'HDFC ERGO General Insurance',
        clientName: customerData.legalName,
        issuedAt: new Date().toLocaleString()
      };

      setIssuedPolicy(policyRecord);
      setPaymentStatus('SUCCESS');

      // Call context to persist
      onConfirmPolicy({
        policyNo: generatedPolicyNo,
        expiryStr,
        payableAmount,
        txnId,
        utr
      });
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {paymentStatus !== 'SUCCESS' ? (
        /* BEFORE PAYMENT EXECUTION */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Payment Gateway & Real-Time Policy Issuance
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Ready for Binding
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select settlement method to bind policy directly on {selectedQuote?.company?.name} carrier portal.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Net Payable</span>
              <span className="text-2xl font-black text-indigo-950">
                ₹{payableAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'GATEWAY',
                name: 'Carrier Gateway',
                desc: 'Instant Netbanking / Card via Insurer API',
                icon: CreditCard
              },
              {
                id: 'UPI',
                name: 'Instant UPI QR',
                desc: 'Scan with Google Pay, PhonePe, or Paytm',
                icon: QrCode
              },
              {
                id: 'LINK',
                name: 'Client Payment Link',
                desc: 'SMS & WhatsApp payment link to customer',
                icon: Smartphone
              },
              {
                id: 'CD_ACCOUNT',
                name: 'Agency Float / CD Ledger',
                desc: 'Debit from RAJU VENDOR Cash Deposit account',
                icon: Building
              }
            ].map((method) => {
              const isSelected = paymentMode === method.id;
              const Icon = method.icon;

              return (
                <div
                  key={method.id}
                  onClick={() => setPaymentMode(method.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-gradient-to-br from-white to-indigo-50/50 shadow-sm ring-1 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{method.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{method.desc}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Method Details Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            {paymentMode === 'GATEWAY' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Direct Insurer Payment Gateway Integration</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Redirects to {selectedQuote?.company?.name} secure gateway with tokenized brokerage credentials.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  icon={ShieldCheck}
                  disabled={paymentStatus === 'PROCESSING'}
                  onClick={handleProcessPayment}
                >
                  {paymentStatus === 'PROCESSING' ? 'Processing Transaction...' : `Pay ₹${payableAmount.toLocaleString('en-IN')} & Issue Policy`}
                </Button>
              </div>
            )}

            {paymentMode === 'UPI' && (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 p-2 border-2 border-indigo-500/30 shadow-md">
                  <QrCode className="w-24 h-24 text-white" />
                </div>
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-slate-900">Dynamic UPI Merchant QR Code</h4>
                  <p className="text-xs text-slate-500">
                    UPI VPA: <span className="font-mono font-bold text-slate-800">rajuvendor.irda@icici</span> • Amount: ₹{payableAmount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Scan using any UPI App. System auto-reconciles settlement via webhooks within 5 seconds.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      disabled={paymentStatus === 'PROCESSING'}
                      onClick={handleProcessPayment}
                    >
                      {paymentStatus === 'PROCESSING' ? 'Verifying UPI Callback...' : 'Simulate UPI Payment Success'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {paymentMode === 'LINK' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Send Payment Link via SMS & WhatsApp</h4>
                <p className="text-xs text-slate-500">
                  Dispatch an encrypted payment link directly to customer mobile ({customerData.mobile}) and email ({customerData.email}).
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <Button variant="outline" size="sm" icon={Send}>
                    Trigger WhatsApp Link
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={paymentStatus === 'PROCESSING'}
                    onClick={handleProcessPayment}
                  >
                    Simulate Client Completed Payment
                  </Button>
                </div>
              </div>
            )}

            {paymentMode === 'CD_ACCOUNT' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">RAJU VENDOR CD Float Ledger</h4>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Available Float: ₹4,85,000
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Instant balance deduction from agency deposit maintained with {selectedQuote?.company?.name}.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    disabled={paymentStatus === 'PROCESSING'}
                    onClick={handleProcessPayment}
                  >
                    Authorize Float Debit & Issue
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="lg" icon={ArrowLeft} onClick={onPrev}>
              Back to Underwriting Review
            </Button>
          </div>
        </div>
      ) : (
        /* AFTER PAYMENT SUCCESS: POLICY RECEIPT & DISPATCH CARD */
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-6 text-center max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
              Transaction Successful & Policy Bound
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Policy #{issuedPolicy?.policyNo}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official IRDAI-compliant insurance policy contract generated via {issuedPolicy?.carrierName}.
            </p>
          </div>

          {/* Policy Certificate Grid */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-left grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Policyholder Name</span>
              <span className="font-bold text-slate-900">{customerData.legalName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Insurance Partner</span>
              <span className="font-bold text-indigo-900">{issuedPolicy?.carrierName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Premium Paid</span>
              <span className="font-mono font-bold text-emerald-700">
                ₹{issuedPolicy?.amountPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bank UTR / Ref No</span>
              <span className="font-mono font-bold text-slate-800">{issuedPolicy?.utr}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Coverage Expiry Date</span>
              <span className="font-semibold text-slate-800">{issuedPolicy?.expiryDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Dispatch Status</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> WhatsApp & Email Sent
              </span>
            </div>
          </div>

          {/* Post Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={() => alert('Downloading official IRDAI Policy Schedule PDF...')}
            >
              Download Policy Schedule
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={RefreshCw}
              onClick={() => window.location.reload()}
            >
              Issue Another Policy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step8PaymentIssuance;
