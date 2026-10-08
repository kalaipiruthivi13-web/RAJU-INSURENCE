import React from 'react';
import {
  RefreshCw,
  FileEdit,
  Search,
  Phone,
  FileText,
  CreditCard,
  FileSpreadsheet,
  Calculator,
  Bell
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export function OperationsSubNavBar({ activeItem, onSearchModeChange }) {
  const { setActiveTab } = useAppData();

  const navItems = [
    { id: 'renewals', label: 'Renewals', icon: RefreshCw, target: 'renewals' },
    { id: 'quotes', label: 'Manage Quotes', icon: FileEdit, target: 'quotes' },
    { id: 'search-reg', label: 'Search By Reg No.', icon: Search, action: 'search-reg' },
    { id: 'search-mobile', label: 'Mobile No.', icon: Phone, action: 'search-mobile' },
    { id: 'policies', label: 'Manage Policy', icon: FileText, target: 'policies' },
    { id: 'payment', label: 'Make Payment', icon: CreditCard, action: 'payment' },
    { id: 'reports', label: 'View Reports', icon: FileSpreadsheet, target: 'reports' },
    { id: 'claims', label: 'View Claims', icon: Calculator, target: 'claims' },
    { id: 'notices', label: 'Renewal Notice', icon: Bell, action: 'notices' }
  ];

  const handleClick = (item) => {
    if (item.target) {
      setActiveTab(item.target);
    } else if (item.action && onSearchModeChange) {
      onSearchModeChange(item.action);
    } else if (item.id === 'payment') {
      setActiveTab('loans-repayments');
    } else if (item.id === 'notices') {
      setActiveTab('renewals');
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 overflow-x-auto shadow-2xs">
      <div className="flex items-center min-w-max px-2 py-0">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#0B1E3D] text-[#0B1E3D] font-black bg-blue-50/40'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0B1E3D]' : 'text-slate-500'}`} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default OperationsSubNavBar;
