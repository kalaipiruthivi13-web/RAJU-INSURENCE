import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  FileCheck2,
  Clock,
  User,
  Building2,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export function ReportsAuditPage() {
  const { auditLogs, partners, globalSearch } = useAppData();
  const [filterUser, setFilterUser] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterUser !== 'ALL' && !log.user.includes(filterUser)) return false;
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        log.user.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.entity.toLowerCase().includes(term) ||
        log.id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const columns = [
    {
      key: 'id',
      label: 'Audit ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-indigo-900">{val}</span>
          <p className="text-[11px] text-slate-400">{row.time}</p>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Authorized Officer',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-900 text-xs">{val}</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'System Action / Override',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800 text-xs">{val}</span>
    },
    {
      key: 'entity',
      label: 'Entity Reference',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {val}
        </span>
      )
    },
    {
      key: 'compliance',
      label: 'IRDA Compliance',
      render: () => (
        <Badge variant="success" dot size="sm">
          Verified & Logged
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
              Reports & IRDAI Audit Trail
            </h1>
            <Badge variant="primary" size="sm">Tamper-Proof Logging</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Executive performance analytics, brokerage commission reconciliation, and statutory IRDAI compliance audit logs.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          icon={Download}
          onClick={() => alert('Exporting IRDAI Compliance Audit Report CSV...')}
        >
          Export Audit Trail
        </Button>
      </div>

      {/* KPI Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Written Premium (GWP)
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">₹4.85 Crore</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% YoY Growth
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Net Brokerage Revenue
          </span>
          <div className="text-2xl font-black text-indigo-900 mt-1">₹68.4 Lakhs</div>
          <span className="text-[11px] text-indigo-600 font-medium block mt-1">
            Avg Margin: 15.8% on OD
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Overall Claim Settlement
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">97.4%</div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Across all 15 Partner Insurers
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Renewal Retention Rate
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">84.2%</div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> Fast WhatsApp Alerts
          </span>
        </div>
      </div>

      {/* Audit Log Data Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Statutory IRDAI Audit Logs</h2>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            {[
              { id: 'ALL', label: 'All Activities' },
              { id: 'Rajkumar', label: 'Principal Broker Only' },
              { id: 'Deepika', label: 'Retention Team' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterUser(f.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterUser === f.id
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
          data={filteredLogs}
          searchPlaceholder="Search audit trail by user, action or policy ID..."
          emptyMessage="No audit logs match current filter"
        />
      </div>
    </div>
  );
}

export default ReportsAuditPage;
