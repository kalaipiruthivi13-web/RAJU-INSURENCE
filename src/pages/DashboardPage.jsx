import React from 'react';
import {
  Clock,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export function DashboardPage() {
  const {
    claims,
    setActiveTab,
    navigateToClaim
  } = useAppData();

  // 7-Day Settlement Calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calculateDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return 7;
    const target = new Date(dueDateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Settlement items due within 7 days or overdue
  const settlementItems = [
    {
      id: 'CLM-105',
      fullId: 'CLM-2024-105',
      clientName: 'K. Thangavel',
      vehicleNumber: 'TN 05 BQ 7712',
      due: 'Overdue',
      category: 'OVERDUE',
      daysRemaining: -2,
      amount: 65000
    },
    {
      id: 'CLM-103',
      fullId: 'CLM-2024-103',
      clientName: 'Anandhakumar',
      vehicleNumber: 'TN 01 AU 6677',
      due: 'Today',
      category: 'DUE_TODAY',
      daysRemaining: 0,
      amount: 22500
    },
    {
      id: 'CLM-810',
      fullId: 'CLM-2024-810',
      clientName: 'S. Rajasekaran',
      vehicleNumber: 'TN 10 AP 5432',
      due: '7 Days',
      category: 'DUE_SOON',
      daysRemaining: 7,
      amount: 35000
    }
  ];

  const overdueCount = 2;
  const dueTodayCount = 1;
  const dueSoonCount = 5;
  const attentionCount = 19;

  return (
    <div className="space-y-2.5">
      {/* 1. TOP Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Welcome back, Raju
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            <span className="font-bold text-amber-600">{attentionCount} items</span> require attention
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            IRDA/DB-784/21 • Active Session
          </span>
        </div>
      </div>

      {/* 2. KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Active Policies', value: '142', target: 'policies', color: '#2563EB', bg: '#F0F7FF', border: '#D0E3FF' },
          { label: 'Claims', value: '48', target: 'claims', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
          { label: 'Renewals Due', value: '76', target: 'renewals', color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3' },
          { label: 'Pending Quotes', value: '18', target: 'quotes', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' }
        ].map((k) => (
          <div
            key={k.label}
            onClick={() => setActiveTab(k.target)}
            className="p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs"
            style={{ backgroundColor: k.bg, borderColor: k.border }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 tracking-tight">{k.label}</span>
              <span className="text-[10px] font-bold" style={{ color: k.color }}>View →</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 leading-none tracking-tight">
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* 3. IMPORTANT: 7-DAY SETTLEMENT (Primary Operational Alert) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-bold">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                7-DAY SETTLEMENT
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                {overdueCount} Overdue
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {dueTodayCount} Due Today
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {dueSoonCount} Due Soon
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('claims-settlements')}
            className="text-xs font-bold text-[#2563EB] hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All →</span>
          </button>
        </div>

        {/* Compact Settlement Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-1.5 px-3">Claim</th>
                <th className="py-1.5 px-3">Customer</th>
                <th className="py-1.5 px-3">Due</th>
                <th className="py-1.5 px-3">Amount</th>
                <th className="py-1.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlementItems.map((item) => (
                <tr
                  key={item.id}
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
      </div>

      {/* 4. Bottom Grid: ACTION REQUIRED & CLAIMS PIPELINE (Small) */}
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
            <span className="text-[10px] text-slate-400 font-medium">Urgent review</span>
          </div>

          <div className="space-y-1">
            {[
              { label: '5 Pending Approvals', action: 'Review →', target: 'wizard', color: '#6366F1' },
              { label: '3 Claims Follow-up', action: 'Follow-up →', target: 'claims-pending', color: '#F59E0B' },
              { label: '7 Renewals Due', action: 'Remind →', target: 'renewals', color: '#EC4899' },
              { label: '4 Documents Pending', action: 'Verify →', target: 'settings-docs', color: '#10B981' }
            ].map((act) => (
              <div
                key={act.label}
                onClick={() => setActiveTab(act.target)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: act.color }}></span>
                  <span className="text-xs font-bold text-slate-800">{act.label}</span>
                </div>
                <span className="text-xs font-bold text-[#2563EB] hover:underline">
                  {act.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CLAIMS PIPELINE — Small Summary */}
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
                48 Active
              </span>
            </div>

            {/* Inline Stage Counts */}
            <div className="grid grid-cols-4 gap-1.5 text-center mt-2">
              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-[9px] text-blue-700 font-bold block">Registered</span>
                <span className="text-sm font-black text-blue-900 leading-tight block mt-0.5">12</span>
              </div>
              <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                <span className="text-[9px] text-indigo-700 font-bold block">Documents</span>
                <span className="text-sm font-black text-indigo-900 leading-tight block mt-0.5">18</span>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100">
                <span className="text-[9px] text-amber-700 font-bold block">Review</span>
                <span className="text-sm font-black text-amber-900 leading-tight block mt-0.5">11</span>
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-[9px] text-emerald-700 font-bold block">Settlement</span>
                <span className="text-sm font-black text-emerald-900 leading-tight block mt-0.5">7</span>
              </div>
            </div>

            {/* Compact Segmented Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-100 flex overflow-hidden mt-2">
              <div style={{ width: '25%' }} className="bg-blue-500" title="Registered: 12" />
              <div style={{ width: '37.5%' }} className="bg-indigo-500" title="Documents: 18" />
              <div style={{ width: '23%' }} className="bg-amber-500" title="Review: 11" />
              <div style={{ width: '14.5%' }} className="bg-emerald-500" title="Settlement: 7" />
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">IRDAI Fast Track Workflow</span>
            <button
              type="button"
              onClick={() => setActiveTab('claims')}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              View Claims →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
