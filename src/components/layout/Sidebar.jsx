import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  ShieldCheck,
  Plus,
  Sliders,
  RefreshCw,
  AlertTriangle,
  Clock,
  ArrowRight,
  Coins,
  Wallet,
  CreditCard,
  FileCheck2,
  Users,
  CalendarCheck,
  ReceiptText,
  Building2,
  FolderArchive,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const {
    activeTab,
    setActiveTab,
    setShowRegisterClaimModal,
    currentUser,
    logout
  } = useAppData();

  // Accordion expansion state
  const [expandedMenus, setExpandedMenus] = useState({
    insurance: true,
    claims: true,
    loans: false,
    hr: false,
    master: false,
    settings: false
  });

  // Automatically expand parent group if activeTab belongs to it
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.type === 'group') {
        const hasActiveChild = item.subItems?.some(
          (sub) =>
            sub.id === activeTab ||
            (item.key === 'insurance' && (activeTab === 'applications' || activeTab === 'wizard' || activeTab === 'motor-insurance' || activeTab === 'health-insurance')) ||
            (sub.id === 'loans-active' && activeTab === 'loans') ||
            (sub.id === 'settings-permissions' && (activeTab === 'settings' || activeTab === 'settings-permissions'))
        );
        if (hasActiveChild) {
          setExpandedMenus((prev) => ({ ...prev, [item.key]: true }));
        }
      }
    });
  }, [activeTab]);

  const toggleGroup = (key) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Exact Clean Sidebar Navigation matching Raju business portal requirements
  const navItems = [
    {
      type: 'link',
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      type: 'group',
      key: 'insurance',
      label: 'Insurance Operations',
      icon: ShieldCheck,
      subItems: [
        {
          id: 'policies',
          label: 'Active Policies',
          icon: ShieldCheck
        },
        {
          id: 'quotes',
          label: 'Quotations & Rates',
          icon: Sliders
        },
        {
          id: 'renewals',
          label: 'Policy Renewals',
          icon: RefreshCw
        }
      ]
    },
    {
      type: 'group',
      key: 'claims',
      label: 'Claims Management',
      icon: AlertTriangle,
      subItems: [
        {
          id: 'claims',
          label: 'All Claims',
          icon: AlertTriangle,
          badge: '48',
          badgeClass: 'bg-slate-800 text-slate-400 font-bold text-[9px] px-1.5 py-0.2 rounded-full'
        },
        {
          id: 'claims-new',
          label: 'Register New Claim',
          icon: Plus,
          action: 'openRegisterModal'
        },
        {
          id: 'claims-pending',
          label: 'Pending Claims',
          icon: Clock,
          badge: '32',
          badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[9px] px-1.5 py-0.2 rounded-full'
        },
        {
          id: 'claims-settlements',
          label: 'Settlement Tracking',
          icon: ArrowRight
        }
      ]
    },
    {
      type: 'group',
      key: 'loans',
      label: 'Insurance Loan',
      icon: Coins,
      subItems: [
        {
          id: 'loans-new',
          label: 'New Loan Application',
          icon: Plus
        },
        {
          id: 'loans-active',
          label: 'Active Loans',
          icon: Wallet
        },
        {
          id: 'loans-repayments',
          label: 'Repayments / EMI',
          icon: CreditCard
        },
        {
          id: 'loans-settlement',
          label: 'Loan Settlement',
          icon: FileCheck2
        }
      ]
    },
    {
      type: 'group',
      key: 'hr',
      label: 'HR & People',
      icon: Users,
      adminOnly: true,
      subItems: [
        {
          id: 'staff',
          label: 'Employee Directory',
          icon: Users
        },
        {
          id: 'leaves',
          label: 'Leave Management',
          icon: CalendarCheck
        },
        {
          id: 'payroll',
          label: 'Payroll Processing',
          icon: ReceiptText
        }
      ]
    },
    {
      type: 'group',
      key: 'master',
      label: 'Master Data & Partners',
      icon: Building2,
      adminOnly: true,
      subItems: [
        {
          id: 'companies',
          label: 'Insurance Partners',
          icon: Building2
        },
        {
          id: 'products',
          label: 'Products',
          icon: Sliders
        },
        {
          id: 'repository',
          label: 'Document Repository',
          icon: FolderArchive
        }
      ]
    },
    {
      type: 'link',
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      adminOnly: true
    },
    {
      type: 'group',
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      adminOnly: true,
      subItems: [
        {
          id: 'settings-permissions',
          label: 'Permissions & Roles',
          icon: ShieldCheck
        }
      ]
    }
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && currentUser?.role !== 'ADMIN') return false;
    return true;
  });

  const handleItemClick = (item) => {
    if (item.action === 'openRegisterModal') {
      setActiveTab('claims');
      setShowRegisterClaimModal(true);
    } else {
      setActiveTab(item.id);
    }
    setMobileOpen(false);
  };

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
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800 bg-[#0B132B]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-wider text-white">RAJU</h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                VENDOR
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">IRDA/DB-784/21</p>
          </div>
        </div>

        {/* Clean Hierarchical Menu List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-1">
          {visibleNavItems.map((item) => {
            if (item.type === 'link') {
              const isActive = activeTab === item.id;
              const LinkIcon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LinkIcon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate tracking-wide">{item.label}</span>
                  </div>
                </button>
              );
            }

            // Accordion Group
            const isExpanded = expandedMenus[item.key];
            const hasActiveChild = item.subItems?.some(
              (sub) =>
                sub.id === activeTab ||
                (sub.id === 'wizard' && (activeTab === 'applications' || activeTab === 'wizard' || activeTab === 'motor-insurance' || activeTab === 'health-insurance')) ||
                (sub.id === 'loans-active' && activeTab === 'loans')
            );
            const GroupIcon = item.icon;

            return (
              <div key={item.key} className="space-y-0.5">
                {/* Parent Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(item.key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    hasActiveChild && !isExpanded
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-800/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GroupIcon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        hasActiveChild ? 'text-[#38BDF8]' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate tracking-wide">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Sub-Items List */}
                {isExpanded && item.subItems && (
                  <div className="pl-3 pr-0.5 py-0.5 space-y-0.5 border-l border-slate-800 ml-3">
                    {item.subItems.map((sub) => {
                      const isSubActive =
                        activeTab === sub.id ||
                        (sub.id === 'wizard' && (activeTab === 'applications' || activeTab === 'wizard' || activeTab === 'motor-insurance' || activeTab === 'health-insurance')) ||
                        (sub.id === 'loans-active' && activeTab === 'loans') ||
                        (sub.id === 'settings-permissions' && (activeTab === 'settings' || activeTab === 'settings-permissions'));
                      const SubIcon = sub.icon;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleItemClick(sub)}
                          className={`w-full flex items-center justify-between px-2 py-1.2 rounded-md text-[11px] transition-all cursor-pointer ${
                            isSubActive
                              ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <SubIcon
                              className={`w-3 h-3 shrink-0 ${
                                isSubActive ? 'text-white' : 'text-slate-500'
                              }`}
                            />
                            <span className="truncate">{sub.label}</span>
                          </div>

                          {/* Only urgent action counts: 48 on All Claims, 32 on Pending Claims */}
                          {sub.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full shrink-0 ${
                                isSubActive
                                  ? 'bg-white/20 text-white font-bold'
                                  : sub.badgeClass || 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-2.5 border-t border-slate-800 bg-[#0B132B]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-md ${currentUser?.avatarBg || 'bg-gradient-to-tr from-blue-600 to-indigo-600'} flex items-center justify-center text-white text-[11px] font-bold shadow-2xs shrink-0`}>
                {currentUser?.initials || 'RR'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'R. Rajkumar'}</p>
                <p className="text-[9px] text-blue-400 truncate flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  {currentUser?.roleTitle || 'Principal Broker'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Logout session"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-800 shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
