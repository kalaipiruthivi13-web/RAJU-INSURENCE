import React, { useState, useMemo } from 'react';
import {
  Clock,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Plus,
  Truck,
  Coins,
  FileCheck2,
  FilePlus2,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import InsurancePerformanceChart from '../components/dashboard/InsurancePerformanceChart';

export function DashboardPage() {
  const {
    claims,
    policies,
    quotes,
    setActiveTab,
    navigateToClaim,
    navigateToClaimsWithFilter,
    setShowRegisterClaimModal,
    setShowTowingModal,
    currentUser
  } = useAppData();

  // 7-Day Settlement Calculations (Dynamic & Reactive)
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

  // Helper to test if claim is settled, closed, completed, or rejected
  const isClaimSettledOrCompleted = (c) => {
    const stage4 = c.stageDetails?.stage4;
    return (
      c.settlementStatus === 'Settled' ||
      c.settlementStatus === 'Closed' ||
      c.settlementStatus === 'Completed' ||
      c.settlementStatus === 'Rejected' ||
      c.status === 'Settled' ||
      c.status === 'Closed' ||
      c.status === 'Completed' ||
      c.status === 'Rejected' ||
      (c.currentStage === 4 && (
        stage4?.status === 'Settled' ||
        stage4?.status === 'Closed' ||
        stage4?.status === 'Completed' ||
        stage4?.status === 'Rejected' ||
        stage4?.completed
      ))
    );
  };

  // Dynamic 7-day settlement unsettled items
  const settlementAlerts = useMemo(() => {
    const unsettled = claims.filter((c) => !isClaimSettledOrCompleted(c));

    const items = [];
    let overdueCount = 0;
    let dueTodayCount = 0;
    let dueSoonCount = 0;

    unsettled.forEach((c) => {
      const days = calculateDaysRemaining(c.settlementDueDate);

      // Only within the <= 7 days window (including overdue)
      if (days <= 7) {
        let category = 'DUE_SOON';
        let dueLabel = `${days} Days`;

        if (days < 0) {
          category = 'OVERDUE';
          dueLabel = `${Math.abs(days)}d Overdue`;
          overdueCount++;
        } else if (days === 0) {
          category = 'DUE_TODAY';
          dueLabel = 'Today';
          dueTodayCount++;
        } else {
          category = 'DUE_SOON';
          dueLabel = `${days} Days`;
          dueSoonCount++;
        }

        items.push({
          id: c.id.replace('CLM-2024-', 'CLM-'),
          fullId: c.id,
          clientName: c.clientName,
          vehicleNumber: c.vehicleNumber || 'Motor Asset',
          companyName: c.companyName || 'Carrier',
          due: dueLabel,
          category,
          daysRemaining: days,
          amount: c.claimAmountRequested || 35000
        });
      }
    });

    // Sort: Overdue first, then Due Today, then Due Soon
    items.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return {
      items,
      overdueCount,
      dueTodayCount,
      dueSoonCount,
      totalAlerts: items.length
    };
  }, [claims, today]);

  // Overall Attention Counter
  const totalAttentionCount = settlementAlerts.totalAlerts + 4; // Settlements + urgent underwriting tasks

  return (
    <div className="space-y-3">
      {/* 1. TOP Welcome & Operational Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Broker Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Welcome back, <span className="font-bold text-slate-800">{currentUser?.name || 'Raju'}</span> •{' '}
            <span className="font-bold text-amber-600">{totalAttentionCount} items</span> require operational attention today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            IRDA/DB-784/21 • Active Session
          </span>
        </div>
      </div>

      {/* 2. COMPACT QUICK ACTIONS SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-2.5 sm:p-3">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Operational Quick Actions
          </span>
          <span className="text-[10px] text-slate-400">1-Click Dispatch & Intake</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Action 1: New Application */}
          <button
            type="button"
            onClick={() => setActiveTab('wizard')}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 hover:border-blue-300 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                New Application
              </p>
              <p className="text-[10px] text-slate-500 truncate">8-Step Policy Proposal</p>
            </div>
          </button>

          {/* Action 2: Register New Claim */}
          <button
            type="button"
            onClick={() => setShowRegisterClaimModal(true)}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 hover:border-amber-300 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <FilePlus2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 truncate">
                Register New Claim
              </p>
              <p className="text-[10px] text-slate-500 truncate">Fast-Track Docket</p>
            </div>
          </button>

          {/* Action 3: Towing Request */}
          <button
            type="button"
            onClick={() => setShowTowingModal(true)}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 hover:border-rose-300 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-md bg-rose-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-rose-700 truncate">
                Towing Request
              </p>
              <p className="text-[10px] text-slate-500 truncate">Emergency RSA Dispatch</p>
            </div>
          </button>

          {/* Action 4: Insurance Loan */}
          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className="flex items-center gap-2.5 p-2 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 hover:border-emerald-300 transition-all text-left group cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Coins className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                Insurance Loan
              </p>
              <p className="text-[10px] text-slate-500 truncate">Active & EMI Repayments</p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. KPI BAR (Compact Executive Vitals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Active Policies', value: policies?.length || '142', action: () => setActiveTab('policies'), color: '#2563EB', bg: '#F0F7FF', border: '#D0E3FF', sub: 'Across 15 Insurers' },
          { label: 'Claims in Progress', value: claims?.filter((c) => !isClaimSettledOrCompleted(c)).length || '32', action: () => navigateToClaimsWithFilter('PENDING'), color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', sub: 'Active Pipeline' },
          { label: 'Renewals Due', value: '76', action: () => setActiveTab('renewals'), color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', sub: 'Next 30 Days' },
          { label: 'Pending Quotes', value: quotes?.length || '18', action: () => setActiveTab('quotes'), color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', sub: 'Awaiting Sign-off' }
        ].map((k) => (
          <div
            key={k.label}
            onClick={k.action}
            className="p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs group hover:border-blue-400"
            style={{ backgroundColor: k.bg, borderColor: k.border }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 tracking-tight">{k.label}</span>
              <span className="text-[10px] font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: k.color }}>View →</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 leading-none tracking-tight">
              {k.value}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 4. INSURANCE PERFORMANCE CHART (Strictly Motor & Health Filter) */}
      <InsurancePerformanceChart />

      {/* 5. 7-DAY SETTLEMENT ALERTS (Primary Operational Alert — Dynamic & Unsettled Only) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                INTERNAL SETTLEMENT TARGET & SLA ALERTS
              </h2>
            </div>

            {/* Clickable SLA Filter Tags */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => navigateToClaimsWithFilter('SETTLEMENTS', 'OVERDUE')}
                title="Filter by Overdue claims"
                className="px-2 py-0.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                {settlementAlerts.overdueCount} Overdue
              </button>

              <button
                type="button"
                onClick={() => navigateToClaimsWithFilter('SETTLEMENTS', 'DUE_TODAY')}
                title="Filter by Due Today claims"
                className="px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 cursor-pointer transition-colors shadow-2xs"
              >
                {settlementAlerts.dueTodayCount} Due Today
              </button>

              <button
                type="button"
                onClick={() => navigateToClaimsWithFilter('SETTLEMENTS', 'DUE_SOON')}
                title="Filter by Due Soon claims (within 7 days)"
                className="px-2 py-0.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200 cursor-pointer transition-colors shadow-2xs"
              >
                {settlementAlerts.dueSoonCount} Due Soon
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateToClaimsWithFilter('SETTLEMENTS', 'DUE_7_DAYS')}
            className="text-xs font-bold text-[#2563EB] hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Settlement Tracking →</span>
          </button>
        </div>

        {/* Compact Settlement Table of Unsettled Claims */}
        {settlementAlerts.items.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-1.5 px-3">Docket ID</th>
                  <th className="py-1.5 px-3">Customer / Asset</th>
                  <th className="py-1.5 px-3">Carrier</th>
                  <th className="py-1.5 px-3">SLA Status</th>
                  <th className="py-1.5 px-3">Claim Amount</th>
                  <th className="py-1.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlementAlerts.items.map((item) => (
                  <tr
                    key={item.fullId}
                    onClick={() => navigateToClaim(item.fullId)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700 text-xs">
                      {item.id}
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="font-bold text-slate-900 text-xs">{item.clientName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono leading-none">{item.vehicleNumber}</span>
                    </td>
                    <td className="py-1.5 px-3 text-slate-600 font-medium text-xs">
                      {item.companyName}
                    </td>
                    <td className="py-1.5 px-3">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          item.category === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.category === 'DUE_TODAY'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.due}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 font-black text-slate-900 text-xs">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <span className="text-xs font-bold text-[#2563EB] hover:underline">
                        Track →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="font-bold text-slate-700">No overdue or pending settlements in the 7-day window</p>
            <p className="text-[11px] text-slate-400">All actionable claims have been processed or settled.</p>
          </div>
        )}
      </div>

      {/* 6. Bottom Grid: ACTION REQUIRED & COMPACT CLAIMS PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {/* ACTION REQUIRED: Compact Rows */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 space-y-1.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                ACTION REQUIRED
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Underwriting & Compliance</span>
          </div>

          <div className="space-y-1">
            {[
              { label: '5 Pending Approvals', sub: 'High IDV & Special Discount overrides', action: () => setActiveTab('applications'), color: '#6366F1' },
              { label: '3 Claims Follow-up', sub: 'Surveyor inspection report pending >48 hrs', action: () => navigateToClaimsWithFilter('PENDING'), color: '#F59E0B' },
              { label: '7 Renewals Due in 7 Days', sub: 'Expiring policies requiring WhatsApp reminder', action: () => setActiveTab('renewals'), color: '#EC4899' },
              { label: '4 Documents Pending', sub: 'Vehicle RC & Medical KYC awaiting sign-off', action: () => setActiveTab('repository'), color: '#10B981' }
            ].map((act) => (
              <div
                key={act.label}
                onClick={act.action}
                className="py-1.5 px-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: act.color }}></span>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{act.label}</span>
                    <span className="text-[10px] text-slate-400 block truncate leading-tight">{act.sub}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#2563EB] group-hover:underline shrink-0 ml-2">
                  Action →
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CLAIMS PIPELINE — Interactive Stage Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  CLAIMS PIPELINE
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                48 Active Docket(s)
              </span>
            </div>

            {/* Clickable Inline Stage Counts */}
            <div className="grid grid-cols-4 gap-1.5 text-center mt-2">
              <button
                type="button"
                onClick={() => navigateToClaimsWithFilter('ALL', 'ALL', 1)}
                title="Filter claims in Stage 1: Registered"
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors text-center cursor-pointer group"
              >
                <span className="text-[9px] text-blue-700 font-bold block group-hover:underline">01 Registered</span>
                <span className="text-sm font-black text-blue-900 leading-tight block mt-0.5">12</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToClaimsWithFilter('ALL', 'ALL', 2)}
                title="Filter claims in Stage 2: Documents & Submission"
                className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors text-center cursor-pointer group"
              >
                <span className="text-[9px] text-indigo-700 font-bold block group-hover:underline">02 Documents</span>
                <span className="text-sm font-black text-indigo-900 leading-tight block mt-0.5">18</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToClaimsWithFilter('ALL', 'ALL', 3)}
                title="Filter claims in Stage 3: Survey & Review"
                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-100 transition-colors text-center cursor-pointer group"
              >
                <span className="text-[9px] text-amber-700 font-bold block group-hover:underline">03 Survey</span>
                <span className="text-sm font-black text-amber-900 leading-tight block mt-0.5">11</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToClaimsWithFilter('ALL', 'ALL', 4)}
                title="Filter claims in Stage 4: Settlement / Sanction"
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors text-center cursor-pointer group"
              >
                <span className="text-[9px] text-emerald-700 font-bold block group-hover:underline">04 Sanction</span>
                <span className="text-sm font-black text-emerald-900 leading-tight block mt-0.5">7</span>
              </button>
            </div>

            {/* Compact Segmented Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 flex overflow-hidden mt-2">
              <div style={{ width: '25%' }} className="bg-blue-500 cursor-pointer" title="Stage 1 Registered: 12" onClick={() => navigateToClaimsWithFilter('ALL', 'ALL', 1)} />
              <div style={{ width: '37.5%' }} className="bg-indigo-500 cursor-pointer" title="Stage 2 Documents: 18" onClick={() => navigateToClaimsWithFilter('ALL', 'ALL', 2)} />
              <div style={{ width: '23%' }} className="bg-amber-500 cursor-pointer" title="Stage 3 Survey: 11" onClick={() => navigateToClaimsWithFilter('ALL', 'ALL', 3)} />
              <div style={{ width: '14.5%' }} className="bg-emerald-500 cursor-pointer" title="Stage 4 Sanction: 7" onClick={() => navigateToClaimsWithFilter('ALL', 'ALL', 4)} />
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">IRDAI Fast Track Workflow</span>
            <button
              type="button"
              onClick={() => setActiveTab('claims')}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              All Claims →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
