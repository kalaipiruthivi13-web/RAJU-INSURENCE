import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Clock,
  Shield,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Layers,
  X,
  ExternalLink,
  ChevronRight,
  ArrowUp,
  ArrowRight,
  Calendar,
  Check,
  Copy,
  User,
  Building,
  Phone,
  ArrowDownCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import OperationsSubNavBar from '../components/layout/OperationsSubNavBar';
import ClaimTimeline4Stage from '../components/claims/ClaimTimeline4Stage';
import ClaimDetailDocket from '../components/claims/ClaimDetailDocket';
import Button from '../components/ui/Button';

export function ClaimsPage() {
  const {
    claims,
    claimsFilter,
    setClaimsFilter,
    selectedClaimId,
    setSelectedClaimId,
    updateClaimStage,
    updateClaimDocument,
    addClaimBill,
    addClaimFollowUp,
    updateClaimSettlement,
    globalSearch,
    setGlobalSearch,
    showRegisterClaimModal,
    setShowRegisterClaimModal,
    activeTab,
    setActiveTab
  } = useAppData();

  const docketRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  // Search input state
  const [searchInputValue, setSearchInputValue] = useState('');

  // Dropdown filter state for ALL Claims
  const [insurerFilter, setInsurerFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Sub-filter for Pending Claims (by stage: null | 1 | 2 | 3)
  const [pendingStageFilter, setPendingStageFilter] = useState(null);

  // Sub-filter for Settlement Tracking ('ALL_ACTIVE' | 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'SETTLED')
  const [settlementSubFilter, setSettlementSubFilter] = useState('ALL_ACTIVE');

  // 7-Day Settlement Calculations Base Date
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calculateDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return 7;
    const target = new Date(dueDateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateDaysPending = (incidentDateStr) => {
    if (!incidentDateStr) return 4;
    const incDate = new Date(incidentDateStr);
    const diffTime = Math.abs(today.getTime() - incDate.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Helper check for resolved claims
  const isSettled = (c) => {
    return (
      (c.currentStage === 4 && (c.stageDetails?.stage4?.status === 'Settled' || c.stageDetails?.stage4?.completed)) ||
      c.settlementStatus === 'Settled' ||
      c.settlementStatus === 'Closed' ||
      c.status === 'Settled'
    );
  };

  const isRejected = (c) => {
    return (
      (c.currentStage === 4 && (c.stageDetails?.stage4?.status === 'Rejected' || c.stageDetails?.stage4?.status === 'Closed (Overload Repudiation)')) ||
      c.settlementStatus === 'Rejected' ||
      c.status === 'Rejected'
    );
  };

  // Current Active View derived from activeTab
  const currentView = useMemo(() => {
    if (activeTab === 'claims-pending' || claimsFilter?.subTab === 'PENDING') return 'PENDING';
    if (activeTab === 'claims-settlements' || claimsFilter?.subTab === 'SETTLEMENTS') return 'SETTLEMENTS';
    return 'ALL';
  }, [activeTab, claimsFilter]);

  // Synchronize dashboard settlement filters if routed with settlementSubFilter
  useEffect(() => {
    if (claimsFilter?.settlementSubFilter && claimsFilter.settlementSubFilter !== 'ALL') {
      if (claimsFilter.settlementSubFilter === 'OVERDUE') setSettlementSubFilter('OVERDUE');
      else if (claimsFilter.settlementSubFilter === 'DUE_TODAY') setSettlementSubFilter('DUE_TODAY');
      else if (claimsFilter.settlementSubFilter === 'DUE_SOON' || claimsFilter.settlementSubFilter === 'DUE_7_DAYS') setSettlementSubFilter('DUE_SOON');
      else if (claimsFilter.settlementSubFilter === 'SETTLED') setSettlementSubFilter('SETTLED');
    }
  }, [claimsFilter]);

  // Synchronize dashboard stage filter if routed with stageFilter
  useEffect(() => {
    if (claimsFilter?.stageFilter) {
      if (currentView === 'PENDING') {
        setPendingStageFilter(claimsFilter.stageFilter);
      } else {
        setStageFilter(String(claimsFilter.stageFilter));
      }
    }
  }, [claimsFilter, currentView]);

  const switchView = (targetView) => {
    if (targetView === 'PENDING') {
      setActiveTab('claims-pending');
      if (setClaimsFilter) setClaimsFilter((prev) => ({ ...prev, subTab: 'PENDING' }));
    } else if (targetView === 'SETTLEMENTS') {
      setActiveTab('claims-settlements');
      if (setClaimsFilter) setClaimsFilter((prev) => ({ ...prev, subTab: 'SETTLEMENTS' }));
    } else {
      setActiveTab('claims');
      if (setClaimsFilter) setClaimsFilter((prev) => ({ ...prev, subTab: 'ALL', stageFilter: null, settlementSubFilter: 'ALL' }));
    }
  };

  // Enriched claim records with all calculated metrics
  const enrichedRecords = useMemo(() => {
    return claims.map((c, index) => {
      const settled = isSettled(c);
      const rejected = isRejected(c);
      const daysRem = calculateDaysRemaining(c.settlementDueDate);
      const daysPend = calculateDaysPending(c.incidentDate);

      let statusLabel = 'Registered';
      if (settled) statusLabel = 'Settled';
      else if (rejected) statusLabel = 'Rejected';
      else if (c.currentStage === 3 && c.stageDetails?.stage3?.completed) statusLabel = 'Settlement Pending';
      else if (c.currentStage === 3) statusLabel = 'Survey In Progress';
      else if (c.currentStage === 2) statusLabel = 'Documents Pending';
      else statusLabel = 'Registered';

      let stageLabel = '01 Registered';
      if (c.currentStage === 2) stageLabel = '02 Documents';
      else if (c.currentStage === 3) stageLabel = '03 Survey/Review';
      else if (c.currentStage === 4) stageLabel = settled ? '04 Settled' : '04 Rejected';

      return {
        ...c,
        srNo: index + 1,
        isSettled: settled,
        isRejected: rejected,
        isResolved: settled || rejected,
        daysRemaining: daysRem,
        daysPending: daysPend,
        statusLabel,
        stageLabel,
        requestedAmount: c.claimAmountRequested || 35000,
        settledAmount: c.stageDetails?.stage4?.settledAmount || (settled ? (c.claimAmountRequested ? c.claimAmountRequested - 2500 : 32500) : 0),
        bankRefNo: c.stageDetails?.stage4?.bankRefNo || (settled ? 'NEFT-AXIS-882190' : ''),
        settlementDate: c.stageDetails?.stage4?.settlementDate || (settled ? '28/08/2026' : '')
      };
    });
  }, [claims, today]);

  // Global Counts for Badges & Tabs
  const totalCount = enrichedRecords.length;
  const pendingRecords = useMemo(() => enrichedRecords.filter((r) => !r.isResolved), [enrichedRecords]);
  const pendingCount = pendingRecords.length;

  const stage1PendingCount = useMemo(() => pendingRecords.filter((r) => r.currentStage === 1).length, [pendingRecords]);
  const stage2PendingCount = useMemo(() => pendingRecords.filter((r) => r.currentStage === 2).length, [pendingRecords]);
  const stage3PendingCount = useMemo(() => pendingRecords.filter((r) => r.currentStage === 3).length, [pendingRecords]);

  const settledRecords = useMemo(() => enrichedRecords.filter((r) => r.isSettled), [enrichedRecords]);
  const settledCount = settledRecords.length;
  const rejectedCount = useMemo(() => enrichedRecords.filter((r) => r.isRejected).length, [enrichedRecords]);

  // SLA counts for unsettled claims within <= 7 days
  const activeSlaRecords = useMemo(() => pendingRecords.filter((r) => r.daysRemaining <= 7), [pendingRecords]);
  const overdueRecords = useMemo(() => activeSlaRecords.filter((r) => r.daysRemaining < 0), [activeSlaRecords]);
  const dueTodayRecords = useMemo(() => activeSlaRecords.filter((r) => r.daysRemaining === 0), [activeSlaRecords]);
  const dueSoonRecords = useMemo(() => activeSlaRecords.filter((r) => r.daysRemaining > 0 && r.daysRemaining <= 7), [activeSlaRecords]);

  // Filtered view data based on current tab
  const displayRecords = useMemo(() => {
    const term = (searchInputValue || globalSearch || '').trim().toLowerCase();

    // VIEW 1: ALL CLAIMS
    if (currentView === 'ALL') {
      let list = enrichedRecords;

      if (insurerFilter !== 'ALL') {
        list = list.filter((r) => r.companyName?.toLowerCase().includes(insurerFilter.toLowerCase()));
      }
      if (stageFilter !== 'ALL') {
        list = list.filter((r) => r.currentStage === Number(stageFilter));
      }
      if (statusFilter !== 'ALL') {
        list = list.filter((r) => r.statusLabel.toLowerCase() === statusFilter.toLowerCase());
      }
      if (term) {
        list = list.filter(
          (r) =>
            r.id.toLowerCase().includes(term) ||
            r.clientName?.toLowerCase().includes(term) ||
            r.policyId?.toLowerCase().includes(term) ||
            r.vehicleNumber?.toLowerCase().includes(term) ||
            r.companyName?.toLowerCase().includes(term)
        );
      }
      return list;
    }

    // VIEW 2: PENDING CLAIMS (Strictly unresolved)
    if (currentView === 'PENDING') {
      let list = pendingRecords; // Settled and rejected are strictly excluded!

      if (pendingStageFilter !== null) {
        list = list.filter((r) => r.currentStage === pendingStageFilter);
      }
      if (term) {
        list = list.filter(
          (r) =>
            r.id.toLowerCase().includes(term) ||
            r.clientName?.toLowerCase().includes(term) ||
            r.policyId?.toLowerCase().includes(term) ||
            r.vehicleNumber?.toLowerCase().includes(term) ||
            r.companyName?.toLowerCase().includes(term)
        );
      }
      return list;
    }

    // VIEW 3: SETTLEMENT TRACKING
    if (currentView === 'SETTLEMENTS') {
      let list = [];

      if (settlementSubFilter === 'SETTLED') {
        list = settledRecords; // Dedicated archive history
      } else if (settlementSubFilter === 'OVERDUE') {
        list = overdueRecords;
      } else if (settlementSubFilter === 'DUE_TODAY') {
        list = dueTodayRecords;
      } else if (settlementSubFilter === 'DUE_SOON') {
        list = dueSoonRecords;
      } else {
        // ALL_ACTIVE: All unsettled claims in SLA window
        list = activeSlaRecords;
      }

      if (term) {
        list = list.filter(
          (r) =>
            r.id.toLowerCase().includes(term) ||
            r.clientName?.toLowerCase().includes(term) ||
            r.policyId?.toLowerCase().includes(term) ||
            r.companyName?.toLowerCase().includes(term)
        );
      }
      return list;
    }

    return enrichedRecords;
  }, [
    currentView,
    enrichedRecords,
    pendingRecords,
    settledRecords,
    activeSlaRecords,
    overdueRecords,
    dueTodayRecords,
    dueSoonRecords,
    insurerFilter,
    stageFilter,
    statusFilter,
    pendingStageFilter,
    settlementSubFilter,
    searchInputValue,
    globalSearch
  ]);

  const handleSelectRecord = (record, andScroll = false) => {
    setSelectedClaimId(record.id);
    if (andScroll && docketRef.current) {
      docketRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleResetFilters = () => {
    setSearchInputValue('');
    if (setGlobalSearch) setGlobalSearch('');
    setInsurerFilter('ALL');
    setStageFilter('ALL');
    setStatusFilter('ALL');
    setPendingStageFilter(null);
    setSettlementSubFilter('ALL_ACTIVE');
    if (setClaimsFilter) {
      setClaimsFilter({ subTab: 'ALL', settlementSubFilter: 'ALL', stageFilter: null });
    }
  };

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-8">
      {/* 1. Operations Sub-Navigation Bar */}
      <OperationsSubNavBar activeItem="claims" />

      {/* 2. Top View Switcher — 3 Genuinely Distinct Operational Modes */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <h1 className="text-base font-black text-slate-900 tracking-tight">
                Claims Management Portal
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-carrier claims operations, IRDAI SLA tracking, and 4-stage settlement dockets
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowRegisterClaimModal(true)}
            className="text-xs font-bold bg-[#1E4E8C] hover:bg-[#0B1E3D] self-start sm:self-auto cursor-pointer"
          >
            + Register New Claim
          </Button>
        </div>

        {/* 3 Dedicated Operational Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
          {/* Tab 1: All Claims */}
          <button
            type="button"
            onClick={() => switchView('ALL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              currentView === 'ALL'
                ? 'bg-[#0B1E3D] text-white border-[#0B1E3D] shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Claims</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                currentView === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Tab 2: Pending Claims */}
          <button
            type="button"
            onClick={() => switchView('PENDING')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              currentView === 'PENDING'
                ? 'bg-[#D97706] text-white border-[#D97706] shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100/70 text-amber-900 border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Claims</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                currentView === 'PENDING' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          {/* Tab 3: Settlement Tracking */}
          <button
            type="button"
            onClick={() => switchView('SETTLEMENTS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              currentView === 'SETTLEMENTS'
                ? 'bg-[#1E4E8C] text-white border-[#1E4E8C] shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100/70 text-blue-900 border-blue-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Settlement Tracking</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                currentView === 'SETTLEMENTS' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-900'
              }`}
            >
              {activeSlaRecords.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. VIEW-SPECIFIC SECTION */}

      {/* ========================================================= */}
      {/* VIEW 1: ALL CLAIMS REPOSITORY */}
      {/* ========================================================= */}
      {currentView === 'ALL' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>All Claims Repository</span>
                <span className="text-xs font-bold text-slate-500 lowercase">
                  ({displayRecords.length} shown of {totalCount} total)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Consolidated master ledger of all claims across all stages, insurers, and resolution outcomes.
              </p>
            </div>

            {/* Quick Status Breakdown Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                {pendingCount} Pending
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {settledCount} Settled
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
                {rejectedCount} Rejected
              </span>
            </div>
          </div>

          {/* Search & Multi-dropdown Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
            <div className="md:col-span-2 relative">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Quick Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  placeholder="Search by Claim ID, Customer, Policy, Vehicle..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                {searchInputValue && (
                  <button
                    type="button"
                    onClick={() => setSearchInputValue('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Insurer Partner
              </label>
              <select
                value={insurerFilter}
                onChange={(e) => setInsurerFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                <option value="ALL">All Insurers</option>
                <option value="New India">New India Assurance</option>
                <option value="HDFC ERGO">HDFC ERGO</option>
                <option value="Tata AIG">Tata AIG</option>
                <option value="ICICI Lombard">ICICI Lombard</option>
                <option value="Star Health">Star Health</option>
                <option value="Bajaj Allianz">Bajaj Allianz</option>
                <option value="United India">United India</option>
                <option value="Oriental">Oriental Insurance</option>
                <option value="Care Health">Care Health</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Stage
              </label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
              >
                <option value="ALL">All Stages (1-4)</option>
                <option value="1">Stage 1: Registered</option>
                <option value="2">Stage 2: Documents</option>
                <option value="3">Stage 3: Survey / Review</option>
                <option value="4">Stage 4: Settlement</option>
              </select>
            </div>

            <div className="flex items-end gap-1.5">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Claim Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Registered">Registered</option>
                  <option value="Documents Pending">Documents Pending</option>
                  <option value="Survey In Progress">Survey In Progress</option>
                  <option value="Settlement Pending">Settlement Pending</option>
                  <option value="Settled">Settled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset filters"
                className="p-2 border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* VIEW 1 TABLE: Columns = Claim ID | Customer | Policy | Claim Type | Stage | Status | Action */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 border-r border-slate-800">SR.NO</th>
                  <th className="py-2.5 px-3 border-r border-slate-800">CLAIM ID</th>
                  <th className="py-2.5 px-3 border-r border-slate-800">CUSTOMER</th>
                  <th className="py-2.5 px-3 border-r border-slate-800">POLICY</th>
                  <th className="py-2.5 px-3 border-r border-slate-800">CLAIM TYPE</th>
                  <th className="py-2.5 px-3 border-r border-slate-800">STAGE</th>
                  <th className="py-2.5 px-3 border-r border-slate-800">STATUS</th>
                  <th className="py-2.5 px-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayRecords.length > 0 ? (
                  displayRecords.map((r) => {
                    const isSelected = selectedClaim?.id === r.id;

                    return (
                      <tr
                        key={r.id}
                        onClick={() => handleSelectRecord(r)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-500">{r.srNo}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-blue-700">{r.id}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(r.id, e)}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy Claim ID"
                            >
                              {copiedId === r.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{r.incidentDate || 'Incident Logged'}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{r.clientName}</span>
                          <span className="text-[10px] font-mono text-slate-500">{r.phone || '+91 94440 00000'}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-slate-900 block">{r.policyId}</span>
                          <span className="text-[10px] text-slate-600">{r.companyName}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-800 block truncate max-w-[160px]">
                            {r.policyType || 'Motor Insurance'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{r.vehicleNumber}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              r.currentStage === 4
                                ? r.isSettled
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                                : r.currentStage === 3
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : r.currentStage === 2
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {r.stageLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                              r.statusLabel === 'Settled'
                                ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300'
                                : r.statusLabel === 'Rejected'
                                ? 'bg-rose-100/80 text-rose-900 border-rose-300'
                                : r.statusLabel === 'Settlement Pending'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : r.statusLabel === 'Survey In Progress'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : r.statusLabel === 'Documents Pending'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {r.statusLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectRecord(r, true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                          >
                            <span>View Docket</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                      No claims match the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: PENDING CLAIMS OPERATIONAL QUEUE */}
      {/* ========================================================= */}
      {currentView === 'PENDING' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Pending Claims Operational Queue
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px]">
                  {pendingCount} Active Unresolved
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Worklist of claims awaiting documents, surveyor inspection, or broker sanction. Settled and closed claims are strictly excluded.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* Operational Stage KPI Filter Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPendingStageFilter(null)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                pendingStageFilter === null
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">All Pending</div>
              <div className="text-xl font-black mt-0.5">{pendingCount}</div>
              <div className="text-[10px] opacity-80 mt-0.5">Total unresolved claims</div>
            </button>

            <button
              type="button"
              onClick={() => setPendingStageFilter(1)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                pendingStageFilter === 1
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-blue-50/50 hover:bg-blue-50 text-blue-950 border-blue-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Stage 1: Registered</div>
              <div className="text-xl font-black mt-0.5">{stage1PendingCount}</div>
              <div className="text-[10px] opacity-80 mt-0.5">Awaiting initial documents</div>
            </button>

            <button
              type="button"
              onClick={() => setPendingStageFilter(2)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                pendingStageFilter === 2
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                  : 'bg-indigo-50/50 hover:bg-indigo-50 text-indigo-950 border-indigo-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Stage 2: Documents</div>
              <div className="text-xl font-black mt-0.5">{stage2PendingCount}</div>
              <div className="text-[10px] opacity-80 mt-0.5">Scrutiny & carrier upload</div>
            </button>

            <button
              type="button"
              onClick={() => setPendingStageFilter(3)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                pendingStageFilter === 3
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-amber-50/50 hover:bg-amber-50 text-amber-950 border-amber-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Stage 3: Survey & Review</div>
              <div className="text-xl font-black mt-0.5">{stage3PendingCount}</div>
              <div className="text-[10px] opacity-80 mt-0.5">Loss assessment & audit</div>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative max-w-md pt-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="Filter pending claims by Customer, Claim ID, Policy..."
              className="w-full pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            {searchInputValue && (
              <button
                type="button"
                onClick={() => setSearchInputValue('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* VIEW 2 TABLE: Columns = Claim ID | Customer | Current Stage | Pending Since | Policy & Insurer | Amount | Action */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[#B45309] text-white font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 border-r border-amber-800">SR.NO</th>
                  <th className="py-2.5 px-3 border-r border-amber-800">CLAIM ID</th>
                  <th className="py-2.5 px-3 border-r border-amber-800">CUSTOMER</th>
                  <th className="py-2.5 px-3 border-r border-amber-800">CURRENT STAGE</th>
                  <th className="py-2.5 px-3 border-r border-amber-800">PENDING SINCE</th>
                  <th className="py-2.5 px-3 border-r border-amber-800">POLICY & INSURER</th>
                  <th className="py-2.5 px-3 border-r border-amber-800">AMOUNT</th>
                  <th className="py-2.5 px-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayRecords.length > 0 ? (
                  displayRecords.map((r) => {
                    const isSelected = selectedClaim?.id === r.id;

                    return (
                      <tr
                        key={r.id}
                        onClick={() => handleSelectRecord(r)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50/70 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-500">{r.srNo}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-amber-900 block">{r.id}</span>
                          <span className="text-[10px] text-slate-500">Log Date: {r.incidentDate || '16/09/2026'}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{r.clientName}</span>
                          <span className="text-[10px] font-mono text-slate-500">{r.phone || '+91 94440 00000'}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="font-bold text-slate-800">
                              {r.currentStage === 1
                                ? 'Stage 1: Registered Docket'
                                : r.currentStage === 2
                                ? 'Stage 2: Documents & Submission'
                                : 'Stage 3: Survey & Assessment'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                            {r.stageDetails?.[`stage${r.currentStage}`]?.status || 'In Progress'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              r.daysPending > 14
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : r.daysPending > 7
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {r.daysPending} days pending
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-semibold text-slate-800 block">{r.policyId}</span>
                          <span className="text-[10px] text-slate-500">{r.companyName}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          ₹{r.requestedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectRecord(r, true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold text-white bg-[#B45309] hover:bg-[#92400E] shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>Process Claim</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                      No pending claims found in this queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: SETTLEMENT TRACKING & SLA COMPLIANCE */}
      {/* ========================================================= */}
      {currentView === 'SETTLEMENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Fast-Track Settlement Tracking (7-Day IRDAI SLA)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-extrabold text-[10px]">
                  {activeSlaRecords.length} Active SLA Items
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring 7-day turnaround fast-track settlements, garage repair payments, and insured account disbursals.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset SLA Filters</span>
            </button>
          </div>

          {/* SLA Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSettlementSubFilter('OVERDUE')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                settlementSubFilter === 'OVERDUE'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50/60 hover:bg-rose-50 text-rose-950 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-90">
                <span>Overdue (&gt;7 Days)</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <div className="text-xl font-black mt-0.5">{overdueRecords.length}</div>
              <div className="text-[10px] opacity-80 mt-0.5">Requires broker escalation</div>
            </button>

            <button
              type="button"
              onClick={() => setSettlementSubFilter('DUE_TODAY')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                settlementSubFilter === 'DUE_TODAY'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-amber-50/60 hover:bg-amber-50 text-amber-950 border-amber-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Due Today</div>
              <div className="text-xl font-black mt-0.5">{dueTodayRecords.length}</div>
              <div className="text-[10px] opacity-80 mt-0.5">IRDAI SLA deadline today</div>
            </button>

            <button
              type="button"
              onClick={() => setSettlementSubFilter('DUE_SOON')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                settlementSubFilter === 'DUE_SOON'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-blue-50/60 hover:bg-blue-50 text-blue-950 border-blue-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Due in 1–7 Days</div>
              <div className="text-xl font-black mt-0.5">{dueSoonRecords.length}</div>
              <div className="text-[10px] opacity-80 mt-0.5">Within SLA window</div>
            </button>

            <button
              type="button"
              onClick={() => setSettlementSubFilter('SETTLED')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                settlementSubFilter === 'SETTLED'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50/60 hover:bg-emerald-50 text-emerald-950 border-emerald-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Settled History</div>
              <div className="text-xl font-black mt-0.5">{settledCount}</div>
              <div className="text-[10px] opacity-80 mt-0.5">Disbursed voucher archive</div>
            </button>
          </div>

          {/* Sub-Filter Tabs Switcher for Settlement Tracking */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setSettlementSubFilter('ALL_ACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settlementSubFilter === 'ALL_ACTIVE'
                    ? 'bg-[#1E4E8C] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Active SLA ({activeSlaRecords.length})
              </button>

              <button
                type="button"
                onClick={() => setSettlementSubFilter('OVERDUE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settlementSubFilter === 'OVERDUE'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Overdue ({overdueRecords.length})
              </button>

              <button
                type="button"
                onClick={() => setSettlementSubFilter('DUE_TODAY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settlementSubFilter === 'DUE_TODAY'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Due Today ({dueTodayRecords.length})
              </button>

              <button
                type="button"
                onClick={() => setSettlementSubFilter('DUE_SOON')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settlementSubFilter === 'DUE_SOON'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Due in 1–7 Days ({dueSoonRecords.length})
              </button>

              <button
                type="button"
                onClick={() => setSettlementSubFilter('SETTLED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settlementSubFilter === 'SETTLED'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Settled / History ({settledCount})
              </button>
            </div>

            {/* Search within Settlement Tracking */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                placeholder="Search docket or client..."
                className="w-full pl-8 pr-7 py-1 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {searchInputValue && (
                <button
                  type="button"
                  onClick={() => setSearchInputValue('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* VIEW 3 TABLE: Columns = Claim ID | Customer | Claim Amount | Due Date | Days Left | Settlement Status | Action */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-[#1E4E8C] text-white font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 border-r border-blue-900">SR.NO</th>
                  <th className="py-2.5 px-3 border-r border-blue-900">CLAIM ID</th>
                  <th className="py-2.5 px-3 border-r border-blue-900">CUSTOMER</th>
                  <th className="py-2.5 px-3 border-r border-blue-900">CLAIM AMOUNT</th>
                  <th className="py-2.5 px-3 border-r border-blue-900">DUE DATE</th>
                  <th className="py-2.5 px-3 border-r border-blue-900">DAYS LEFT / SLA</th>
                  <th className="py-2.5 px-3 border-r border-blue-900">SETTLEMENT STATUS</th>
                  <th className="py-2.5 px-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayRecords.length > 0 ? (
                  displayRecords.map((r) => {
                    const isSelected = selectedClaim?.id === r.id;

                    return (
                      <tr
                        key={r.id}
                        onClick={() => handleSelectRecord(r)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-500">{r.srNo}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-blue-800 block">{r.id}</span>
                          <span className="text-[10px] text-slate-500">{r.companyName}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{r.clientName}</span>
                          <span className="text-[10px] font-mono text-slate-500">{r.phone || '+91 94440 00000'}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-slate-900 block">
                            ₹{r.requestedAmount.toLocaleString('en-IN')}
                          </span>
                          {r.isSettled && (
                            <span className="text-[10px] font-mono text-emerald-700 block">
                              Sanctioned: ₹{r.settledAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-semibold text-slate-800 block">
                            {r.settlementDueDate ? r.settlementDueDate.split('-').reverse().join('/') : '18/09/2026'}
                          </span>
                          {r.isSettled && (
                            <span className="text-[10px] text-slate-500">Paid on {r.settlementDate}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {r.isSettled ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              <span>Settled ({r.settlementDate})</span>
                            </span>
                          ) : r.daysRemaining < 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 w-fit animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              <span>{Math.abs(r.daysRemaining)}d Overdue</span>
                            </span>
                          ) : r.daysRemaining === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Due Today</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1 w-fit">
                              <Calendar className="w-3 h-3 text-blue-700" />
                              <span>{r.daysRemaining} Days Left</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                              r.isSettled
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : r.daysRemaining < 0
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : r.daysRemaining === 0
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {r.isSettled ? 'Disbursed (NEFT)' : r.settlementStatus || 'Fast-Track SLA Active'}
                          </span>
                          {r.isSettled && r.bankRefNo && (
                            <span className="text-[10px] font-mono text-slate-500 block">{r.bankRefNo}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {r.isSettled ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectRecord(r, true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <span>View Voucher</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectRecord(r, true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-white bg-[#1E4E8C] hover:bg-[#0B1E3D] shadow-2xs transition-colors cursor-pointer"
                            >
                              <span>Disburse / Settle</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                      No records found in this settlement category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Go To Top button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-700 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-[#1E4E8C] text-white flex items-center justify-center shadow-xs">
            <ArrowUp className="w-3.5 h-3.5" />
          </div>
          <span>Back to Top</span>
        </button>
      </div>

      {/* 5. Comprehensive Enterprise Fast-Track Settlement Docket for Selected Claim */}
      {selectedClaim && (
        <div ref={docketRef} id="claim-pipeline-docket" className="scroll-mt-4">
          <ClaimDetailDocket
            claim={selectedClaim}
            onAdvanceStage={(id, stage, data) => updateClaimStage(id, stage, data)}
            onUpdateDocument={updateClaimDocument}
            onAddBill={addClaimBill}
            onAddFollowUp={addClaimFollowUp}
            onUpdateSettlement={updateClaimSettlement}
            onRegisterNewClaim={() => setShowRegisterClaimModal(true)}
          />
        </div>
      )}
    </div>
  );
}

export default ClaimsPage;
