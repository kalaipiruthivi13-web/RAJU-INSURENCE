import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  Shield,
  Search,
  ExternalLink,
  Paperclip,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import ClaimTimeline4Stage from '../components/claims/ClaimTimeline4Stage';
import RegisterNewClaimModal from '../components/claims/RegisterNewClaimModal';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export function ClaimsPage() {
  const {
    claims,
    selectedClaimId,
    setSelectedClaimId,
    updateClaimStage,
    globalSearch,
    showRegisterClaimModal,
    setShowRegisterClaimModal,
    activeTab,
    setActiveTab
  } = useAppData();

  const [activeSubTab, setActiveSubTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'SETTLEMENTS'
  const [settlementSubFilter, setSettlementSubFilter] = useState('ALL'); // 'ALL' | 'DUE_7_DAYS' | 'PROCESSING' | 'SETTLED' | 'OVERDUE'

  // Calculate days remaining helper
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return 7;
    const target = new Date(dueDateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Sync with activeTab from sidebar
  useEffect(() => {
    if (activeTab === 'claims-pending') {
      setActiveSubTab('PENDING');
    } else if (activeTab === 'claims-settlements') {
      setActiveSubTab('SETTLEMENTS');
      setSettlementSubFilter('ALL');
    } else if (activeTab === 'claims-new') {
      setShowRegisterClaimModal(true);
      setActiveSubTab('ALL');
    } else if (activeTab === 'claims') {
      setActiveSubTab('ALL');
    }
  }, [activeTab]);

  // Counts for Settlement Tracking
  const settlementStats = claims.reduce(
    (acc, c) => {
      const days = getDaysRemaining(c.settlementDueDate);
      const isSettled = c.currentStage === 4 || c.stageDetails?.stage4?.status === 'Settled';
      const isProcessing = c.currentStage === 2 || c.currentStage === 3;
      const isOverdue = days < 0 && !isSettled;
      const isDue7Days = days >= 0 && days <= 7 && !isSettled;

      if (isDue7Days) acc.due7Days++;
      if (isProcessing) acc.processing++;
      if (isSettled) acc.settled++;
      if (isOverdue) acc.overdue++;
      return acc;
    },
    { due7Days: 0, processing: 0, settled: 0, overdue: 0 }
  );

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  // Filtering claims
  const filteredClaims = claims.filter((c) => {
    const days = getDaysRemaining(c.settlementDueDate);
    const isSettled = c.currentStage === 4 || c.stageDetails?.stage4?.status === 'Settled';
    const isProcessing = c.currentStage === 2 || c.currentStage === 3;
    const isOverdue = days < 0 && !isSettled;
    const isDue7Days = days >= 0 && days <= 7 && !isSettled;

    if (activeSubTab === 'PENDING') {
      if (isSettled) return false;
    } else if (activeSubTab === 'SETTLEMENTS') {
      if (settlementSubFilter === 'DUE_7_DAYS' && !isDue7Days) return false;
      if (settlementSubFilter === 'PROCESSING' && !isProcessing) return false;
      if (settlementSubFilter === 'SETTLED' && !isSettled) return false;
      if (settlementSubFilter === 'OVERDUE' && !isOverdue) return false;
    }

    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        c.clientName.toLowerCase().includes(term) ||
        c.companyName.toLowerCase().includes(term) ||
        c.id.toLowerCase().includes(term) ||
        (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const stageLabels = [
    '01 Registered',
    '02 Docs & Submission',
    '03 Survey / Review',
    '04 Settlement'
  ];

  const columns = [
    {
      key: 'id',
      label: 'Claim ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-blue-900">{val}</span>
          <p className="text-[10px] text-slate-400">{row.incidentDate}</p>
        </div>
      )
    },
    {
      key: 'clientName',
      label: 'Client & Asset',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{val}</p>
          <p className="text-[10px] text-slate-500 font-mono">{row.vehicleNumber}</p>
        </div>
      )
    },
    {
      key: 'companyName',
      label: 'Insurance Partner',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800 text-xs">{val}</span>
    },
    {
      key: 'claimAmountRequested',
      label: 'Requested Loss',
      sortable: true,
      render: (val) => (
        <span className="font-black text-slate-900 text-xs">
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'settlementStatus',
      label: 'Settlement SLA',
      sortable: true,
      render: (val, row) => {
        const days = getDaysRemaining(row.settlementDueDate);
        const isSettled = row.currentStage === 4 || row.stageDetails?.stage4?.status === 'Settled';
        const isOverdue = days < 0 && !isSettled;
        const isDueToday = days === 0 && !isSettled;

        if (isSettled) {
          return (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ✓ Settled
            </span>
          );
        }

        return (
          <div>
            <span
              className={`text-[10px] font-bold px-2 py-0.2 rounded-full inline-block ${
                isOverdue
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : isDueToday
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {isOverdue ? `Overdue by ${Math.abs(days)}d` : isDueToday ? 'Due Today' : `Due in ${days} days`}
            </span>
            {row.settlementDueDate && (
              <p className="text-[9px] text-slate-400 mt-0.5 font-mono">
                Due: {row.settlementDueDate}
              </p>
            )}
          </div>
        );
      }
    },
    {
      key: 'currentStage',
      label: 'Pipeline Stage',
      sortable: true,
      render: (stage, row) => {
        const isSettled = stage === 4;
        const status = row.stageDetails?.stage4?.status || (stage === 4 ? 'Settled' : 'Pending');
        return (
          <div>
            <Badge
              variant={isSettled ? (status === 'Settled' ? 'success' : 'danger') : 'warning'}
              dot
              size="sm"
            >
              {stageLabels[(stage || 1) - 1] || `Stage ${stage}`}
            </Badge>
            {row.attachments?.length > 0 && (
              <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Paperclip className="w-2.5 h-2.5" />
                {row.attachments.length} attachment(s)
              </p>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant={row.id === selectedClaimId ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedClaimId(row.id)}
          className="cursor-pointer font-bold py-1 px-2 text-xs"
        >
          {row.id === selectedClaimId ? 'Viewing' : 'Track Pipeline'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-3">
      {/* Page Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Claims Management & Settlement Engine
            </h1>
            <Badge variant="warning" size="sm">IRDAI Fast Track</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            4-Stage Workflow: 01 Registered ➔ 02 Documents & Submission ➔ 03 Survey & Assessment ➔ 04 Fast-Track Settlement.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowRegisterClaimModal(true)}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs py-1.5 text-xs"
          >
            Register New Claim (with Attachments)
          </Button>
        </div>
      </div>

      {/* Primary Sub-Navigation Bar matching exact user menu hierarchy */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'ALL', label: 'All Claims', icon: Shield, navTab: 'claims' },
          { id: 'PENDING', label: 'Pending Claims', icon: Clock, navTab: 'claims-pending' },
          { id: 'SETTLEMENTS', label: 'Settlement Tracking', icon: CheckCircle, navTab: 'claims-settlements' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSubTab(tab.id);
                setActiveTab(tab.navTab);
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

        <button
          type="button"
          onClick={() => setShowRegisterClaimModal(true)}
          className="ml-auto px-3 py-1.5 text-xs font-bold text-[#2563EB] hover:bg-blue-50 rounded-lg flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Claim</span>
        </button>
      </div>

      {/* DEDICATED SECTION: Settlement Tracking Sub-Filters & KPI Summary */}
      {activeSubTab === 'SETTLEMENTS' && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          {/* 4 Settlement Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: 'DUE_7_DAYS',
                label: 'Due within 7 Days',
                count: settlementStats.due7Days,
                color: '#2563EB',
                bg: '#EFF6FF',
                border: '#BFDBFE',
                icon: Clock
              },
              {
                id: 'PROCESSING',
                label: 'Processing',
                count: settlementStats.processing,
                color: '#4F46E5',
                bg: '#EEF2FF',
                border: '#C7D2FE',
                icon: RefreshCw
              },
              {
                id: 'SETTLED',
                label: 'Settled',
                count: settlementStats.settled,
                color: '#059669',
                bg: '#ECFDF5',
                border: '#A7F3D0',
                icon: CheckCircle2
              },
              {
                id: 'OVERDUE',
                label: 'Overdue',
                count: settlementStats.overdue,
                color: '#E11D48',
                bg: '#FFF1F2',
                border: '#FECDD3',
                icon: AlertTriangle
              }
            ].map((st) => {
              const Icon = st.icon;
              const isSelected = settlementSubFilter === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSettlementSubFilter(isSelected ? 'ALL' : st.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                    isSelected
                      ? 'ring-2 ring-blue-600 border-transparent shadow-xs'
                      : 'hover:shadow-xs'
                  }`}
                  style={{ backgroundColor: st.bg, borderColor: isSelected ? undefined : st.border }}
                >
                  <div className="min-w-0">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider block truncate"
                      style={{ color: st.color }}
                    >
                      {st.label}
                    </span>
                    <span className="text-lg font-black text-slate-900 leading-none mt-1 block">
                      {st.count}
                    </span>
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${st.color}20`, color: st.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-Filter Tab Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 px-2">
              SLA Category:
            </span>
            {[
              { id: 'ALL', label: `All Settlements (${claims.length})` },
              { id: 'DUE_7_DAYS', label: `Due within 7 Days (${settlementStats.due7Days})` },
              { id: 'PROCESSING', label: `Processing (${settlementStats.processing})` },
              { id: 'SETTLED', label: `Settled (${settlementStats.settled})` },
              { id: 'OVERDUE', label: `Overdue (${settlementStats.overdue})` }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSettlementSubFilter(f.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  settlementSubFilter === f.id
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Pipeline View for Selected Claim */}
      {selectedClaim && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Selected Claim Timeline: {selectedClaim.id} ({selectedClaim.clientName})
            </span>
            {selectedClaim.settlementStatus && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selectedClaim.settlementStatus.includes('Overdue')
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : selectedClaim.settlementStatus.includes('Today')
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-[#2563EB] border border-blue-200'
              }`}>
                ⏱️ Settlement: {selectedClaim.settlementStatus}
              </span>
            )}
          </div>

          <ClaimTimeline4Stage
            claim={selectedClaim}
            onAdvanceStage={updateClaimStage}
          />

          {/* Attachments & Supporting Documents Vault - Compact */}
          {selectedClaim.attachments && selectedClaim.attachments.length > 0 && (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                    <Paperclip className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Claim Supporting Attachments ({selectedClaim.attachments.length})
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Uploaded directly in registration form: FIR, RC copy, Driving License, Garage Estimates & Spot Photos
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  ✓ Verified Documents
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {selectedClaim.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-blue-100/70 text-[#2563EB] flex items-center justify-center shrink-0">
                        <FileCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate" title={att.name}>
                          {att.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            {att.category}
                          </span>
                          <span>•</span>
                          <span>{att.size}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.2 rounded shrink-0">
                      {att.status || 'Verified'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Claims List Section */}
      <div className="space-y-2">
        <DataTable
          columns={columns}
          data={filteredClaims}
          searchPlaceholder="Search claims by client, vehicle or claim ID..."
          emptyMessage="No claims match current filter"
        />
      </div>

      {/* MULTI-STEP MODAL: Register New Claim with Attachments Inside */}
      <RegisterNewClaimModal
        isOpen={showRegisterClaimModal}
        onClose={() => setShowRegisterClaimModal(false)}
      />
    </div>
  );
}

export default ClaimsPage;
