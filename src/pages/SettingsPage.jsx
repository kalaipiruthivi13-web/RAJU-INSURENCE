import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Users,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Save,
  Shield,
  Eye,
  Edit3,
  FileCheck2,
  Building2,
  Coins,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export function SettingsPage() {
  const { currentUser, switchRole } = useAppData();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Role details
  const roles = [
    {
      id: 'ADMIN',
      name: 'Admin',
      title: 'Principal Broker',
      badge: 'Full Super-Admin Access',
      badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      description: 'Complete operational and statutory authority across underwriting, claims sign-off, financial loan ledgers, HR personnel, and security settings.',
      responsibilities: [
        'IRDAI Statutory Compliance & Sign-off',
        'High IDV & Special Broker Discount Overrides',
        'Carrier Commission Slabs & Brokerage Ledger',
        'Loan Sanctions & NOC Foreclosure Sign-off',
        'HR Payroll & Leave Approval',
        'Role-Based Permissions & System Settings'
      ],
      moduleCount: '8 of 8 Modules Active'
    },
    {
      id: 'MANAGER',
      name: 'Broker / Manager',
      title: 'Operations Manager',
      badge: 'Managerial Access',
      badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
      description: 'Supervision of policy underwriting, premium quotations, surveyor follow-ups, and customer claim pipeline coordination.',
      responsibilities: [
        'Rate Quotation Approvals & Comparison',
        'Surveyor Follow-up & Inspection Coordination',
        'Claim Stage 1 to Stage 3 Pipeline Advance',
        '30-Day Renewal Follow-up Reminders',
        'Loan EMI Repayment Entry & Receipting',
        'Operational Team Productivity Review'
      ],
      moduleCount: '6 of 8 Modules Active'
    },
    {
      id: 'USER',
      name: 'Staff / User',
      title: 'Operations Executive / POSP',
      badge: 'Standard Operations',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      description: 'Day-to-day front office operations: customer intake, 8-step policy proposals, initial claim registration, and payment collections.',
      responsibilities: [
        'Client Application Intake & Proposal Creation',
        'Initial Claim Docket Registration (Intimation)',
        'Vehicle & Medical KYC Document Collection',
        'Customer Renewal WhatsApp Reminder Dispatch',
        'Client Credit Repayment Logging',
        'Basic Policy Verification & Search'
      ],
      moduleCount: '5 of 8 Modules Active (Admin Modules Restricted)'
    }
  ];

  // Permissions Matrix
  const permissionsMatrix = [
    {
      module: 'Dashboard & KPIs',
      admin: 'Full (Executive Vitals)',
      manager: 'Full (Operational Vitals)',
      staff: 'Standard (Operations View)',
      note: 'All roles see 7-day settlement alerts'
    },
    {
      module: 'Insurance Operations (New App, Quotes, Renewals)',
      admin: 'Full (Issue & Override)',
      manager: 'Full (Review & Issue)',
      staff: 'Intake & Proposal Creation',
      note: 'High-discount overrides require Admin'
    },
    {
      module: 'Claims Management (Register, Track, Settle)',
      admin: 'Full (Authorize Settlement)',
      manager: 'Stage 1-3 (Surveyor Coordination)',
      staff: 'Intake & Registration Only',
      note: 'Stage 4 settlement restricted to Admin'
    },
    {
      module: 'Insurance Loan (Applications, EMI, Settlement)',
      admin: 'Full (Sanction & NOC Issue)',
      manager: 'Record EMI & Repayments',
      staff: 'Application Intake & Record Credit',
      note: 'Loan NOC settlement restricted to Admin'
    },
    {
      module: 'HR & People (Directory, Leaves, Payroll)',
      admin: 'Full Access (Approval & Payroll)',
      manager: 'View Team Directory',
      staff: '🔒 Restricted (Admin Only)',
      note: 'Salary and leaves managed by Admin'
    },
    {
      module: 'Master Data & Partners (Licences, Products)',
      admin: 'Full Configuration',
      manager: 'View Only',
      staff: '🔒 Restricted (Admin Only)',
      note: 'Licence and commission master'
    },
    {
      module: 'Reports & Audits',
      admin: 'Full Financial & Statutory',
      manager: 'Operational Performance',
      staff: 'Basic Summary Reports',
      note: 'IRDA statutory filings Admin only'
    },
    {
      module: 'Settings (Permissions & Roles)',
      admin: 'Full Authority',
      manager: '🔒 Restricted (Admin Only)',
      staff: '🔒 Restricted (Admin Only)',
      note: 'RBAC controls strictly Admin only'
    }
  ];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Permissions & Roles
            </h1>
            <Badge variant="primary" size="sm">
              IRDAI RBAC Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure role-based access control, operational capabilities, module restrictions, and staff responsibilities.
          </p>
        </div>

        {/* Live Simulator Pill */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 self-start md:self-auto">
          <div className="text-left text-xs">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Active Session Role</span>
            <span className="font-bold text-slate-800">{currentUser?.name} ({currentUser?.role})</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => switchRole(currentUser?.role === 'ADMIN' ? 'USER' : 'ADMIN')}
            className="text-xs font-bold py-1 px-2.5 ml-2 cursor-pointer bg-white"
          >
            {currentUser?.role === 'ADMIN' ? 'Test Staff View →' : 'Switch to Admin View →'}
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Role permissions and module access matrix updated successfully.</span>
        </div>
      )}

      {/* 3 Main Defined Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {roles.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{r.name}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{r.title}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.badgeClass}`}>
                  {r.badge}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-snug">
                {r.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                  Core Responsibilities
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {r.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>{r.moduleCount}</span>
              <span className="text-blue-600 font-mono">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions & Module Access Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900 text-sm tracking-tight">
              Module Access & Permissions Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Defines operational privilege hierarchy for each section of the Raju operations engine.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSave}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold cursor-pointer"
          >
            Save Access Matrix
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Portal Module</th>
                <th className="py-2.5 px-4 text-indigo-900">Admin (Principal)</th>
                <th className="py-2.5 px-4 text-blue-900">Broker / Manager</th>
                <th className="py-2.5 px-4 text-emerald-900">Staff / User</th>
                <th className="py-2.5 px-4">Operational Restriction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {p.module}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-indigo-700">
                    <span className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                      {p.admin}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-blue-700">
                    <span className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-[11px]">
                      {p.manager}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    {p.staff.includes('Restricted') ? (
                      <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                        {p.staff}
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[11px]">
                        {p.staff}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-400">
                    {p.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
