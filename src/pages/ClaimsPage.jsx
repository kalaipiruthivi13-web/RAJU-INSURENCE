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
  FileSpreadsheet,
  Filter
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import OperationsSubNavBar from '../components/layout/OperationsSubNavBar';
import ClaimDetailDocket from '../components/claims/ClaimDetailDocket';
import Button from '../components/ui/Button';
import { claimsService } from '../services/claimsService';

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
    deleteClaimBill,
    addClaimFollowUp,
    updateClaimSettlement,
    globalSearch,
    setGlobalSearch,
    showRegisterClaimModal,
    setShowRegisterClaimModal,
    activeTab,
    setActiveTab
  } = useAppData();

  useEffect(() => {
    if (activeTab === 'claims-new') {
      setShowRegisterClaimModal(true);
    }
  }, [activeTab, setShowRegisterClaimModal]);

  const docketRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  // Search input state
  const [searchInputValue, setSearchInputValue] = useState('');

  // Dropdown filter states (Section 7)
  const [insurerFilter, setInsurerFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [claimTypeFilter, setClaimTypeFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sub-filter for Pending Claims (by stage: null | 1 | 2 | 3)
  const [pendingStageFilter, setPendingStageFilter] = useState(null);

  // Sub-filter for Settlement Tracking ('ALL_PROCESSING' | 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON')
  const [settlementSubFilter, setSettlementSubFilter] = useState('ALL_PROCESSING');

  // Base Date
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
      else setSettlementSubFilter('ALL_PROCESSING');
    }
  }, [claimsFilter]);

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
      const isClosed = claimsService.isClaimClosed(c);
      const isSettlement = claimsService.isInSettlementProcessing(c);
      const pendingInfo = claimsService.getPendingInfo(c);

      const targetDueDate = c.settlementTargetDate || c.settlementDueDate || c.settlement?.internalDueDate;
      const daysRem = calculateDaysRemaining(targetDueDate);

      let statusLabel = c.settlement?.status || c.settlementStatus || c.status || 'Open';
      if (isClosed) {
        statusLabel = c.status === 'Rejected' || c.settlement?.status === 'Rejected' ? 'Rejected' : 'Settled';
      }

      let stageLabel = `0${c.stage || 1} Stage`;
      if (c.stage === 1) stageLabel = '01 Registered';
      else if (c.stage === 2) stageLabel = '02 Documents';
      else if (c.stage === 3) stageLabel = '03 Survey/Review';
      else if (c.stage === 4) stageLabel = isClosed && statusLabel === 'Rejected' ? '04 Rejected' : '04 Settlement';

      return {
        ...c,
        srNo: index + 1,
        claimNo: c.claimNo || c.id,
        customerName: c.customerName || c.clientName,
        policyNo: c.policyNo || c.policyNumber || c.policyId,
        insuranceCompany: c.insuranceCompany || c.companyName,
        isClosed,
        isSettlement,
        isPending: pendingInfo.isPending,
        pendingReason: pendingInfo.reason,
        daysRemaining: daysRem,
        statusLabel,
        stageLabel,
        requestedAmount: c.estimatedLoss || c.claimAmountRequested || 35000,
        approvedAmount: c.settlement?.approvedAmount || 0,
        bankRefNo: c.settlement?.paymentReference || '',
        internalTarget: targetDueDate || '7-Day SLA',
        lastUpdated: c.lastUpdated || c.updatedAt || c.incidentDate || 'Today'
      };
    });
  }, [claims, today]);

  // Counts based on strict mutual exclusivity (Section 7)
  const totalCount = enrichedRecords.length;
  const pendingRecords = useMemo(() => enrichedRecords.filter((r) => r.isPending), [enrichedRecords]);
  const settlementRecords = useMemo(() => enrichedRecords.filter((r) => r.isSettlement), [enrichedRecords]);

  // Comprehensive Multi-Filtered records (Section 7)
  const displayRecords = useMemo(() => {
    const term = (searchInputValue || globalSearch || '').trim().toLowerCase();

    // 1. Base view dataset (Strict Mutual Exclusivity)
    let list = enrichedRecords;
    if (currentView === 'PENDING') {
      list = pendingRecords;
    } else if (currentView === 'SETTLEMENTS') {
      if (settlementSubFilter === 'OVERDUE') {
        list = settlementRecords.filter((r) => r.daysRemaining < 0);
      } else if (settlementSubFilter === 'DUE_TODAY') {
        list = settlementRecords.filter((r) => r.daysRemaining === 0);
      } else if (settlementSubFilter === 'DUE_SOON') {
        list = settlementRecords.filter((r) => r.daysRemaining > 0 && r.daysRemaining <= 7);
      } else {
        list = settlementRecords; // ALL_PROCESSING
      }
    }

    // 2. Multi-Filters (applied across all views)
    if (insurerFilter !== 'ALL') {
      list = list.filter((r) => (r.insuranceCompany || '').toLowerCase().includes(insurerFilter.toLowerCase()));
    }
    if (stageFilter !== 'ALL') {
      list = list.filter((r) => r.stage === Number(stageFilter));
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((r) => {
        const s = (r.statusLabel || '').toLowerCase();
        return s === statusFilter.toLowerCase();
      });
    }
    if (productFilter !== 'ALL') {
      list = list.filter((r) => (r.policyType || '').toLowerCase().includes(productFilter.toLowerCase()));
    }
    if (employeeFilter !== 'ALL') {
      list = list.filter((r) => (r.assignedEmployee || '').toLowerCase().includes(employeeFilter.toLowerCase()));
    }
    if (claimTypeFilter !== 'ALL') {
      list = list.filter((r) => (r.claimType || '').toLowerCase().includes(claimTypeFilter.toLowerCase()));
    }
    if (dateFrom) {
      list = list.filter((r) => r.incidentDate && r.incidentDate >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((r) => r.incidentDate && r.incidentDate <= dateTo);
    }
    if (term) {
      list = list.filter(
        (r) =>
          (r.claimNo || '').toLowerCase().includes(term) ||
          (r.customerName || '').toLowerCase().includes(term) ||
          (r.policyNo || '').toLowerCase().includes(term) ||
          (r.vehicleNo || '').toLowerCase().includes(term) ||
          (r.insuranceCompany || '').toLowerCase().includes(term)
      );
    }

    return list;
  }, [
    enrichedRecords,
    currentView,
    pendingRecords,
    settlementRecords,
    settlementSubFilter,
    insurerFilter,
    stageFilter,
    statusFilter,
    productFilter,
    employeeFilter,
    claimTypeFilter,
    dateFrom,
    dateTo,
    searchInputValue,
    globalSearch
  ]);

  // Selected claim object
  const selectedClaim = useMemo(() => {
    if (!selectedClaimId) return null;
    return claims.find((c) => (c.claimNo === selectedClaimId || c.id === selectedClaimId)) || null;
  }, [claims, selectedClaimId]);

  const handleSelectRecord = (record, scrollToView = false) => {
    setSelectedClaimId(record.claimNo || record.id);
    if (scrollToView && docketRef.current) {
      setTimeout(() => {
        docketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleResetFilters = () => {
    setSearchInputValue('');
    setInsurerFilter('ALL');
    setStageFilter('ALL');
    setStatusFilter('ALL');
    setProductFilter('ALL');
    setEmployeeFilter('ALL');
    setClaimTypeFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setSettlementSubFilter('ALL_PROCESSING');
    if (setGlobalSearch) setGlobalSearch('');
  };

  return (
    <div className="space-y-4">
      {/* 1. OPERATIONS SUB-NAVIGATION BAR */}
      <OperationsSubNavBar />

      {/* 2. DOCKET VIEW MODE SWITCHER & HEADER */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-700" />
              <span>Claims Operations Command Center</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              4-Stage Fast-Track Settlement Pipeline &bull; Motor & Health Products
            </p>
          </div>

          {/* Top 3 Differentiated Views (Section 7) */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => switchView('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'ALL'
                  ? 'bg-[#1E4E8C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Claims</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${currentView === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => switchView('PENDING')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending Claims</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${currentView === 'PENDING' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 font-bold'}`}>
                {pendingRecords.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => switchView('SETTLEMENTS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'SETTLEMENTS'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Settlement Tracking</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${currentView === 'SETTLEMENTS' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900 font-bold'}`}>
                {settlementRecords.length}
              </span>
            </button>
          </div>
        </div>

        {/* Settlement Tracking Sub-filters (Section 7) */}
        {currentView === 'SETTLEMENTS' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Settlement Sub-Filters:
            </span>

            {[
              { id: 'ALL_PROCESSING', label: 'All Processing', count: settlementRecords.length },
              { id: 'OVERDUE', label: 'Overdue SLA', count: settlementRecords.filter((r) => r.daysRemaining < 0).length },
              { id: 'DUE_TODAY', label: 'Due Today', count: settlementRecords.filter((r) => r.daysRemaining === 0).length },
              { id: 'DUE_SOON', label: 'Due in 1-7 Days', count: settlementRecords.filter((r) => r.daysRemaining > 0 && r.daysRemaining <= 7).length }
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSettlementSubFilter(sub.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  settlementSubFilter === sub.id
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{sub.label}</span>
                <span className="font-mono text-[10px] opacity-80 font-bold">({sub.count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. MULTI-FILTER CONTROLS BAR (Section 7) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="Search Claim No, Customer, Policy, Vehicle..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchInputValue && (
              <button
                type="button"
                onClick={() => setSearchInputValue('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* 6 Multi-Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {/* 1. Product Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Product</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Products</option>
              <option value="Motor">Motor Insurance</option>
              <option value="Health">Health Insurance</option>
            </select>
          </div>

          {/* 2. Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Submitted to Insurer">Submitted to Insurer</option>
              <option value="Survey Pending">Survey Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Settled">Settled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* 3. Insurer Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Insurer</label>
            <select
              value={insurerFilter}
              onChange={(e) => setInsurerFilter(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Insurers</option>
              <option value="HDFC">HDFC ERGO</option>
              <option value="ICICI">ICICI Lombard</option>
              <option value="Bajaj">Bajaj Allianz</option>
              <option value="New India">New India Assurance</option>
              <option value="Star">Star Health</option>
              <option value="Care">Care Health</option>
            </select>
          </div>

          {/* 4. Employee Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Assigned To</label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Staff</option>
              <option value="Priya">K. Priya</option>
              <option value="Suresh">S. Suresh</option>
              <option value="Deepika">M. Deepika</option>
            </select>
          </div>

          {/* 5. Date Range From */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
            />
          </div>

          {/* 6. Date Range To */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 4. TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>
                {currentView === 'ALL' && 'All Claims Repository'}
                {currentView === 'PENDING' && 'Pending Unresolved Claims'}
                {currentView === 'SETTLEMENTS' && 'Settlement Tracking Pipeline'}
              </span>
              <span className="text-xs font-bold text-blue-600">
                ({displayRecords.length} visible rows)
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {currentView === 'ALL' && 'Full ledger of claims across all stages and statuses.'}
              {currentView === 'PENDING' && 'Active unresolved pipeline with pending action. Mutually exclusive from Settlement Tracking.'}
              {currentView === 'SETTLEMENTS' && 'Claims under review or approved awaiting settlement. Mutually exclusive from Pending Claims.'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowRegisterClaimModal(true)}
              className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-white cursor-pointer"
            >
              Register New Claim
            </Button>
          </div>
        </div>

        {/* 15 COLUMNS: Claim No, Customer, Policy No, Insurer, Product, Claim Type, Incident Date, Claim Amount, Stage, Status/Pending Reason, Assigned To, Next Follow-up, Internal Settlement Target, Last Updated, Action */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3 border-r border-slate-800">Claim No</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Customer</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Policy No</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Insurer</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Product</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Claim Type</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Incident Date</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Claim Amount</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Stage</th>
                <th className="py-2.5 px-3 border-r border-slate-800">
                  {currentView === 'PENDING' ? 'Pending Reason' : 'Status'}
                </th>
                <th className="py-2.5 px-3 border-r border-slate-800">Assigned To</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Next Follow-up</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Internal Target</th>
                <th className="py-2.5 px-3 border-r border-slate-800">Last Updated</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRecords.length > 0 ? (
                displayRecords.map((r) => {
                  const isSelected = selectedClaim?.claimNo === r.claimNo || selectedClaim?.id === r.claimNo;

                  return (
                    <tr
                      key={r.claimNo || r.id}
                      onClick={() => handleSelectRecord(r)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* 1. Claim No */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-blue-700">{r.claimNo}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(r.claimNo, e)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Copy Claim ID"
                          >
                            {copiedId === r.claimNo ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* 2. Customer */}
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{r.customerName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{r.mobile}</span>
                      </td>

                      {/* 3. Policy No */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {r.policyNo}
                      </td>

                      {/* 4. Insurer */}
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {r.insuranceCompany}
                      </td>

                      {/* 5. Product */}
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {r.policyType || 'Motor'}
                      </td>

                      {/* 6. Claim Type */}
                      <td className="py-2.5 px-3 text-slate-700">
                        {r.claimType || 'motor-accident'}
                      </td>

                      {/* 7. Incident Date */}
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {r.incidentDate}
                      </td>

                      {/* 8. Claim Amount */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        ₹{(r.requestedAmount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* 9. Stage */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.stage === 4
                              ? r.isClosed && r.statusLabel === 'Settled'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                              : r.stage === 3
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : r.stage === 2
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {r.stageLabel}
                        </span>
                      </td>

                      {/* 10. Status / Pending Reason */}
                      <td className="py-2.5 px-3">
                        {currentView === 'PENDING' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                            {r.pendingReason || 'Action Pending'}
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              r.statusLabel === 'Settled'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : r.statusLabel === 'Approved'
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                : r.statusLabel === 'Under Review'
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : r.statusLabel === 'Rejected'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            {r.statusLabel}
                          </span>
                        )}
                      </td>

                      {/* 11. Assigned To */}
                      <td className="py-2.5 px-3 text-slate-700">
                        {r.assignedEmployee || 'K. Priya'}
                      </td>

                      {/* 12. Next Follow-up */}
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {r.nextFollowUpDate || '-'}
                      </td>

                      {/* 13. Internal Settlement Target */}
                      <td className="py-2.5 px-3 font-mono text-slate-800">
                        {r.internalTarget}
                      </td>

                      {/* 14. Last Updated */}
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {r.lastUpdated}
                      </td>

                      {/* 15. Action */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRecord(r, true);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          Open Docket
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-400">
                    No claims match the active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MOUNTED DOSSIER DOCKET */}
      {selectedClaim && (
        <div ref={docketRef} className="pt-2">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Active Claim Docket: {selectedClaim.claimNo || selectedClaim.id}</span>
              <span className="text-[10px] text-slate-500 lowercase font-normal">(opened in detailed view)</span>
            </h3>
            <button
              type="button"
              onClick={() => setSelectedClaimId(null)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Docket View</span>
            </button>
          </div>

          <ClaimDetailDocket
            claim={selectedClaim}
            onAdvanceStage={updateClaimStage}
            onUpdateDocument={updateClaimDocument}
            onAddBill={addClaimBill}
            onDeleteBill={deleteClaimBill}
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
