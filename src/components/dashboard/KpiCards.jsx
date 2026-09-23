import React from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  Clock,
  Coins,
  ChevronRight
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export function KpiCards() {
  const { metrics, setActiveTab } = useAppData();

  const cards = [
    {
      title: 'Active Policies',
      subtitle: 'Issued across 15 licensed insurers',
      value: metrics.activePolicies,
      unit: 'Policies',
      icon: ShieldCheck,
      iconGradient: 'from-blue-600 to-indigo-600',
      badge: '15 Partners',
      badgeClass: 'text-indigo-700 bg-indigo-50 border border-indigo-200/60',
      targetTab: 'insurance'
    },
    {
      title: 'Claims in Pipeline',
      subtitle: 'Under surveyor review & processing',
      value: metrics.pendingClaimsCount,
      unit: 'In Pipeline',
      icon: AlertOctagon,
      iconGradient: 'from-amber-500 to-orange-600',
      badge: '4-Stage Tracker',
      badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200/60',
      targetTab: 'claims'
    },
    {
      title: 'Renewals (Next 30 Days)',
      subtitle: 'Imminent expiry requiring action',
      value: metrics.expiringSoonCount,
      unit: 'Urgent Due',
      icon: Clock,
      iconGradient: 'from-rose-500 to-pink-600',
      badge: 'Expiring Soon',
      badgeClass: 'text-rose-700 bg-rose-50 border border-rose-200 animate-pulse',
      targetTab: 'renewals'
    },
    {
      title: 'Monthly Loan Interest',
      subtitle: 'Accrued across active client ledgers',
      value: `₹${metrics.totalMonthlyInterest.toLocaleString('en-IN')}`,
      unit: `Bal: ₹${(metrics.totalLoanBalance / 100000).toFixed(2)}L`,
      icon: Coins,
      iconGradient: 'from-emerald-500 to-teal-600',
      badge: '30-Day Ledger',
      badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200/60',
      targetTab: 'loans'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            onClick={() => setActiveTab(c.targetTab)}
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Card Header with Dual-Color Gradient Icon */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${c.iconGradient} text-white flex items-center justify-center shadow-md shadow-slate-200`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${c.badgeClass}`}>
                  {c.badge}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-800">{c.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{c.subtitle}</p>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {c.value}
                </span>
                <span className="text-xs font-semibold text-slate-500">{c.unit}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
              <span>View details</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KpiCards;
