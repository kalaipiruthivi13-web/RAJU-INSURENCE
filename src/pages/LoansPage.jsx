import React, { useState } from 'react';
import {
  Coins,
  Plus,
  ArrowDownLeft,
  Calendar,
  Printer,
  Calculator
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export function LoansPage() {
  const {
    loans,
    addLoan,
    addLoanCreditPayment,
    accrue30DayInterest,
    globalSearch
  } = useAppData();

  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id || null);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  const [newLoanForm, setNewLoanForm] = useState({
    clientName: 'K. Balakrishnan (Transport)',
    phone: '+91 94433 11223',
    guarantorName: 'M. Sivalingam',
    principalAmount: '150000',
    monthlyRatePercent: '2.0',
    issueDate: new Date().toISOString().split('T')[0]
  });

  const [creditForm, setCreditForm] = useState({
    amount: '',
    particulars: 'Client Cash / UPI Credit Payment'
  });

  const selectedLoan = loans.find((l) => l.id === selectedLoanId) || loans[0];

  const currentBalance = selectedLoan
    ? selectedLoan.ledger[selectedLoan.ledger.length - 1]?.balance || selectedLoan.principalAmount
    : 0;

  const preview30DayInterest = selectedLoan
    ? Math.round(currentBalance * (selectedLoan.monthlyRatePercent / 100))
    : 0;

  const handleCreateLoan = (e) => {
    e.preventDefault();
    const created = addLoan({
      ...newLoanForm,
      principalAmount: Number(newLoanForm.principalAmount),
      monthlyRatePercent: Number(newLoanForm.monthlyRatePercent)
    });
    setSelectedLoanId(created.id);
    setShowNewLoanModal(false);
  };

  const handleApplyCreditPayment = (e) => {
    e.preventDefault();
    if (!creditForm.amount || Number(creditForm.amount) <= 0) return;

    addLoanCreditPayment(selectedLoan.id, {
      amount: creditForm.amount,
      particulars: creditForm.particulars
    });
    setCreditForm({ amount: '', particulars: 'Client Cash / UPI Credit Payment' });
    setShowCreditModal(false);
  };

  const filteredLoans = loans.filter((l) => {
    if (!globalSearch) return true;
    const term = globalSearch.toLowerCase();
    return (
      l.clientName.toLowerCase().includes(term) ||
      l.id.toLowerCase().includes(term) ||
      l.phone.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Personal Loan & 30-Day Interest Ledger
            </h1>
            <Badge variant="primary" size="sm">Interest Ledger Management</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated 30-Day interest calculation and credit deduction logic to track principal and interest balances in real-time.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowNewLoanModal(true)}
        >
          Issue New Personal Loan
        </Button>
      </div>

      {/* Selected Loan Details & Ledger Banner */}
      {selectedLoan && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-7 space-y-6">
          {/* Top Summary Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/60">
                  {selectedLoan.id}
                </span>
                <Badge variant={selectedLoan.status === 'Active' ? 'active' : 'neutral'} size="sm" dot>
                  {selectedLoan.status}
                </Badge>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {selectedLoan.clientName}
              </h3>
              <p className="text-xs text-slate-500">
                Phone: {selectedLoan.phone} • Guarantor: {selectedLoan.guarantorName} • Issued: {selectedLoan.issueDate}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Ledger
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Calculator}
                onClick={() => accrue30DayInterest(selectedLoan.id)}
                title="Accrue next 30 days interest"
              >
                + Accrue 30-Day Interest
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={ArrowDownLeft}
                onClick={() => setShowCreditModal(true)}
              >
                Record Credit Payment (Minus)
              </Button>
            </div>
          </div>

          {/* 3 Metric Cards for this Loan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-500 block">Original Principal Disbursed</span>
              <span className="text-2xl font-black text-slate-900 mt-1.5 block">
                ₹{selectedLoan.principalAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400">Fixed rate: {selectedLoan.monthlyRatePercent}% per 30 days</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <span className="text-xs text-amber-700 block font-bold">30-Day Accrued Interest</span>
              <span className="text-2xl font-black text-amber-900 mt-1.5 block">
                ₹{preview30DayInterest.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-amber-700">Calculated on current balance</span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200/80">
              <span className="text-xs text-indigo-700 block font-bold">Current Outstanding Balance</span>
              <span className="text-2xl font-black text-indigo-950 mt-1.5 block">
                ₹{currentBalance.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-indigo-600 font-medium">Principal + Unpaid Interest</span>
            </div>
          </div>

          {/* Dynamic 30-Day Loan Ledger Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                30-Day Interest Ledger & Credit Statement
              </h4>
              <span className="text-xs font-bold text-slate-400">
                {selectedLoan.ledger.length} Transaction Entries
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Particulars</th>
                    <th className="py-3 px-3.5 text-right">Debit (+)</th>
                    <th className="py-3 px-3.5 text-right">Interest (+)</th>
                    <th className="py-3 px-3.5 text-right">Credit Minus (-)</th>
                    <th className="py-3 px-3.5 text-right">Final Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedLoan.ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-slate-800">
                        {entry.particulars}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono text-slate-700">
                        {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono text-amber-700 font-bold">
                        {entry.interestAccrued > 0 ? `+₹${entry.interestAccrued.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono text-emerald-700 font-black">
                        {entry.credit > 0 ? `-₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono font-black text-slate-900 text-sm">
                        ₹{entry.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Loan Accounts Directory */}
      <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          All Client Loan Accounts ({filteredLoans.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredLoans.map((l) => {
            const bal = l.ledger[l.ledger.length - 1]?.balance || l.principalAmount;
            const isSel = l.id === selectedLoanId;

            return (
              <div
                key={l.id}
                onClick={() => setSelectedLoanId(l.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSel
                    ? 'border-indigo-600 bg-gradient-to-tr from-blue-50/50 to-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-900">{l.id}</span>
                  <Badge variant={l.status === 'Active' ? 'active' : 'neutral'} size="sm">
                    {l.status}
                  </Badge>
                </div>
                <p className="font-bold text-slate-900 text-sm mt-2">{l.clientName}</p>
                <p className="text-xs text-slate-500">{l.phone}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Balance Due:</span>
                  <span className="text-base font-black text-slate-900">
                    ₹{bal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Issue New Loan */}
      <Modal
        isOpen={showNewLoanModal}
        onClose={() => setShowNewLoanModal(false)}
        title="Issue New Personal Loan"
        subtitle="Disburse new loan with 30-day interest rate and guarantor record"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowNewLoanModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateLoan}>
              Disburse Loan & Open Ledger
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Full Name *
              </label>
              <input
                type="text"
                required
                value={newLoanForm.clientName}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, clientName: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={newLoanForm.phone}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Guarantor / Surety Name
              </label>
              <input
                type="text"
                value={newLoanForm.guarantorName}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, guarantorName: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Disbursement Date *
              </label>
              <input
                type="date"
                required
                value={newLoanForm.issueDate}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, issueDate: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Principal Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={newLoanForm.principalAmount}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, principalAmount: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Monthly 30-Day Interest Rate % *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newLoanForm.monthlyRatePercent}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, monthlyRatePercent: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL: Record Credit Payment */}
      <Modal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        title="Record Credit Repayment (Credit Minus Logic)"
        subtitle={`Client: ${selectedLoan?.clientName} • Current Bal: ₹${currentBalance.toLocaleString('en-IN')}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowCreditModal(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleApplyCreditPayment}>
              Apply Credit & Reduce Balance
            </Button>
          </>
        }
      >
        <form onSubmit={handleApplyCreditPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Repayment Amount (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 25000"
              value={creditForm.amount}
              onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-600 font-black text-base"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Particulars / Payment Mode
            </label>
            <input
              type="text"
              value={creditForm.particulars}
              onChange={(e) => setCreditForm({ ...creditForm, particulars: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {creditForm.amount && Number(creditForm.amount) > 0 && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
              <span className="font-bold block">Estimated Balance After Credit:</span>
              <p className="text-base font-black mt-0.5">
                ₹{Math.max(0, currentBalance - Number(creditForm.amount)).toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default LoansPage;
