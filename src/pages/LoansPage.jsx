import React, { useState, useEffect } from 'react';
import {
  Coins,
  Plus,
  ArrowDownLeft,
  Calendar,
  Printer,
  Calculator,
  Shield,
  FileCheck,
  CheckCircle2,
  ReceiptText,
  FileText,
  CreditCard,
  Building2,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  Wallet,
  ArrowRight
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
    globalSearch,
    activeTab,
    setActiveTab,
    policies
  } = useAppData();

  const [activeSubTab, setActiveSubTab] = useState('loans-active'); // 'loans-new' | 'loans-active' | 'loans-repayments' | 'loans-settlement'
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id || null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [settlementSuccess, setSettlementSuccess] = useState(null);
  const [newLoanSuccess, setNewLoanSuccess] = useState(null);

  // Sync with sidebar activeTab
  useEffect(() => {
    if (activeTab === 'loans' || activeTab === 'loans-active') setActiveSubTab('loans-active');
    else if (activeTab === 'loans-new') setActiveSubTab('loans-new');
    else if (activeTab === 'loans-repayments') setActiveSubTab('loans-repayments');
    else if (activeTab === 'loans-settlement') setActiveSubTab('loans-settlement');
  }, [activeTab]);

  // Form State for New Loan Application
  const [newLoanForm, setNewLoanForm] = useState({
    clientName: 'K. Balakrishnan (Transport)',
    phone: '+91 94433 11223',
    guarantorName: 'M. Sivalingam',
    guarantorPhone: '+91 94433 88990',
    collateralPolicy: 'POL-2024-7712 (LIC Jeevan Labh)',
    surrenderValue: '250000',
    principalAmount: '150000',
    monthlyRatePercent: '2.0',
    purpose: 'Commercial Fleet Insurance Premium Financing',
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

  // Portfolio total statistics
  const totalBalance = loans.reduce((acc, l) => {
    const bal = l.ledger[l.ledger.length - 1]?.balance || l.principalAmount;
    return acc + bal;
  }, 0);

  const totalMonthlyInterest = loans.reduce((acc, l) => {
    const bal = l.ledger[l.ledger.length - 1]?.balance || l.principalAmount;
    return acc + Math.round(bal * (l.monthlyRatePercent / 100));
  }, 0);

  const handleCreateLoanSubmit = (e) => {
    e.preventDefault();
    const created = addLoan({
      clientName: newLoanForm.clientName,
      phone: newLoanForm.phone,
      guarantorName: newLoanForm.guarantorName,
      principalAmount: Number(newLoanForm.principalAmount),
      monthlyRatePercent: Number(newLoanForm.monthlyRatePercent)
    });
    setSelectedLoanId(created.id);
    setNewLoanSuccess(`New Loan Account #${created.id} successfully created and ₹${Number(newLoanForm.principalAmount).toLocaleString('en-IN')} disbursed!`);
    setActiveSubTab('loans-active');
    setTimeout(() => setNewLoanSuccess(null), 4000);
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

  const handleIssueSettlement = (loan) => {
    setSettlementSuccess(`NOC Certificate & Full Loan Foreclosure generated for ${loan.clientName} (Loan #${loan.id}). Balance marked zero.`);
    setTimeout(() => setSettlementSuccess(null), 4000);
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
    <div className="space-y-3">
      {/* Page Header - Compact */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Insurance Loan Management & Credit Ledger
            </h1>
            <Badge variant="primary" size="sm">2.0% Monthly Ledger</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Automated 30-day interest tracking, policy-collateralized loan disbursements, credit repayments, and IRDA NOC settlements.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setActiveSubTab('loans-new')}
          className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs py-1.5 text-xs shrink-0"
        >
          New Loan Application
        </Button>
      </div>

      {newLoanSuccess && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{newLoanSuccess}</span>
        </div>
      )}

      {settlementSuccess && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{settlementSuccess}</span>
        </div>
      )}

      {/* Insurance Loan Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'loans-new', label: 'New Loan Application', icon: Plus },
          { id: 'loans-active', label: `Active Loans (${loans.length})`, icon: Wallet },
          { id: 'loans-repayments', label: 'Repayments / EMI', icon: CreditCard },
          { id: 'loans-settlement', label: 'Loan Settlement', icon: FileCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSubTab(tab.id);
                setActiveTab(tab.id);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. NEW LOAN APPLICATION */}
      {activeSubTab === 'loans-new' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in duration-200">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                New Loan Application & Disbursal Form
              </h3>
              <p className="text-[10px] text-slate-500">
                Disburse new loan against collateral insurance policy with automated 30-day interest ledger
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Direct Sanction
            </span>
          </div>

          <form onSubmit={handleCreateLoanSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Borrower / Client Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLoanForm.clientName}
                  onChange={(e) => setNewLoanForm({ ...newLoanForm, clientName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={newLoanForm.phone}
                  onChange={(e) => setNewLoanForm({ ...newLoanForm, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Collateral Insurance Policy *
                </label>
                <select
                  value={newLoanForm.collateralPolicy}
                  onChange={(e) => setNewLoanForm({ ...newLoanForm, collateralPolicy: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-xs font-semibold"
                >
                  <option value="POL-2024-7712 (LIC Jeevan Labh)">POL-2024-7712 (LIC Jeevan Labh - Surrender ₹2.5L)</option>
                  <option value="POL-2024-4421 (HDFC Life Sanchay)">POL-2024-4421 (HDFC Life Sanchay - Surrender ₹4.0L)</option>
                  <option value="POL-2024-6540 (Care Supreme Family)">POL-2024-6540 (Care Supreme - Surrender ₹1.8L)</option>
                  <option value="Commercial Goods Vehicle (TN 07 DJ 2341)">Commercial Goods Vehicle (TN 07 DJ 2341)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Loan Purpose
                </label>
                <input
                  type="text"
                  value={newLoanForm.purpose}
                  onChange={(e) => setNewLoanForm({ ...newLoanForm, purpose: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Principal Amount to Disburse (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={newLoanForm.principalAmount}
                  onChange={(e) => setNewLoanForm({ ...newLoanForm, principalAmount: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-sm font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  30-Day Monthly Rate (% per 30d) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newLoanForm.monthlyRatePercent}
                  onChange={(e) => setNewLoanForm({ ...newLoanForm, monthlyRatePercent: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-sm font-bold text-amber-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Guarantor Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLoanForm.guarantorName}
                  onChange={(e) => setNewLoanForm({ ...newLoanForm, guarantorName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white text-xs font-semibold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSubTab('loans-dashboard')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
              >
                Disburse Loan & Open 30-Day Ledger →
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 2. ACTIVE LOANS */}
      {activeSubTab === 'loans-active' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Executive KPI Stats - Active Loans Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                Total Outstanding Balance
              </span>
              <div className="text-xl font-black text-slate-900 mt-1">
                ₹{totalBalance.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400">Across {loans.length} active dockets</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                30-Day Monthly Accrual
              </span>
              <div className="text-xl font-black text-amber-900 mt-1">
                ₹{totalMonthlyInterest.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-amber-700 font-medium">Fixed 2.0% per 30 days</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                Repayments This Month
              </span>
              <div className="text-xl font-black text-emerald-900 mt-1">
                ₹1,85,000
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Principal & interest credit</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                Active Sanctions
              </span>
              <div className="text-xl font-black text-indigo-900 mt-1">
                {loans.length} Dockets
              </div>
              <span className="text-[10px] text-indigo-600 font-medium">IRDA Collateralized</span>
            </div>
          </div>

          {selectedLoan && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 space-y-3">
              {/* Selected Account Summary */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedLoan.id}
                    </span>
                    <Badge variant={selectedLoan.status === 'Active' ? 'active' : 'neutral'} size="sm" dot>
                      {selectedLoan.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                    {selectedLoan.clientName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phone: {selectedLoan.phone} • Guarantor: {selectedLoan.guarantorName} • Issued: {selectedLoan.issueDate}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={() => window.print()}
                    className="py-1 px-2.5 text-xs font-bold"
                  >
                    Print Ledger
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Calculator}
                    onClick={() => accrue30DayInterest(selectedLoan.id)}
                    className="py-1 px-2.5 text-xs font-bold"
                  >
                    + Accrue 30-Day Interest
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={ArrowDownLeft}
                    onClick={() => setShowCreditModal(true)}
                    className="py-1 px-2.5 text-xs font-bold bg-emerald-600 text-white"
                  >
                    Record Credit (Minus)
                  </Button>
                </div>
              </div>

              {/* 3 Metric Cards for Selected Loan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 block">Original Principal</span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">
                    ₹{selectedLoan.principalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">Fixed rate: {selectedLoan.monthlyRatePercent}% per 30d</span>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
                  <span className="text-[10px] text-amber-700 block font-bold">30-Day Accrued Interest</span>
                  <span className="text-lg font-black text-amber-900 mt-0.5 block">
                    ₹{preview30DayInterest.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-amber-700">Calculated on current balance</span>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] text-blue-700 block font-bold">Outstanding Balance</span>
                  <span className="text-lg font-black text-blue-950 mt-0.5 block">
                    ₹{currentBalance.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-blue-600 font-medium">Principal + Unpaid Interest</span>
                </div>
              </div>

              {/* 30-Day Loan Ledger Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    30-Day Interest Ledger & Credit Statement
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">
                    {selectedLoan.ledger.length} Transactions
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Particulars</th>
                        <th className="py-2 px-3 text-right">Debit (+)</th>
                        <th className="py-2 px-3 text-right">Interest (+)</th>
                        <th className="py-2 px-3 text-right">Credit (-)</th>
                        <th className="py-2 px-3 text-right">Final Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedLoan.ledger.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                            {entry.date}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800 text-xs">
                            {entry.particulars}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700 text-xs">
                            {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-amber-700 font-bold text-xs">
                            {entry.interestAccrued > 0 ? `+₹${entry.interestAccrued.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700 font-black text-xs">
                            {entry.credit > 0 ? `-₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-black text-slate-900 text-xs">
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

          {/* Active Accounts Grid */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              All Active Client Loan Dockets ({filteredLoans.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {filteredLoans.map((l) => {
                const bal = l.ledger[l.ledger.length - 1]?.balance || l.principalAmount;
                const isSel = l.id === selectedLoanId;

                return (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLoanId(l.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSel
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-900">{l.id}</span>
                      <Badge variant={l.status === 'Active' ? 'active' : 'neutral'} size="sm">
                        {l.status}
                      </Badge>
                    </div>
                    <p className="font-bold text-slate-900 text-xs mt-1">{l.clientName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{l.phone}</p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-400">Balance:</span>
                      <span className="text-xs font-black text-slate-900">
                        ₹{bal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. REPAYMENTS / EMI */}
      {activeSubTab === 'loans-repayments' && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Client Credit & EMI Repayment History
              </h3>
              <p className="text-[10px] text-slate-400">Direct deduction towards principal and monthly interest</p>
            </div>
            <Button
              variant="success"
              size="sm"
              icon={ArrowDownLeft}
              onClick={() => setShowCreditModal(true)}
              className="py-1 px-2.5 text-xs font-bold bg-emerald-600 text-white"
            >
              + Record Repayment
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Client Docket</th>
                  <th className="py-2 px-3">Payment Mode / Reference</th>
                  <th className="py-2 px-3 text-right">Credit Amount</th>
                  <th className="py-2 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.flatMap((l) =>
                  l.ledger
                    .filter((e) => e.credit > 0)
                    .map((entry) => ({ ...entry, loanId: l.id, clientName: l.clientName }))
                ).map((rep) => (
                  <tr key={`${rep.loanId}-${rep.id}`} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{rep.date}</td>
                    <td className="py-2 px-3">
                      <p className="font-bold text-slate-900 text-xs">{rep.clientName}</p>
                      <span className="font-mono text-[10px] text-blue-700">{rep.loanId}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 text-xs">{rep.particulars}</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-emerald-700 text-xs">
                      ₹{rep.credit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Receipt #${rep.id} downloaded for ₹${rep.credit}`)}
                        className="px-2 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 cursor-pointer"
                      >
                        Receipt PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. LOAN SETTLEMENT */}
      {activeSubTab === 'loans-settlement' && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3 animate-in fade-in duration-200">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Full Loan Settlement & NOC Clearance
              </h3>
              <p className="text-[10px] text-slate-400">
                Issue No-Objection Certificate (NOC) and release collateral insurance policy
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              IRDA NOC Certified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {loans.map((l) => {
              const bal = l.ledger[l.ledger.length - 1]?.balance || 0;
              return (
                <div key={l.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-900">{l.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {l.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mt-1.5">{l.clientName}</h4>
                    <p className="text-[10px] text-slate-500">Phone: {l.phone} • Guarantor: {l.guarantorName}</p>

                    <div className="mt-3 p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Payoff Amount:</span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        ₹{bal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleIssueSettlement(l)}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Issue NOC & Close Loan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Record Credit Payment */}
      <Modal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        title="Record Credit Repayment"
        subtitle={`Deduct payment from ${selectedLoan?.clientName} (${selectedLoan?.id})`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowCreditModal(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleApplyCreditPayment}>
              Apply Credit Deduction
            </Button>
          </>
        }
      >
        <form onSubmit={handleApplyCreditPayment} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Repayment Amount (₹)
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 25000"
              value={creditForm.amount}
              onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-black text-emerald-700 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Particulars / Payment Details
            </label>
            <input
              type="text"
              required
              value={creditForm.particulars}
              onChange={(e) => setCreditForm({ ...creditForm, particulars: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LoansPage;
