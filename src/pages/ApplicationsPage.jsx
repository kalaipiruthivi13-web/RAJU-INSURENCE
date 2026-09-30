import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Sliders,
  Car,
  Heart,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import InsurancePage from './InsurancePage';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export function ApplicationsPage() {
  const { setActiveTab, activeTab } = useAppData();
  const [subTab, setSubTab] = useState('NEW'); // 'NEW' | 'DRAFTS' | 'PENDING' | 'COMPLETED'

  useEffect(() => {
    if (activeTab === 'motor-insurance' || activeTab === 'health-insurance' || activeTab === 'wizard' || activeTab === 'applications') {
      setSubTab('NEW');
    }
  }, [activeTab]);

  // Mock application records
  const mockApplications = [
    {
      id: 'APP-2024-551',
      clientName: 'Senthil Nathan K.',
      productType: 'Motor Comprehensive (Zero Dep)',
      assetRef: 'TN 07 DJ 2341 (Hyundai Creta)',
      createdDate: '2024-09-20',
      status: 'Draft',
      stepProgress: 'Step 3 of 8 (Coverage Selected)'
    },
    {
      id: 'APP-2024-552',
      clientName: 'Dr. Aruna Vasanth',
      productType: 'Health Care Supreme (Family)',
      assetRef: '4 Insured Members',
      createdDate: '2024-09-19',
      status: 'Pending Underwriting Sign-Off',
      stepProgress: 'Step 7 of 8 (Manager Review)'
    },
    {
      id: 'APP-2024-548',
      clientName: 'Apex Logistics Pvt Ltd',
      productType: 'Commercial Goods Vehicle Fleet',
      assetRef: 'TN 22 DK 8812 (Tata 407)',
      createdDate: '2024-09-18',
      status: 'Completed & Bound',
      stepProgress: 'Policy POL-2024-8891 Issued'
    }
  ];

  const filteredApps = mockApplications.filter((app) => {
    if (subTab === 'DRAFTS') return app.status === 'Draft';
    if (subTab === 'PENDING') return app.status.includes('Pending');
    if (subTab === 'COMPLETED') return app.status.includes('Completed');
    return true;
  });

  const columns = [
    {
      key: 'id',
      label: 'Application ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-[#2563EB]">{val}</span>
          <p className="text-[11px] text-slate-400">{row.createdDate}</p>
        </div>
      )
    },
    {
      key: 'clientName',
      label: 'Client / Proposer',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-[#0F172A]">{val}</p>
          <p className="text-xs text-slate-500 font-mono">{row.assetRef}</p>
        </div>
      )
    },
    {
      key: 'productType',
      label: 'Product Line',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-700">{val}</span>
    },
    {
      key: 'stepProgress',
      label: 'Progress / Step',
      render: (val) => <span className="text-xs font-semibold text-slate-800">{val}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => {
        let variant = 'warning';
        if (val.includes('Completed')) variant = 'success';
        if (val === 'Draft') variant = 'neutral';
        return <Badge variant={variant} dot size="sm">{val}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => setSubTab('NEW')}
          className="bg-[#2563EB] text-white"
        >
          {row.status === 'Draft' ? 'Resume Draft' : 'Open Docket'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Insurance Applications Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create new multi-carrier policies, review drafts, and manage underwriting approval queues.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
          {[
            { id: 'NEW', label: '+ New Application' },
            { id: 'DRAFTS', label: 'Drafts (1)' },
            { id: 'PENDING', label: 'Pending Approvals (1)' },
            { id: 'COMPLETED', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                subTab === tab.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render New Application Form (8-Step Dynamic Wizard) OR Applications Table */}
      {subTab === 'NEW' ? (
        <InsurancePage />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F172A]">
              {subTab === 'DRAFTS' && 'Draft Applications'}
              {subTab === 'PENDING' && 'Applications Awaiting Underwriting Sign-Off'}
              {subTab === 'COMPLETED' && 'Recently Issued & Bound Applications'}
            </h2>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setSubTab('NEW')}
              className="bg-[#2563EB] text-white"
            >
              New Application
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={filteredApps}
            searchPlaceholder="Search applications by client or ID..."
            emptyMessage="No applications found in this queue"
          />
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
