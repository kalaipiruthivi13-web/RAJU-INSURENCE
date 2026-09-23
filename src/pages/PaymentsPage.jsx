import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Plus
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export function PaymentsPage() {
  const { payments, globalSearch } = useAppData();
  const [filterMode, setFilterMode] = useState('ALL');

  const cdLedgers = [
    {
      partner: 'HDFC ERGO General',
      balance: 485000,
      accountNo: 'CD-HDFC-99120',
      lastRefill: '2024-09-15',
      status: 'Adequate Float'
    },
    {
      partner: 'ICICI Lombard',
      balance: 320000,
      accountNo: 'CD-ICICI-44129',
      lastRefill: '2024-09-12',
      status: 'Adequate Float'
    },
    {
      partner: 'Star Health & Allied',
      balance: 195000,
      accountNo: 'CD-STAR-77180',
      lastRefill: '2024-09-10',
      status: 'Adequate Float'
    },
    {
      partner: 'New India Assurance (PSU)',
      balance: 110000,
      accountNo: 'CD-NIA-22901',
      lastRefill: '2024-09-08',
      status: 'Top-up Due'
    }
  ];

  const filteredPayments = payments.filter((p) => {
    if (filterMode !== 'ALL' && !p.mode.toLowerCase().includes(filterMode.toLowerCase())) {
      return false;
    }
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        p.id.toLowerCase().includes(term) ||
        p.clientName.toLowerCase().includes(term) ||
        p.policyId.toLowerCase().includes(term) ||
        p.utr.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-indigo-900">{val}</span>
          <p className="text-[11px] text-slate-400">{row.timestamp}</p>
        </div>
      )
    },
    {
      key: 'policyId',
      label: 'Policy Reference',
      sortable: true,
      render: (val) => <span className="font-mono font-semibold text-slate-800">{val}</span>
    },
    {
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900">{val}</span>
    },
    {
      key: 'amount',
      label: 'Settlement Amount',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-black text-emerald-700">
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'mode',
      label: 'Payment Method',
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <CreditCard className="w-3 h-3 text-indigo-600" />
          {val}
        </span>
      )
    },
    {
      key: 'utr',
      label: 'Bank UTR / Ref',
      sortable: true,
      render: (val) => <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded">{val}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val === 'Success' ? 'success' : 'warning'} dot size="sm">
          {val}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Payment Transactions & CD Ledger
            </h1>
            <Badge variant="primary" size="sm">Real-Time Reconciliation</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track multi-carrier premium settlements, client payment gateway callbacks, and Agency CD float accounts.
          </p>
        </div>
      </div>

      {/* Agency CD Account Float Cards */}
      <div>
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
          Agency Cash Deposit (CD) Float Balances
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cdLedgers.map((cd, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{cd.partner}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cd.status === 'Top-up Due'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {cd.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Available Float Balance</span>
                <div className="text-xl font-black text-indigo-950 mt-0.5">
                  ₹{cd.balance.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono">{cd.accountNo}</span>
                <span>Refill: {cd.lastRefill}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Recent Payment Transactions</h2>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            {[
              { id: 'ALL', label: 'All Modes' },
              { id: 'UPI', label: 'UPI Instant' },
              { id: 'CD', label: 'CD Float' },
              { id: 'Netbanking', label: 'Netbanking' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterMode(f.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterMode === f.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredPayments}
          searchPlaceholder="Search transactions by ID, client, or UTR..."
          emptyMessage="No payment transactions match current filter"
        />
      </div>
    </div>
  );
}

export default PaymentsPage;
