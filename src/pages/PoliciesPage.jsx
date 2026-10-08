import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  MoreVertical,
  Download,
  Send,
  AlertTriangle,
  ExternalLink,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import OperationsSubNavBar from '../components/layout/OperationsSubNavBar';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export function PoliciesPage() {
  const { policies, setActiveTab, globalSearch, sendRenewalReminder } = useAppData();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const filteredPolicies = policies.filter((p) => {
    if (filterStatus === 'ACTIVE' && p.status !== 'Active') return false;
    if (filterStatus === 'EXPIRING' && p.status !== 'Expiring Soon') return false;
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        p.clientName.toLowerCase().includes(term) ||
        p.companyName.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.policyType.toLowerCase().includes(term) ||
        (p.phone && p.phone.toLowerCase().includes(term)) ||
        (p.email && p.email.toLowerCase().includes(term)) ||
        (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const columns = [
    {
      key: 'id',
      label: 'Policy Number',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-indigo-900">{val}</span>
          <p className="text-[11px] text-slate-400">Issued: {row.issueDate || '2023-10-10'}</p>
        </div>
      )
    },
    {
      key: 'clientName',
      label: 'Policyholder',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900">{val}</p>
          <p className="text-xs text-slate-500 font-mono">{row.phone}</p>
        </div>
      )
    },
    {
      key: 'policyType',
      label: 'Product & Asset',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-800">{val}</p>
          <p className="text-[11px] text-slate-500 font-mono">{row.vehicleNumber}</p>
        </div>
      )
    },
    {
      key: 'companyName',
      label: 'Carrier Partner',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>
    },
    {
      key: 'sumInsured',
      label: 'Sum Insured / IDV',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-slate-900">
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'premium',
      label: 'Annual Premium',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-emerald-700">
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      sortable: true,
      render: (val, row) => {
        const isExpiring = row.status === 'Expiring Soon';
        return (
          <div>
            <span className={`font-mono text-xs ${isExpiring ? 'font-bold text-amber-600' : 'text-slate-700'}`}>
              {val}
            </span>
            {isExpiring && (
              <span className="block text-[10px] text-amber-600 font-semibold">Renewal Due</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val === 'Active' ? 'success' : 'warning'} dot size="sm">
          {val}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === row.id ? null : row.id);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {activeMenuId === row.id && (
            <div
              className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedPolicy(row);
                  setActiveMenuId(null);
                }}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                <span>View Full Docket</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Downloading official IRDA policy schedule PDF for ${row.id}`);
                  setActiveMenuId(null);
                }}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download Policy PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sendRenewalReminder(row.id, 'WhatsApp');
                  setActiveMenuId(null);
                }}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Send WhatsApp Reminder</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('claims');
                  setActiveMenuId(null);
                }}
                className="w-full px-3.5 py-2 text-left text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Lodge Claim for Asset</span>
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-3" onClick={() => setActiveMenuId(null)}>
      {/* 1. Operations Sub-Navigation Bar */}
      <OperationsSubNavBar activeItem="policies" />

      {/* Header - Compact */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Active Policies Repository
            </h1>
            <Badge variant="primary" size="sm">{policies.length} Policies Active</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manage all in-force motor, health, and commercial policies issued through RAJU VENDOR agency portal.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setActiveTab('wizard')}
          className="py-1.5 text-xs font-bold shrink-0"
        >
          Issue New Policy
        </Button>
      </div>

      {/* Filter Tabs & Data Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Policies Ledger</h2>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            {[
              { id: 'ALL', label: 'All Policies' },
              { id: 'ACTIVE', label: 'In-Force Active' },
              { id: 'EXPIRING', label: 'Expiring Soon (<30 Days)' }
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
          data={filteredPolicies}
          searchPlaceholder="Search by Policy No, Customer Name, Mobile, Vehicle Registration, Carrier..."
          emptyMessage="No policies match current filter"
        />
      </div>

      {/* Policy Details Modal */}
      {selectedPolicy && (
        <Modal
          isOpen={!!selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          title={`Policy Docket: ${selectedPolicy.id}`}
          subtitle={`${selectedPolicy.clientName} • ${selectedPolicy.companyName}`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedPolicy(null)}>
              Close Docket
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Policyholder</span>
                <span className="font-bold text-slate-900">{selectedPolicy.clientName}</span>
                <span className="text-[10px] text-slate-500 block">{selectedPolicy.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Insurance Carrier</span>
                <span className="font-bold text-indigo-900">{selectedPolicy.companyName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Product Line</span>
                <span className="font-semibold text-slate-800">{selectedPolicy.policyType}</span>
                <span className="font-mono text-[10px] text-slate-500 block">{selectedPolicy.vehicleNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Coverage Expiry Date</span>
                <span className="font-mono font-bold text-slate-800">{selectedPolicy.expiryDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Sum Insured / IDV</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{(selectedPolicy.sumInsured || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Annual Premium</span>
                <span className="font-mono font-extrabold text-emerald-700">
                  ₹{(selectedPolicy.premium || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedPolicy.notes && (
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-indigo-950">
                <span className="font-bold uppercase text-[10px] block text-indigo-700">Underwriting Notes:</span>
                <p className="mt-0.5">{selectedPolicy.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PoliciesPage;
