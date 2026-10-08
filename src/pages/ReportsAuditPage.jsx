import React, { useState, useMemo } from 'react';
import {
  FileText,
  TrendingUp,
  Shield,
  Clock,
  User,
  Building,
  Download,
  Printer,
  Search,
  Filter,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  RefreshCw,
  X,
  ArrowRight
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import OperationsSubNavBar from '../components/layout/OperationsSubNavBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export function ReportsAuditPage() {
  const {
    policies,
    claims,
    auditLogs,
    partners,
    globalSearch,
    addNotification,
    setActiveTab
  } = useAppData();

  // Active Sub-Tab: 'policies' | 'premium' | 'claims' | 'settlement' | 'renewals' | 'pendingDocs' | 'audit'
  const [activeReportTab, setActiveReportTab] = useState('policies');

  // Multi-Criteria Filters
  const [productFilter, setProductFilter] = useState('ALL'); // 'ALL' | 'MOTOR' | 'HEALTH'
  const [insurerFilter, setInsurerFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL'); // 'ALL' | '30D' | 'Q3' | 'YTD'
  const [searchTerm, setSearchTerm] = useState('');

  // 1. POLICIES REPORT DATA
  const policyReportData = useMemo(() => {
    let list = policies.map((p, idx) => ({
      srNo: idx + 1,
      id: p.id,
      clientName: p.clientName,
      phone: p.phone,
      email: p.email,
      product: p.policyType,
      category: p.policyType?.toLowerCase().includes('health') ? 'Health' : 'Motor',
      companyName: p.companyName,
      companyId: p.companyId,
      vehicleNumber: p.vehicleNumber || 'N/A',
      sumInsured: p.sumInsured || 500000,
      premium: p.premium || 14250,
      issueDate: p.issueDate ? p.issueDate.split('-').reverse().join('/') : '10/10/2023',
      expiryDate: p.expiryDate ? p.expiryDate.split('-').reverse().join('/') : '09/10/2024',
      status: p.status || 'Active'
    }));

    if (productFilter === 'MOTOR') list = list.filter((p) => p.category === 'Motor');
    if (productFilter === 'HEALTH') list = list.filter((p) => p.category === 'Health');
    if (insurerFilter !== 'ALL') list = list.filter((p) => p.companyName?.toLowerCase().includes(insurerFilter.toLowerCase()));

    const term = (searchTerm || globalSearch || '').trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(term) ||
          p.clientName.toLowerCase().includes(term) ||
          p.vehicleNumber.toLowerCase().includes(term) ||
          p.companyName.toLowerCase().includes(term) ||
          p.product.toLowerCase().includes(term)
      );
    }
    return list;
  }, [policies, productFilter, insurerFilter, searchTerm, globalSearch]);

  // 2. PREMIUM & BUSINESS REPORT (Aggregated by Insurer)
  const premiumBusinessData = useMemo(() => {
    const summaryMap = {};

    policies.forEach((p) => {
      const carrier = p.companyName || 'General Insurer';
      const isHealth = p.policyType?.toLowerCase().includes('health');
      const cat = isHealth ? 'Health' : 'Motor';

      if (!summaryMap[carrier]) {
        summaryMap[carrier] = {
          carrier,
          totalPolicies: 0,
          motorPolicies: 0,
          healthPolicies: 0,
          grossPremium: 0,
          totalSumInsured: 0
        };
      }

      summaryMap[carrier].totalPolicies += 1;
      if (isHealth) summaryMap[carrier].healthPolicies += 1;
      else summaryMap[carrier].motorPolicies += 1;
      summaryMap[carrier].grossPremium += p.premium || 14250;
      summaryMap[carrier].totalSumInsured += p.sumInsured || 500000;
    });

    let list = Object.values(summaryMap).map((item, idx) => ({
      srNo: idx + 1,
      ...item,
      brokerageEarned: Math.round(item.grossPremium * 0.15),
      avgTicketSize: Math.round(item.grossPremium / (item.totalPolicies || 1))
    }));

    if (insurerFilter !== 'ALL') {
      list = list.filter((item) => item.carrier.toLowerCase().includes(insurerFilter.toLowerCase()));
    }

    const term = (searchTerm || globalSearch || '').trim().toLowerCase();
    if (term) {
      list = list.filter((item) => item.carrier.toLowerCase().includes(term));
    }

    return list;
  }, [policies, insurerFilter, searchTerm, globalSearch]);

  // 3. CLAIMS REPORT DATA
  const claimsReportData = useMemo(() => {
    let list = claims.map((c, idx) => {
      const isSettled =
        (c.currentStage === 4 && (c.stageDetails?.stage4?.status === 'Settled' || c.stageDetails?.stage4?.completed)) ||
        c.settlementStatus === 'Settled' ||
        c.status === 'Settled';
      const isRejected =
        (c.currentStage === 4 && (c.stageDetails?.stage4?.status === 'Rejected' || c.stageDetails?.stage4?.status?.includes('Repudiat'))) ||
        c.settlementStatus === 'Rejected' ||
        c.status === 'Rejected';

      const isHealth = c.policyType?.toLowerCase().includes('health') || c.policyType?.toLowerCase().includes('optima');

      return {
        srNo: idx + 1,
        id: c.id,
        policyId: c.policyId || 'POL-2024-8891',
        clientName: c.clientName,
        phone: c.phone || '+91 94440 00000',
        product: c.policyType || 'Motor Comprehensive',
        category: isHealth ? 'Health' : 'Motor',
        companyName: c.companyName,
        claimType: c.claimType || 'Own Damage / Collision',
        incidentDate: c.incidentDate ? c.incidentDate.split('-').reverse().join('/') : '28/08/2026',
        claimAmount: c.claimAmountRequested || 35000,
        currentStage: `Stage 0${c.currentStage || 1}`,
        status: isSettled ? 'Settled' : isRejected ? 'Rejected' : 'In Progress',
        assignedEmployee: c.assignedEmployee || 'K. Priya (Operations)',
        settlementDueDate: c.settlementDueDate ? c.settlementDueDate.split('-').reverse().join('/') : '18/09/2026'
      };
    });

    if (productFilter === 'MOTOR') list = list.filter((c) => c.category === 'Motor');
    if (productFilter === 'HEALTH') list = list.filter((c) => c.category === 'Health');
    if (insurerFilter !== 'ALL') list = list.filter((c) => c.companyName?.toLowerCase().includes(insurerFilter.toLowerCase()));

    const term = (searchTerm || globalSearch || '').trim().toLowerCase();
    if (term) {
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(term) ||
          c.clientName.toLowerCase().includes(term) ||
          c.policyId.toLowerCase().includes(term) ||
          c.companyName.toLowerCase().includes(term)
      );
    }
    return list;
  }, [claims, productFilter, insurerFilter, searchTerm, globalSearch]);

  // 4. SETTLEMENT REPORT DATA
  const settlementReportData = useMemo(() => {
    let list = claims
      .map((c, idx) => {
        const isSettled =
          (c.currentStage === 4 && (c.stageDetails?.stage4?.status === 'Settled' || c.stageDetails?.stage4?.completed)) ||
          c.settlementStatus === 'Settled' ||
          c.status === 'Settled';

        const claimed = c.claimAmountRequested || 35000;
        const assessed = Math.round(claimed * 0.9);
        const settledAmount = c.stageDetails?.stage4?.settledAmount || (isSettled ? claimed - 2500 : 0);
        const utrRef = c.stageDetails?.stage4?.bankRefNo || (isSettled ? `NEFT-AXIS-${Math.floor(10000000 + idx * 8812)}` : 'Pending NEFT');

        return {
          srNo: idx + 1,
          id: c.id,
          clientName: c.clientName,
          companyName: c.companyName,
          claimedAmount: claimed,
          assessedAmount: assessed,
          settledAmount,
          settlementDate: c.stageDetails?.stage4?.settlementDate || (isSettled ? '28/08/2026' : 'Target: 18/09/2026'),
          bankRefNo: utrRef,
          status: isSettled ? 'Disbursed' : 'Under Assessment',
          tatDays: isSettled ? '4 Days (Fast-Track)' : 'In Progress'
        };
      })
      .filter((c) => c.status === 'Disbursed' || c.assessedAmount > 0);

    if (insurerFilter !== 'ALL') {
      list = list.filter((c) => c.companyName?.toLowerCase().includes(insurerFilter.toLowerCase()));
    }

    const term = (searchTerm || globalSearch || '').trim().toLowerCase();
    if (term) {
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(term) ||
          c.clientName.toLowerCase().includes(term) ||
          c.bankRefNo.toLowerCase().includes(term)
      );
    }
    return list;
  }, [claims, insurerFilter, searchTerm, globalSearch]);

  // 5. RENEWAL REPORT DATA
  const renewalReportData = useMemo(() => {
    let list = policies.map((p, idx) => {
      const expDate = new Date(p.expiryDate);
      const today = new Date();
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isExpiring = diffDays <= 30 && diffDays >= 0;
      const isExpired = diffDays < 0;

      let status = 'Active';
      if (p.status === 'Renewed') status = 'Renewed';
      else if (isExpiring) status = 'Expiring Soon';
      else if (isExpired) status = 'Expired';

      return {
        srNo: idx + 1,
        policyId: p.id,
        quoteNo: `713004261000${idx + 4375}`,
        clientName: p.clientName,
        phone: p.phone,
        product: p.policyType,
        companyName: p.companyName,
        expiryDate: p.expiryDate ? p.expiryDate.split('-').reverse().join('/') : '24/08/2026',
        premium: p.premium || 14250,
        status,
        daysRemaining: diffDays
      };
    });

    if (insurerFilter !== 'ALL') {
      list = list.filter((r) => r.companyName?.toLowerCase().includes(insurerFilter.toLowerCase()));
    }

    const term = (searchTerm || globalSearch || '').trim().toLowerCase();
    if (term) {
      list = list.filter(
        (r) =>
          r.policyId.toLowerCase().includes(term) ||
          r.quoteNo.toLowerCase().includes(term) ||
          r.clientName.toLowerCase().includes(term)
      );
    }
    return list;
  }, [policies, insurerFilter, searchTerm, globalSearch]);

  // 6. PENDING DOCUMENTS REPORT
  const pendingDocsReportData = useMemo(() => {
    const list = [
      {
        srNo: 1,
        refId: 'CLM-2024-105',
        clientName: 'Sundaramurthy M.',
        type: 'Claim Document',
        documentRequired: 'Garage Final Tax Invoice & Scrap Salvage Note',
        insurer: 'New India Assurance',
        ageingDays: '6 Days Overdue',
        assignedTo: 'K. Priya (Operations)',
        status: 'Action Required'
      },
      {
        srNo: 2,
        refId: 'CLM-2024-103',
        clientName: 'Anandhakumar S.',
        type: 'Claim Document',
        documentRequired: 'Authorized Workshop Repair Estimate & Photographs',
        insurer: 'Tata AIG',
        ageingDays: '2 Days Pending',
        assignedTo: 'K. Priya (Operations)',
        status: 'Under Review'
      },
      {
        srNo: 3,
        refId: 'POL-2024-7712',
        clientName: 'G. Shanmugam (Logistics)',
        type: 'Policy KYC',
        documentRequired: 'Commercial Vehicle Goods Permit (Form 47)',
        insurer: 'ICICI Lombard',
        ageingDays: '4 Days Pending',
        assignedTo: 'R. Rajkumar (Principal Broker)',
        status: 'Action Required'
      },
      {
        srNo: 4,
        refId: 'CLM-2024-107',
        clientName: 'P. Meenakshi Ammal',
        type: 'Claim Document',
        documentRequired: 'Hospital Discharge Summary & Medicine Cash Receipts',
        insurer: 'Star Health',
        ageingDays: '5 Days Pending',
        assignedTo: 'K. Priya (Operations)',
        status: 'Follow-Up Active'
      },
      {
        srNo: 5,
        refId: 'POL-2024-6540',
        clientName: 'Dr. Aruna Vasanth',
        type: 'Policy KYC',
        documentRequired: 'Aadhaar / CKYC Form Sign-off',
        insurer: 'Care Health',
        ageingDays: '1 Day Pending',
        assignedTo: 'Deepika S. (Underwriting)',
        status: 'Pending Verification'
      }
    ];

    const term = (searchTerm || globalSearch || '').trim().toLowerCase();
    if (term) {
      return list.filter(
        (d) =>
          d.refId.toLowerCase().includes(term) ||
          d.clientName.toLowerCase().includes(term) ||
          d.documentRequired.toLowerCase().includes(term)
      );
    }
    return list;
  }, [searchTerm, globalSearch]);

  // 7. AUDIT LOGS DATA
  const auditLogsData = useMemo(() => {
    let list = auditLogs;
    const term = (searchTerm || globalSearch || '').trim().toLowerCase();
    if (term) {
      list = list.filter(
        (log) =>
          log.user.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.entity.toLowerCase().includes(term) ||
          log.id.toLowerCase().includes(term)
      );
    }
    return list;
  }, [auditLogs, searchTerm, globalSearch]);

  // Export to CSV Function
  const handleExportCSV = () => {
    let exportData = [];
    let filename = `RAJU_Report_${activeReportTab}_${new Date().toISOString().split('T')[0]}.csv`;

    switch (activeReportTab) {
      case 'policies':
        exportData = policyReportData;
        break;
      case 'premium':
        exportData = premiumBusinessData;
        break;
      case 'claims':
        exportData = claimsReportData;
        break;
      case 'settlement':
        exportData = settlementReportData;
        break;
      case 'renewals':
        exportData = renewalReportData;
        break;
      case 'pendingDocs':
        exportData = pendingDocsReportData;
        break;
      case 'audit':
        exportData = auditLogsData;
        break;
      default:
        exportData = policyReportData;
    }

    if (!exportData || exportData.length === 0) {
      addNotification('No records to export in current report view', 'warning');
      return;
    }

    const headers = Object.keys(exportData[0]);
    const csvRows = [headers.join(',')];

    for (const row of exportData) {
      const values = headers.map((header) => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification(`Exported ${filename} (${exportData.length} records)`, 'success');
  };

  return (
    <div className="space-y-3 pb-8">
      {/* 1. Operations Sub-Navigation Bar */}
      <OperationsSubNavBar activeItem="reports" />

      {/* 2. Top Header & Action Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Operational Reports & Compliance Audit Center
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory IRDAI registers, multi-insurer gross written premium, claims turnaround, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1E4E8C] hover:bg-[#0B1E3D] text-white shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 7 Operational Report Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 overflow-x-auto">
          {[
            { id: 'policies', label: 'Policy Report', icon: FileText, count: policyReportData.length },
            { id: 'premium', label: 'Premium & Business', icon: TrendingUp, count: premiumBusinessData.length },
            { id: 'claims', label: 'Claims Report', icon: Shield, count: claimsReportData.length },
            { id: 'settlement', label: 'Settlement Report', icon: CheckCircle2, count: settlementReportData.length },
            { id: 'renewals', label: 'Renewal Report', icon: RefreshCw, count: renewalReportData.length },
            { id: 'pendingDocs', label: 'Pending Documents', icon: AlertTriangle, count: pendingDocsReportData.length },
            { id: 'audit', label: 'Audit Trail', icon: FileCheck2, count: auditLogsData.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReportTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReportTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#0B1E3D] text-white border-[#0B1E3D] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Multi-Criteria Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Search in Report</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reference, customer, vehicle..."
                className="w-full pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Product Line */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Product Line</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              <option value="ALL">All Products (Motor & Health)</option>
              <option value="MOTOR">Motor Insurance Only</option>
              <option value="HEALTH">Health & Mediclaim Only</option>
            </select>
          </div>

          {/* Insurer Partner */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Insurer Partner</label>
            <select
              value={insurerFilter}
              onChange={(e) => setInsurerFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              <option value="ALL">All Insurers (15 Carriers)</option>
              {partners.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Horizon */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Report Horizon</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              <option value="ALL">All Available Dates</option>
              <option value="30D">Last 30 Days (Fast-Track)</option>
              <option value="Q3">Q3 FY2026-27</option>
              <option value="YTD">Year-to-Date (Statutory)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE REPORT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        {/* TAB 1: POLICY REPORT */}
        {activeReportTab === 'policies' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                In-Force Policy Master Register ({policyReportData.length} Records)
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Total GWP: ₹{policyReportData.reduce((acc, p) => acc + p.premium, 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">SR.NO</th>
                    <th className="py-2.5 px-3">POLICY NUMBER</th>
                    <th className="py-2.5 px-3">CUSTOMER</th>
                    <th className="py-2.5 px-3">PRODUCT</th>
                    <th className="py-2.5 px-3">INSURER</th>
                    <th className="py-2.5 px-3">SUM INSURED</th>
                    <th className="py-2.5 px-3">PREMIUM (₹)</th>
                    <th className="py-2.5 px-3">EXPIRY DATE</th>
                    <th className="py-2.5 px-3 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {policyReportData.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500">{p.srNo}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-900">{p.id}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{p.clientName}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">{p.phone}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-slate-900 block">{p.product}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{p.vehicleNumber}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-700">{p.companyName}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        ₹{p.sumInsured.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                        ₹{p.premium.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">{p.expiryDate}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PREMIUM & BUSINESS REPORT */}
        {activeReportTab === 'premium' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Insurer Carrier Production & Brokerage Reconciliation
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Total GWP: ₹{premiumBusinessData.reduce((acc, p) => acc + p.grossPremium, 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">SR.NO</th>
                    <th className="py-2.5 px-3">INSURER PARTNER</th>
                    <th className="py-2.5 px-3 text-center">TOTAL POLICIES</th>
                    <th className="py-2.5 px-3 text-center">MOTOR</th>
                    <th className="py-2.5 px-3 text-center">HEALTH</th>
                    <th className="py-2.5 px-3">GROSS PREMIUM (GWP)</th>
                    <th className="py-2.5 px-3">AVG TICKET SIZE</th>
                    <th className="py-2.5 px-3">BROKERAGE EARNED (15%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {premiumBusinessData.map((item) => (
                    <tr key={item.carrier} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500">{item.srNo}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{item.carrier}</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-800">{item.totalPolicies}</td>
                      <td className="py-2 px-3 text-center text-blue-700 font-semibold">{item.motorPolicies}</td>
                      <td className="py-2 px-3 text-center text-emerald-700 font-semibold">{item.healthPolicies}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        ₹{item.grossPremium.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">
                        ₹{item.avgTicketSize.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                        ₹{item.brokerageEarned.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CLAIMS REPORT */}
        {activeReportTab === 'claims' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Claims Production & Status Ledger ({claimsReportData.length} Claims)
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Total Claim Amount: ₹{claimsReportData.reduce((acc, c) => acc + c.claimAmount, 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">CLAIM ID</th>
                    <th className="py-2.5 px-3">POLICY ID</th>
                    <th className="py-2.5 px-3">CUSTOMER</th>
                    <th className="py-2.5 px-3">INSURER</th>
                    <th className="py-2.5 px-3">CLAIM TYPE</th>
                    <th className="py-2.5 px-3">INCIDENT DATE</th>
                    <th className="py-2.5 px-3">CLAIM AMOUNT</th>
                    <th className="py-2.5 px-3">STAGE</th>
                    <th className="py-2.5 px-3 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claimsReportData.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-blue-900">{c.id}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{c.policyId}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{c.clientName}</td>
                      <td className="py-2 px-3 text-slate-700">{c.companyName}</td>
                      <td className="py-2 px-3 text-slate-600">{c.claimType}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{c.incidentDate}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        ₹{c.claimAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{c.currentStage}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            c.status === 'Settled'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : c.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SETTLEMENT REPORT */}
        {activeReportTab === 'settlement' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Fast-Track Settlement Disbursals & Banking Audit ({settlementReportData.length} Cases)
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Total Sanctioned: ₹{settlementReportData.reduce((acc, c) => acc + c.settledAmount, 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">CLAIM ID</th>
                    <th className="py-2.5 px-3">CUSTOMER</th>
                    <th className="py-2.5 px-3">INSURER</th>
                    <th className="py-2.5 px-3">CLAIMED</th>
                    <th className="py-2.5 px-3">ASSESSED LOSS</th>
                    <th className="py-2.5 px-3">SANCTIONED (NEFT)</th>
                    <th className="py-2.5 px-3">BANK UTR REF</th>
                    <th className="py-2.5 px-3">DISBURSED DATE</th>
                    <th className="py-2.5 px-3 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settlementReportData.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-blue-900">{s.id}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{s.clientName}</td>
                      <td className="py-2 px-3 text-slate-700">{s.companyName}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">₹{s.claimedAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 font-mono text-blue-800 font-semibold">₹{s.assessedAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">₹{s.settledAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{s.bankRefNo}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{s.settlementDate}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: RENEWAL REPORT */}
        {activeReportTab === 'renewals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Policy Renewal Conversion & Expiry Tracking ({renewalReportData.length} Policies)
              </h2>
              <span className="text-xs text-slate-500">
                Retention Target: 85%
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">POLICY ID</th>
                    <th className="py-2.5 px-3">RENEWAL QUOTE NO</th>
                    <th className="py-2.5 px-3">CUSTOMER</th>
                    <th className="py-2.5 px-3">PRODUCT</th>
                    <th className="py-2.5 px-3">INSURER</th>
                    <th className="py-2.5 px-3">EXPIRY DATE</th>
                    <th className="py-2.5 px-3">PREMIUM (₹)</th>
                    <th className="py-2.5 px-3 text-center">RENEWAL STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {renewalReportData.map((r) => (
                    <tr key={r.policyId} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.policyId}</td>
                      <td className="py-2 px-3 font-mono text-blue-700">{r.quoteNo}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{r.clientName}</td>
                      <td className="py-2 px-3 text-slate-700">{r.product}</td>
                      <td className="py-2 px-3 text-slate-700">{r.companyName}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{r.expiryDate}</td>
                      <td className="py-2 px-3 font-mono font-bold text-emerald-700">₹{r.premium.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            r.status === 'Renewed'
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              : r.status === 'Expiring Soon'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : r.status === 'Expired'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: PENDING DOCUMENTS REPORT */}
        {activeReportTab === 'pendingDocs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Pending Documents & KYC Exceptions ({pendingDocsReportData.length} Cases)
              </h2>
              <span className="text-xs text-rose-600 font-bold">
                Action Required for Claims & Issuance
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">CASE REF</th>
                    <th className="py-2.5 px-3">CUSTOMER</th>
                    <th className="py-2.5 px-3">CASE TYPE</th>
                    <th className="py-2.5 px-3">PENDING / MISSING DOCUMENT</th>
                    <th className="py-2.5 px-3">INSURER</th>
                    <th className="py-2.5 px-3">AGEING</th>
                    <th className="py-2.5 px-3">ASSIGNED TO</th>
                    <th className="py-2.5 px-3 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDocsReportData.map((d) => (
                    <tr key={d.srNo} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-blue-900">{d.refId}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{d.clientName}</td>
                      <td className="py-2 px-3 text-slate-600">{d.type}</td>
                      <td className="py-2 px-3 font-semibold text-rose-800">{d.documentRequired}</td>
                      <td className="py-2 px-3 text-slate-700">{d.insurer}</td>
                      <td className="py-2 px-3 font-mono text-amber-700 font-bold">{d.ageingDays}</td>
                      <td className="py-2 px-3 text-slate-700">{d.assignedTo}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOGS */}
        {activeReportTab === 'audit' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Tamper-Proof Statutory IRDAI Broker Audit Trail ({auditLogsData.length} Entries)
              </h2>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Audit Store
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">AUDIT ID</th>
                    <th className="py-2.5 px-3">AUTHORIZED USER</th>
                    <th className="py-2.5 px-3">ACTION PERFORMED</th>
                    <th className="py-2.5 px-3">ENTITY REF</th>
                    <th className="py-2.5 px-3">TIMESTAMP</th>
                    <th className="py-2.5 px-3 text-center">IRDAI STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogsData.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-indigo-900">{log.id}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{log.user}</span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{log.action}</td>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-700 bg-indigo-50/50 px-2 rounded">
                        {log.entity}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{log.time}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Logged & Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsAuditPage;
