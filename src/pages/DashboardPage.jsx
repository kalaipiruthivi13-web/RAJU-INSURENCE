import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  Sliders,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Send,
  Eye,
  RefreshCw,
  ArrowRight,
  Mail,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export function DashboardPage() {
  const {
    policies,
    claims,
    setActiveTab,
    globalSearch,
    actionTasks,
    metrics,
    sendRenewalReminder
  } = useAppData();

  const [activeMenuPolicyId, setActiveMenuPolicyId] = useState(null);
  const [reminderModalTask, setReminderModalTask] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('WhatsApp');

  const displayPolicies = policies
    .filter((p) => {
      if (!globalSearch) return true;
      const term = globalSearch.toLowerCase();
      return (
        p.clientName.toLowerCase().includes(term) ||
        p.companyName.toLowerCase().includes(term) ||
        (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(term)) ||
        p.id.toLowerCase().includes(term)
      );
    })
    .slice(0, 5);

  const kpis = [
    {
      title: 'ACTIVE PARTNERS',
      desc: '15 Licensed Insurers',
      value: '15',
      accentColor: '#2563EB',
      softBg: '#F4F8FE',
      targetTab: 'companies'
    },
    {
      title: 'CLAIMS IN PROGRESS',
      desc: '48 Active Claims',
      value: '48',
      accentColor: '#D97706',
      softBg: '#FEFBF3',
      targetTab: 'claims'
    },
    {
      title: 'RENEWALS DUE',
      desc: '76 Next 30 Days',
      value: '76',
      accentColor: '#E11D48',
      softBg: '#FFF8F8',
      targetTab: 'renewals'
    },
    {
      title: 'PENDING QUOTES',
      desc: '18 Awaiting Decision',
      value: '18',
      accentColor: '#059669',
      softBg: '#F4FAF6',
      targetTab: 'quotes'
    }
  ];

  const claimStages = [
    { num: '01', label: 'Registered', desc: 'Docket Created' },
    { num: '02', label: 'Documents & Insurer Submission', desc: 'RC, Bills & Estimates Uploaded' },
    { num: '03', label: 'Survey / Review', desc: 'Surveyor Assigned & Loss Assessed' },
    { num: '04', label: 'Settlement / Rejection', desc: 'Claim Approval & Payment Disbursement' }
  ];

  const handleSendReminderConfirm = () => {
    if (reminderModalTask) {
      alert(`Customer reminder successfully dispatched via ${selectedChannel}!`);
      setReminderModalTask(null);
    }
  };

  const attentionCount = actionTasks.reduce((sum, item) => sum + (item.count || 1), 0) || 12;

  return (
    <div className="space-y-6" onClick={() => setActiveMenuPolicyId(null)}>
      {/* 1. Compact Hero Welcome Banner */}
      <div
        className="rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E3A8A 100%)'
        }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome back, Raju
          </h1>
          <p className="text-xs sm:text-sm text-[#93C5FD] mt-0.5 font-medium">
            {attentionCount} items require your attention today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={AlertTriangle}
            onClick={() => setActiveTab('claims')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xs cursor-pointer"
          >
            Claims Tracker
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards (Softer Pastel Backgrounds) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.title}
            onClick={() => setActiveTab(k.targetTab)}
            className="p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            style={{ backgroundColor: k.softBg }}
          >
            <div>
              <span
                className="text-[11px] font-black uppercase tracking-wider block"
                style={{ color: k.accentColor }}
              >
                {k.title}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 tracking-tight">
                {k.value}
              </div>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-200/50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium text-[11px]">{k.desc}</span>
              <span className="font-bold text-xs" style={{ color: k.accentColor }}>
                View →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. ACTION REQUIRED: Operational Task Priority Section */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#EF4444] flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">
              ACTION REQUIRED (Operational Task Priority)
            </h2>
            <p className="text-xs text-slate-500">Items requiring immediate broker review or customer follow-up</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionTasks.map((task) => {
            const isReminder = task.actionLabel.includes('Reminder');
            return (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-xs transition-all flex flex-col justify-between"
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: task.borderAccent || '#6366F1'
                }}
              >
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A] mb-1">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    {task.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isReminder) {
                      setReminderModalTask(task);
                    } else {
                      setActiveTab(task.targetTab);
                    }
                  }}
                  className="w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-[#F3F4F6] text-[#1F2937] hover:bg-slate-200"
                >
                  <span>{task.actionLabel}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Main Grid: Recent Policies & 4-Stage Claims Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Policies Table (Optimized column widths for desktop visibility) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Recent Policies</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status across multi-company portfolio</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('policies')}
              className="text-xs font-bold text-[#2563EB] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              View All Policies <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3 whitespace-nowrap">Policy ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Product / Asset</th>
                  <th className="py-2.5 px-3">Insurer</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Start</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Expiry</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayPolicies.map((p) => {
                  const isExpiring = p.status === 'Expiring Soon';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Policy ID: single line whitespace-nowrap */}
                      <td className="py-2.5 px-3 font-mono font-bold text-[#2563EB] whitespace-nowrap text-xs">
                        {p.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-[#0F172A] whitespace-nowrap text-xs">{p.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.phone}</p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap text-xs max-w-[130px] truncate">
                        {p.vehicleNumber === 'N/A (Health)' ? 'Health Insurance' : p.vehicleNumber || p.policyType}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap text-xs">
                        {p.companyName}
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                        {p.issueDate || '2023-10-10'}
                      </td>
                      <td className="py-2.5 px-2.5 font-mono font-semibold whitespace-nowrap text-slate-800 text-[11px]">
                        {p.expiryDate}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            isExpiring
                              ? 'bg-[#FEF3C7] text-[#B45309]'
                              : 'bg-[#DCFCE7] text-[#15803D]'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuPolicyId(activeMenuPolicyId === p.id ? null : p.id);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Actions Menu"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuPolicyId === p.id && (
                          <div
                            className="absolute right-2 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1 text-left animate-in fade-in zoom-in-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuPolicyId(null);
                                setActiveTab('policies');
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuPolicyId(null);
                                setActiveTab('renewals');
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                              Renew Policy
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuPolicyId(null);
                                sendRenewalReminder(p.id, 'WhatsApp');
                              }}
                              className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Send Reminder
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: 4-Stage Claims Settlement Workflow */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">Claims Pipeline</h2>
                <p className="text-xs text-slate-500 mt-0.5">4-Stage Claims Settlement Workflow</p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                48 Active
              </span>
            </div>

            {/* 4-Stage Visual Track */}
            <div className="space-y-3.5 py-2">
              {claimStages.map((stage, idx) => (
                <div key={stage.num} className="relative flex items-start gap-3">
                  {idx < claimStages.length - 1 && (
                    <div className="absolute left-3.5 top-7 w-0.5 h-6 bg-slate-200" />
                  )}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                      idx <= 2
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {stage.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0F172A] leading-tight">
                      [{stage.num}] {stage.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('claims')}
              className="w-full justify-center text-xs font-bold"
            >
              Open Full Claims Tracker
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL: Customer Reminder Channel Selector */}
      {reminderModalTask && (
        <Modal
          isOpen={!!reminderModalTask}
          onClose={() => setReminderModalTask(null)}
          title="Send Customer Reminder"
          subtitle={reminderModalTask.description}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setReminderModalTask(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSendReminderConfirm}>
                Dispatch Reminder ({selectedChannel})
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 font-medium">
              Select delivery channel to send automated policy renewal notice to customer:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'Email', label: 'Email Notice', icon: Mail },
                { id: 'SMS', label: 'SMS Alert', icon: Smartphone }
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = selectedChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DashboardPage;
