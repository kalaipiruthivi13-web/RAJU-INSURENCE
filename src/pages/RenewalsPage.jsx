import React, { useState } from 'react';
import {
  RefreshCw,
  Send,
  Calendar,
  AlertCircle,
  PhoneCall,
  CheckCircle,
  ArrowRightLeft,
  FileCheck
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export function RenewalsPage() {
  const { policies, sendRenewalReminder, renewPolicy, partners, globalSearch } = useAppData();

  const [activeTabFilter, setActiveTabFilter] = useState('30DAYS');
  const [selectedPolicyForRenew, setSelectedPolicyForRenew] = useState(null);
  const [renewalForm, setRenewalForm] = useState({
    mode: 'Direct',
    targetCompanyId: '',
    newExpiryDate: ''
  });

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const enrichedPolicies = policies.map((p) => {
    const expDate = new Date(p.expiryDate);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isDueWithin30 = diffDays >= 0 && diffDays <= 30;
    const isLapsed = diffDays < 0;

    return {
      ...p,
      daysRemaining: diffDays,
      isDueWithin30,
      isLapsed
    };
  });

  const filteredPolicies = enrichedPolicies.filter((p) => {
    if (activeTabFilter === '30DAYS' && !p.isDueWithin30) return false;
    if (activeTabFilter === 'DIRECT' && p.renewableVia !== 'Direct') return false;

    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        p.clientName.toLowerCase().includes(term) ||
        p.companyName.toLowerCase().includes(term) ||
        (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(term)) ||
        p.id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const openRenewModal = (policy) => {
    setSelectedPolicyForRenew(policy);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setRenewalForm({
      mode: 'Direct',
      targetCompanyId: policy.companyId,
      newExpiryDate: nextYear.toISOString().split('T')[0]
    });
  };

  const handleExecuteRenewal = (e) => {
    e.preventDefault();
    if (!selectedPolicyForRenew) return;

    renewPolicy(selectedPolicyForRenew.id, {
      newExpiryDate: renewalForm.newExpiryDate,
      newCompanyId: renewalForm.targetCompanyId || selectedPolicyForRenew.companyId
    });
    setSelectedPolicyForRenew(null);
  };

  const columns = [
    {
      key: 'clientName',
      label: 'Client & Contact',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900">{val}</p>
          <p className="text-xs text-slate-500">{row.phone}</p>
        </div>
      )
    },
    {
      key: 'vehicleNumber',
      label: 'Asset / Vehicle',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-mono font-bold text-slate-800">{val}</p>
          <p className="text-xs text-slate-500">{row.policyType}</p>
        </div>
      )
    },
    {
      key: 'companyName',
      label: 'Current Insurer',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-slate-800">{val}</span>
      )
    },
    {
      key: 'daysRemaining',
      label: 'Renewal Timeline',
      sortable: true,
      render: (days, row) => {
        if (row.isLapsed) {
          return (
            <Badge variant="lapsed" size="sm" dot>
              Lapsed ({Math.abs(days)}d ago)
            </Badge>
          );
        }
        if (days <= 30) {
          return (
            <Badge variant="warning" size="sm" dot>
              Expires in {days} Days
            </Badge>
          );
        }
        return (
          <Badge variant="active" size="sm" dot>
            {days} Days Remaining
          </Badge>
        );
      }
    },
    {
      key: 'premium',
      label: 'Previous Premium',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-slate-900">
          ₹{val.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => sendRenewalReminder(row.id, 'WhatsApp')}
            title="Send WhatsApp Reminder"
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openRenewModal(row)}
          >
            Renew Now
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-3">
      {/* Page Header - Compact */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Renewal Tracking & 30-Day Alert System
            </h1>
            <Badge variant="warning" size="sm">Auto-Reminder Engine</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Automated 30-day early alert triggers ensuring zero policy lapse and maximum client retention.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          {[
            { id: '30DAYS', label: '30-Day Urgent Alerts' },
            { id: 'DIRECT', label: 'Direct Renewals' },
            { id: 'ALL', label: 'All Records' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTabFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual-Color Strategy Banner - Compact */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs shadow-2xs shrink-0">
            <Calendar className="w-4 h-4 text-cyan-200" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Standard 30-Day Retention Logic Active</h3>
            <p className="text-[11px] text-blue-100/90 mt-0.5">
              WhatsApp & SMS templates auto-include Policy Number, Expiry Date, and NCB discount benefits to retain clients.
            </p>
          </div>
        </div>

        <div className="text-xs bg-white/15 px-3 py-1.5 rounded-lg border border-white/20 font-bold text-cyan-100 backdrop-blur-xs shrink-0">
          Retained this month: <strong className="text-emerald-300">92% Rate</strong>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredPolicies}
        searchPlaceholder="Search renewals by client, vehicle or company..."
        emptyMessage="No policies require renewal under this filter"
      />

      {/* MODAL: Execute Policy Renewal */}
      <Modal
        isOpen={Boolean(selectedPolicyForRenew)}
        onClose={() => setSelectedPolicyForRenew(null)}
        title={`Process Renewal: ${selectedPolicyForRenew?.clientName}`}
        subtitle={`Policy: ${selectedPolicyForRenew?.id} (${selectedPolicyForRenew?.vehicleNumber || selectedPolicyForRenew?.policyType})`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelectedPolicyForRenew(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteRenewal}>
              Confirm Policy Renewal (1 Year)
            </Button>
          </>
        }
      >
        <form onSubmit={handleExecuteRenewal} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Insurance Carrier / Partner Company *
            </label>
            <select
              value={renewalForm.targetCompanyId}
              onChange={(e) => setRenewalForm({ ...renewalForm, targetCompanyId: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] text-xs font-semibold text-slate-900"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.claimRatio} Claim Ratio)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              New Policy Expiry Date (1 Year Extension) *
            </label>
            <input
              type="date"
              required
              value={renewalForm.newExpiryDate}
              onChange={(e) => setRenewalForm({ ...renewalForm, newExpiryDate: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-[#2563EB] text-xs text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              New Expiry Date (1-Year Extension) *
            </label>
            <input
              type="date"
              required
              value={renewalForm.newExpiryDate}
              onChange={(e) => setRenewalForm({ ...renewalForm, newExpiryDate: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default RenewalsPage;
