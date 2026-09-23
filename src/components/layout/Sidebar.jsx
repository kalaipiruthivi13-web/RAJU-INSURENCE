import React from 'react';
import {
  Shield,
  LayoutDashboard,
  FileCheck2,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Coins,
  CreditCard,
  Users,
  CalendarCheck,
  ReceiptText,
  Building2,
  FolderArchive,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { activeTab, setActiveTab, metrics } = useAppData();

  const navSections = [
    {
      title: 'MAIN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null
        }
      ]
    },
    {
      title: 'INSURANCE OPERATIONS',
      items: [
        {
          id: 'applications',
          label: 'Applications',
          icon: FileCheck2,
          badge: 'New',
          badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        },
        {
          id: 'quotes',
          label: 'Quotations',
          icon: Sliders,
          badge: '18',
          badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        },
        {
          id: 'policies',
          label: 'Active Policies',
          icon: ShieldCheck,
          badge: `${metrics.activePolicies}`,
          badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        },
        {
          id: 'claims',
          label: 'Claims',
          icon: AlertTriangle,
          badge: '48',
          badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
        },
        {
          id: 'renewals',
          label: 'Renewals',
          icon: RefreshCw,
          badge: '76',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }
      ]
    },
    {
      title: 'FINANCIALS',
      items: [
        {
          id: 'loans',
          label: 'Personal Loans',
          icon: Coins,
          badge: null
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: CreditCard,
          badge: null
        }
      ]
    },
    {
      title: 'HR & PEOPLE',
      items: [
        {
          id: 'staff',
          label: 'Employees',
          icon: Users,
          badge: null
        },
        {
          id: 'leaves',
          label: 'Leave',
          icon: CalendarCheck,
          badge: null
        },
        {
          id: 'payroll',
          label: 'Payroll',
          icon: ReceiptText,
          badge: null
        }
      ]
    },
    {
      title: 'MASTER DATA',
      items: [
        {
          id: 'companies',
          label: 'Insurance Partners',
          icon: Building2,
          badge: '15',
          badgeClass: 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
        },
        {
          id: 'repository',
          label: 'Documents',
          icon: FolderArchive,
          badge: null
        }
      ]
    },
    {
      title: 'REPORTS & COMPLIANCE',
      items: [
        {
          id: 'reports',
          label: 'Reports',
          icon: BarChart3,
          badge: null
        },
        {
          id: 'audit',
          label: 'Audit Trail',
          icon: ShieldCheck,
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-[#0B132B]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-wider text-white">RAJU</h1>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                VENDOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">IRDA/DB-784/21</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                {section.title}
              </p>
              {section.items.map((item) => {
                const isActive = activeTab === item.id || (item.id === 'applications' && activeTab === 'wizard');
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id === 'applications' ? 'applications' : item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : item.badgeClass || 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-800 bg-[#0B132B]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              RR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">R. Rajkumar</p>
              <p className="text-[10px] text-blue-400 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
                Principal Broker
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
