import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export function QuotesPage() {
  const { quotes, setActiveTab, globalSearch } = useAppData();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredQuotes = quotes.filter((q) => {
    if (filterStatus !== 'ALL' && q.status !== filterStatus) return false;
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        q.clientName.toLowerCase().includes(term) ||
        q.product.toLowerCase().includes(term) ||
        q.preferredInsurer.toLowerCase().includes(term) ||
        q.id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const columns = [
    {
      key: 'id',
      label: 'Quote ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-indigo-900">{val}</span>
          <p className="text-[11px] text-slate-400">{row.createdDate}</p>
        </div>
      )
    },
    {
      key: 'clientName',
      label: 'Client & Asset',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900">{val}</p>
          <p className="text-xs text-slate-500 font-mono">{row.vehicleNumber}</p>
        </div>
      )
    },
    {
      key: 'product',
      label: 'Product Line',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-700">{val}</span>
    },
    {
      key: 'preferredInsurer',
      label: 'Quoted Partner',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          {val}
        </span>
      )
    },
    {
      key: 'idv',
      label: 'IDV / Sum Insured',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-slate-900">
          ₹{val.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'quoteAmount',
      label: 'Quoted Premium',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-black text-indigo-900 text-sm">
          ₹{val.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Underwriting Status',
      sortable: true,
      render: (val) => {
        let variant = 'warning';
        if (val.includes('Ready')) variant = 'success';
        if (val.includes('Review')) variant = 'info';
        return <Badge variant={variant} dot size="sm">{val}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => setActiveTab('wizard')}
        >
          Open Wizard
        </Button>
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
              Quotations Comparison Hub
            </h1>
            <Badge variant="warning" size="sm">18 Active Quotes</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review live generated quotes, client comparative rate schedules, and pending policy issuances.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setActiveTab('wizard')}
        >
          New Multi-Company Quote
        </Button>
      </div>

      {/* Filter Tabs & Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Quotation Pipeline</h2>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            {[
              { id: 'ALL', label: 'All Quotes' },
              { id: 'Ready for Issuance', label: 'Ready for Issuance' },
              { id: 'Underwriting Review', label: 'Underwriting Review' },
              { id: 'Pending Client Approval', label: 'Pending Client' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === f.id
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
          data={filteredQuotes}
          searchPlaceholder="Search quotes by client, product, or partner..."
          emptyMessage="No quotations match current filter"
        />
      </div>
    </div>
  );
}

export default QuotesPage;
