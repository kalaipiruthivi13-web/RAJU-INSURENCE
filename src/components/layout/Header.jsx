import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Button from '../ui/Button';

export function Header({ setMobileOpen }) {
  const {
    globalSearch,
    setGlobalSearch,
    setActiveTab,
    notifications,
    metrics,
    currentUser,
    logout
  } = useAppData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] shadow-2xs">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
        {/* Left: Mobile Toggle & Brand Label */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="font-black text-sm tracking-wider text-slate-900 hidden sm:inline-block">
            RAJU VENDOR
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search client, policy, vehicle, claim..."
            className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right CTA and Profile */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setActiveTab('wizard')}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
          >
            New Application
          </Button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {metrics.expiringSoonCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Notifications
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {metrics.expiringSoonCount > 0 && (
                    <div
                      onClick={() => {
                        setActiveTab('renewals');
                        setShowNotifications(false);
                      }}
                      className="p-3.5 bg-rose-50/70 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        {metrics.expiringSoonCount} Policies Expiring Soon
                      </p>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        Click to review renewals and trigger client reminders.
                      </p>
                    </div>
                  )}

                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                        <p className="text-slate-700 font-medium">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">{n.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0] hover:opacity-90 transition-opacity cursor-pointer text-left"
              aria-label="User profile menu"
            >
              <div className={`w-8 h-8 rounded-lg ${currentUser?.avatarBg || 'bg-[#2563EB]'} text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0`}>
                {currentUser?.initials || 'RR'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || 'R. Rajkumar'}
                </p>
                <p className="text-[10px] text-slate-400 leading-none">
                  {currentUser?.roleTitle || 'Principal Broker'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 text-xs">
                {/* Profile Card Header */}
                <div className="p-3.5 border-b border-slate-100 bg-slate-50">
                  <p className="font-bold text-slate-900 text-sm leading-tight">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{currentUser?.roleTitle}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${currentUser?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                      {currentUser?.role === 'ADMIN' ? 'Admin Access' : 'User Access'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{currentUser?.license}</span>
                  </div>
                </div>

                {/* Action Items */}
                <div className="p-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('dashboard');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">Profile</span>
                  </button>

                  {/* Permissions & Roles - Admin only */}
                  {currentUser?.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveTab('settings-permissions');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium">Permissions & Roles</span>
                      </div>
                      <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                        Admin
                      </span>
                    </button>
                  )}
                </div>

                {/* Logout */}
                <div className="p-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
