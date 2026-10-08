import React, { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Upload,
  Download,
  Eye,
  Plus,
  PhoneCall,
  Mail,
  User,
  Building,
  Calendar,
  Check,
  RotateCcw,
  Shield,
  Receipt,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Sparkles,
  Printer,
  Ban,
  ArrowRight
} from 'lucide-react';
import ClaimTimeline4Stage from './ClaimTimeline4Stage';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

export function ClaimDetailDocket({
  claim,
  onAdvanceStage,
  onUpdateDocument,
  onAddBill,
  onAddFollowUp,
  onUpdateSettlement,
  onRegisterNewClaim
}) {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'docs' | 'bills' | 'followup' | 'survey' | 'settlement'

  // Modals state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState('');

  // Form states
  const [billForm, setBillForm] = useState({
    type: 'Final Garage Repair Bill',
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    vendorName: 'Sundaram Motors Service Center',
    amount: 18500,
    fileName: 'Garage_Final_Bill_Itemized.pdf'
  });

  const [followUpForm, setFollowUpForm] = useState({
    type: 'Phone Call',
    assignedEmployee: 'K. Priya (Operations)',
    notes: 'Followed up with regional claims surveyor. Inspection report clearance confirmed for tomorrow.',
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    status: 'Completed'
  });

  const [disburseForm, setDisburseForm] = useState({
    approvedAmount: claim?.stageDetails?.stage4?.settledAmount || (claim?.claimAmountRequested ? claim.claimAmountRequested - 2500 : 32500),
    bankRefNo: `NEFT-AXIS-${Math.floor(10000000 + Math.random() * 90000000)}`,
    settlementDate: new Date().toLocaleDateString('en-GB')
  });

  const [rejectForm, setRejectForm] = useState({
    reason: 'Vehicle overloading beyond permissible gross vehicle weight (GVW) in violation of policy clause 4(b).'
  });

  if (!claim) return null;

  const isClaimSettled =
    (claim.currentStage === 4 && (claim.stageDetails?.stage4?.status === 'Settled' || claim.stageDetails?.stage4?.completed)) ||
    claim.settlementStatus === 'Settled' ||
    claim.status === 'Settled';

  const isClaimRejected =
    (claim.currentStage === 4 && (claim.stageDetails?.stage4?.status === 'Rejected' || claim.stageDetails?.stage4?.status?.includes('Repudiat'))) ||
    claim.settlementStatus === 'Rejected' ||
    claim.status === 'Rejected';

  // Base dates and target calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysRemaining = useMemo(() => {
    if (!claim.settlementDueDate) return 7;
    const target = new Date(claim.settlementDueDate);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [claim.settlementDueDate, today]);

  // Determine claim category (Motor Private / Commercial / Health / Theft)
  const isHealth = claim.policyType?.toLowerCase().includes('health') || claim.policyType?.toLowerCase().includes('optima');
  const isCommercial = claim.policyType?.toLowerCase().includes('commercial') || claim.policyType?.toLowerCase().includes('goods');
  const isTheft = claim.claimType?.toLowerCase().includes('theft') || claim.policyType?.toLowerCase().includes('theft');

  // Dynamic document checklist definition
  const checklistTemplates = useMemo(() => {
    if (isHealth) {
      return [
        { id: 'doc-cl-1', name: 'Duly Filled & Signed Claim Form', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-2', name: 'Original Health Policy Schedule Copy', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-3', name: 'Government Photo ID / Aadhaar Card', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-4', name: 'Hospital Indoor Case Summary / Discharge Summary', classification: 'Required', defaultStatus: claim.currentStage >= 2 ? 'Verified' : 'Pending' },
        { id: 'doc-cl-5', name: 'Consolidated Hospital Final Bill (Detailed Breakup)', classification: 'Required', defaultStatus: claim.currentStage >= 2 ? 'Uploaded' : 'Pending' },
        { id: 'doc-cl-6', name: 'Hospital Payment Receipts with Numbered Receipt', classification: 'Required', defaultStatus: claim.currentStage >= 2 ? 'Uploaded' : 'Pending' },
        { id: 'doc-cl-7', name: 'All Diagnostic Investigation Reports (Blood, CT/MRI)', classification: 'Required', defaultStatus: 'Uploaded' },
        { id: 'doc-cl-8', name: 'Original Pharmacy & Medical Store Bills with Prescriptions', classification: 'If Applicable', defaultStatus: 'Under Review' },
        { id: 'doc-cl-9', name: 'Medico-Legal Certificate (MLC) / Police GD Entry', classification: 'If Applicable', defaultStatus: 'Not Applicable' }
      ];
    } else if (isTheft) {
      return [
        { id: 'doc-cl-1', name: 'Original Claim Intimation Form', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-2', name: 'Police FIR under Section 379 IPC (Copy)', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-3', name: 'Original RC Book & Registration Certificate', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-4', name: 'Both Original Ignition Vehicle Keys', classification: 'Required', defaultStatus: claim.currentStage >= 2 ? 'Uploaded' : 'Pending' },
        { id: 'doc-cl-5', name: 'Vehicle Purchase Invoice Copy', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-6', name: 'RTO Intimation Letter for Vehicle Theft', classification: 'Required', defaultStatus: 'Uploaded' },
        { id: 'doc-cl-7', name: 'Police Non-Traceable Final Investigation Report', classification: 'Required', defaultStatus: claim.currentStage >= 3 ? 'Uploaded' : 'Pending' },
        { id: 'doc-cl-8', name: 'Letter of Subrogation & Indemnity Undertaking', classification: 'Required', defaultStatus: 'Pending' }
      ];
    } else if (isCommercial) {
      return [
        { id: 'doc-cl-1', name: 'Signed Motor Claim Form with Driver Declaration', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-2', name: 'Policy Schedule with Loading Endorsement Copy', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-3', name: 'Vehicle RC Smart Card Copy (Heavy/Goods Vehicle)', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-4', name: 'Valid Heavy Transport Driving Licence (with Badge No.)', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-5', name: 'Valid Commercial Vehicle Fitness Certificate (Form 38)', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-6', name: 'State / National Goods Carriage Permit (Form 47)', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-7', name: 'Trip Goods Consignment Note / Weighbridge Challan', classification: 'If Applicable', defaultStatus: 'Under Review' },
        { id: 'doc-cl-8', name: 'Police Spot Report / FIR (if collision occurred)', classification: 'If Applicable', defaultStatus: 'Uploaded' },
        { id: 'doc-cl-9', name: 'Workshop Detailed Repair Estimate (Itemized Spares & Labour)', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-10', name: 'Spot & Garage Inspection Damage Photos (8 angles)', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-11', name: 'Final Repair Invoice with GST Breakup', classification: 'Required', defaultStatus: claim.currentStage >= 3 ? 'Uploaded' : 'Pending' },
        { id: 'doc-cl-12', name: 'Customer Payment Voucher / Cashless Work Order', classification: 'Optional', defaultStatus: 'Pending' }
      ];
    } else {
      // Standard Motor Private Car / Two-Wheeler
      return [
        { id: 'doc-cl-1', name: 'Signed Motor Own-Damage Claim Form', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-2', name: 'Valid Insurance Policy Certificate / Schedule Copy', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-3', name: 'Vehicle Registration Certificate (RC Book) Copy', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-4', name: 'Driving Licence of the person driving at incident time', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-5', name: 'Accident Spot & Garage Damage Photographs (Color)', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-6', name: 'Authorized Garage Detailed Repair Estimate', classification: 'Required', defaultStatus: 'Verified' },
        { id: 'doc-cl-7', name: 'Police Diary / FIR / GD Entry (if 3rd party injury/dispute)', classification: 'If Applicable', defaultStatus: 'Not Applicable' },
        { id: 'doc-cl-8', name: 'Surveyor Technical Inspection & Loss Assessment Report', classification: 'Required', defaultStatus: claim.currentStage >= 3 ? 'Verified' : 'Pending' },
        { id: 'doc-cl-9', name: 'Garage Final Tax Invoice with Scrap Salvage details', classification: 'Required', defaultStatus: claim.currentStage >= 3 ? 'Uploaded' : 'Pending' },
        { id: 'doc-cl-10', name: 'Customer Payment Discharge Voucher / Satisfaction Note', classification: 'Optional', defaultStatus: claim.currentStage === 4 ? 'Verified' : 'Pending' }
      ];
    }
  }, [isHealth, isCommercial, isTheft, claim.currentStage]);

  // Combine default checklist with any overrides from claim.checklistDocuments
  const documentChecklist = useMemo(() => {
    const overrides = claim.checklistDocuments || [];
    return checklistTemplates.map((tpl) => {
      const found = overrides.find((o) => o.id === tpl.id);
      return {
        ...tpl,
        status: found?.status || tpl.defaultStatus,
        file: found?.file || (tpl.defaultStatus === 'Verified' || tpl.defaultStatus === 'Uploaded' ? `${tpl.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 24)}.pdf` : null),
        updatedAt: found?.updatedAt || '08/09/2026',
        rejectReason: found?.rejectReason || ''
      };
    });
  }, [checklistTemplates, claim.checklistDocuments]);

  // Bills list (default initial bills if not in claim)
  const billsList = useMemo(() => {
    if (claim.bills && claim.bills.length > 0) return claim.bills;
    return [
      {
        id: 'BILL-01',
        type: isHealth ? 'Hospital Indoor Treatment Bill' : 'Workshop Parts & Replacement Invoice',
        invoiceNo: 'INV-788910',
        vendorName: isHealth ? 'Apollo Specialty Hospitals' : 'Sundaram Motors Service Center',
        amount: Math.round((claim.claimAmountRequested || 35000) * 0.7),
        uploadedDate: '06/09/2026',
        uploadedBy: 'K. Priya (Operations)',
        status: 'Verified',
        fileName: 'Tax_Invoice_Part1.pdf'
      },
      {
        id: 'BILL-02',
        type: isHealth ? 'Pharmacy & Medicine Store Bill' : 'Garage Labour & Painting Invoice',
        invoiceNo: 'INV-788914',
        vendorName: isHealth ? 'Apollo Pharmacy Care' : 'Sundaram Motors Service Center',
        amount: Math.round((claim.claimAmountRequested || 35000) * 0.3),
        uploadedDate: '07/09/2026',
        uploadedBy: 'Customer Upload',
        status: 'Under Review',
        fileName: 'Labour_Painting_Estimate.pdf'
      }
    ];
  }, [claim.bills, claim.claimAmountRequested, isHealth]);

  // Follow-ups list
  const followUpsList = useMemo(() => {
    if (claim.followUps && claim.followUps.length > 0) return claim.followUps;
    return [
      {
        id: 'FLP-1',
        type: 'Phone Call',
        followUpDate: '05/09/2026',
        assignedEmployee: 'K. Priya (Operations)',
        status: 'Completed',
        notes: 'Contacted customer regarding vehicle intake at workshop. Informed about fast-track SLA timeline.'
      },
      {
        id: 'FLP-2',
        type: 'Surveyor Follow-up',
        followUpDate: '07/09/2026',
        assignedEmployee: 'R. Rajkumar (Principal Broker)',
        status: 'Completed',
        notes: 'Coordinated with surveyor Er. K. Natarajan. Inspection scheduled and loss estimate aligned with insurer rate chart.'
      },
      {
        id: 'FLP-3',
        type: 'Insurer Portal Coordination',
        followUpDate: '08/09/2026',
        assignedEmployee: 'K. Priya (Operations)',
        status: 'Pending Follow-up',
        notes: 'Awaiting regional office claim hub sanction clearance. Follow-up reminder active.'
      }
    ];
  }, [claim.followUps]);

  // Loss assessment breakdown numbers
  const lossAssessment = useMemo(() => {
    const requested = claim.claimAmountRequested || 35000;
    const partsCost = Math.round(requested * 0.65);
    const labourCost = Math.round(requested * 0.35);
    const depreciation = Math.round(partsCost * 0.12);
    const salvage = Math.round(partsCost * 0.05);
    const assessed = partsCost - depreciation + labourCost - salvage;
    const deductible = 1500;
    const netSanction = Math.max(0, assessed - deductible);

    return {
      partsCost,
      labourCost,
      depreciation,
      salvage,
      assessed,
      deductible,
      netSanction
    };
  }, [claim.claimAmountRequested]);

  // Action handlers
  const handleVerifyDocument = (docId) => {
    if (onUpdateDocument) {
      onUpdateDocument(claim.id, docId, { status: 'Verified', updatedAt: new Date().toLocaleDateString('en-GB') });
    }
  };

  const handleOpenRejectDoc = (docId) => {
    setRejectingDocId(docId);
    setDocRejectReason('Document copy is blurry or missing mandatory stamp/signature.');
  };

  const handleConfirmRejectDoc = () => {
    if (rejectingDocId && onUpdateDocument) {
      onUpdateDocument(claim.id, rejectingDocId, {
        status: 'Rejected',
        rejectReason: docRejectReason,
        updatedAt: new Date().toLocaleDateString('en-GB')
      });
      setRejectingDocId(null);
      setDocRejectReason('');
    }
  };

  const handleUploadSimulate = (docId) => {
    if (onUpdateDocument) {
      onUpdateDocument(claim.id, docId, {
        status: 'Uploaded',
        file: `Doc_Uploaded_${Date.now().toString().slice(-4)}.pdf`,
        updatedAt: new Date().toLocaleDateString('en-GB')
      });
    }
  };

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (onAddBill) {
      onAddBill(claim.id, {
        ...billForm,
        amount: Number(billForm.amount) || 0
      });
    }
    setShowAddBillModal(false);
  };

  const handleCreateFollowUp = (e) => {
    e.preventDefault();
    if (onAddFollowUp) {
      onAddFollowUp(claim.id, followUpForm);
    }
    setShowAddFollowUpModal(false);
  };

  const handleConfirmDisburse = (e) => {
    e.preventDefault();
    if (onUpdateSettlement) {
      onUpdateSettlement(claim.id, {
        settlementStatus: 'Settled',
        approvedAmount: Number(disburseForm.approvedAmount) || 0,
        bankRefNo: disburseForm.bankRefNo,
        settlementDate: disburseForm.settlementDate,
        currentStage: 4,
        stageDetails: {
          ...claim.stageDetails,
          stage4: {
            completed: true,
            status: 'Settled',
            settledAmount: Number(disburseForm.approvedAmount) || 0,
            bankRefNo: disburseForm.bankRefNo,
            settlementDate: disburseForm.settlementDate
          }
        }
      });
    }
    setShowDisburseModal(false);
  };

  const handleConfirmRejectClaim = (e) => {
    e.preventDefault();
    if (onUpdateSettlement) {
      onUpdateSettlement(claim.id, {
        settlementStatus: 'Rejected',
        currentStage: 4,
        stageDetails: {
          ...claim.stageDetails,
          stage4: {
            completed: true,
            status: 'Rejected',
            rejectionReason: rejectForm.reason
          }
        }
      });
    }
    setShowRejectModal(false);
  };

  const getDocStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">Verified</span>;
      case 'Uploaded':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">Uploaded</span>;
      case 'Under Review':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-300">Under Review</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">Rejected</span>;
      case 'Resubmission Required':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">Resubmission Req</span>;
      case 'Not Applicable':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300">N/A</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* ========================================================= */}
      {/* 1. EXECUTIVE METADATA BANNER (Enterprise Header) */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#0B1E3D] via-[#122E5C] to-[#1E4E8C] text-white p-4">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-white/15">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-white/15 border border-white/30 font-mono font-black text-xs tracking-wider text-blue-100">
              {claim.id}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-blue-500/30 border border-blue-400/40 text-xs font-bold text-white flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-200" />
              <span>{claim.companyName || 'Carrier Partner'}</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/25 border border-emerald-400/30 text-xs font-bold text-emerald-100 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>{claim.policyType || 'Motor Comprehensive'}</span>
            </span>

            {/* SLA Badge */}
            {isClaimSettled ? (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settlement Disbursed</span>
              </span>
            ) : isClaimRejected ? (
              <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs">
                <Ban className="w-3.5 h-3.5" />
                <span>Claim Repudiated</span>
              </span>
            ) : daysRemaining < 0 ? (
              <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Internal SLA Overdue ({Math.abs(daysRemaining)}d)</span>
              </span>
            ) : daysRemaining === 0 ? (
              <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Internal SLA Target Due Today</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-blue-600/80 border border-blue-400/60 text-white font-bold text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Internal SLA: {daysRemaining} Days Left</span>
              </span>
            )}
          </div>

          {/* Quick Action Buttons in Banner */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Docket</span>
            </button>
            <button
              type="button"
              onClick={onRegisterNewClaim}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-[#0B1E3D] shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Claim</span>
            </button>
          </div>
        </div>

        {/* 8-Point Operational Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3 text-xs">
          <div>
            <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider block">Policy Number</span>
            <span className="font-mono font-bold text-white block mt-0.5 truncate">{claim.policyId || 'POL-2024-8891'}</span>
            <span className="text-[10px] text-blue-200/60 block">{claim.vehicleNumber || 'Active Asset'}</span>
          </div>

          <div>
            <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider block">Policyholder</span>
            <span className="font-bold text-white block mt-0.5 truncate">{claim.clientName || 'Krishna Kumar S'}</span>
            <span className="text-[10px] text-blue-200/60 font-mono block">{claim.phone || '+91 94440 00000'}</span>
          </div>

          <div>
            <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider block">Claim Type</span>
            <span className="font-semibold text-white block mt-0.5">{claim.claimType || 'Own Damage / Collision'}</span>
            <span className="text-[10px] text-blue-200/60 block">Inc: {claim.incidentDate || '28/08/2026'}</span>
          </div>

          <div>
            <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider block">Claim Amount</span>
            <span className="font-mono font-black text-amber-300 block mt-0.5 text-sm">
              ₹{(claim.claimAmountRequested || 35000).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-blue-200/60 block">Requested</span>
          </div>

          <div>
            <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider block">Current Stage</span>
            <span className="font-bold text-white block mt-0.5">
              Stage 0{claim.currentStage || 1}
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold block">
              {isClaimSettled ? 'Settled & Closed' : isClaimRejected ? 'Repudiated' : 'In Progress'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider block">Assigned Executive</span>
            <span className="font-semibold text-white block mt-0.5 truncate">
              {claim.assignedEmployee || 'K. Priya (Ops)'}
            </span>
            <span className="text-[10px] text-blue-200/60 block">RAJU Brokerage Desk</span>
          </div>

          <div>
            <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider block">Next Follow-Up</span>
            <span className="font-mono font-bold text-white block mt-0.5">
              {claim.nextFollowUpDate || '10/09/2026'}
            </span>
            <span className="text-[10px] text-blue-200/60 block">Surveyor Desk</span>
          </div>

          <div>
            <span className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider block">SLA Target Date</span>
            <span className="font-mono font-bold text-amber-200 block mt-0.5">
              {claim.settlementDueDate ? claim.settlementDueDate.split('-').reverse().join('/') : '18/09/2026'}
            </span>
            <span className="text-[10px] text-blue-200/60 block">Internal SLA</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. OPERATIONAL SUB-TAB NAVIGATOR (6 Comprehensive Tabs) */}
      {/* ========================================================= */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>4-Stage Stepper</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'docs'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents Checklist</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'docs' ? 'bg-white text-blue-900' : 'bg-slate-200 text-slate-800'
            }`}
          >
            {documentChecklist.filter((d) => d.status === 'Verified').length}/{documentChecklist.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bills')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'bills'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Bills & Receipts</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'bills' ? 'bg-white text-blue-900' : 'bg-slate-200 text-slate-800'
            }`}
          >
            {billsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('followup')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'followup'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Follow-up & Activity Log</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'followup' ? 'bg-white text-blue-900' : 'bg-slate-200 text-slate-800'
            }`}
          >
            {followUpsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('survey')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'survey'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Survey / Assessment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settlement')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settlement'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Settlement Processing</span>
          {isClaimSettled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. SUB-TAB CONTENTS */}
      {/* ========================================================= */}
      <div className="p-4">
        {/* TAB 1: 4-STAGE TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Claim Lifecycle Stepper (Stages 01 – 04)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Advance claim status, input insurer reference numbers, surveyor inspection notes, and settlement vouchers.
                </p>
              </div>
            </div>
            <ClaimTimeline4Stage
              claim={claim}
              onAdvanceStage={onAdvanceStage}
            />
          </div>
        )}

        {/* TAB 2: DOCUMENTS CHECKLIST */}
        {activeTab === 'docs' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Dynamic Document Checklist</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {isHealth ? 'Health / Mediclaim Dossier' : isCommercial ? 'Commercial Vehicle Dossier' : isTheft ? 'Total Theft Dossier' : 'Motor Private Car Dossier'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Manage mandatory, conditional, and optional claim evidence. Initial claim registration does not enforce mandatory uploads.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold text-[11px]">Checklist Progress:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {Math.round((documentChecklist.filter((d) => d.status === 'Verified').length / documentChecklist.length) * 100)}% Verified
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Document Requirement</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">File / Attachment</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documentChecklist.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        {item.rejectReason && (
                          <span className="text-[10px] text-rose-600 block font-medium">
                            Rejection note: {item.rejectReason}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            item.classification === 'Required'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : item.classification === 'If Applicable'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.classification}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {item.file ? (
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-mono text-[11px] text-blue-900 truncate max-w-[160px]">{item.file}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not yet attached</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {getDocStatusBadge(item.status)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.file ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(item)}
                                title="Preview Document"
                                className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => alert(`Downloading ${item.file}...`)}
                                title="Download File"
                                className="p-1 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUploadSimulate(item.id)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload</span>
                            </button>
                          )}

                          {item.status !== 'Verified' && item.file && (
                            <button
                              type="button"
                              onClick={() => handleVerifyDocument(item.id)}
                              title="Mark as Verified"
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 cursor-pointer flex items-center gap-0.5"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}

                          {item.status !== 'Rejected' && item.file && (
                            <button
                              type="button"
                              onClick={() => handleOpenRejectDoc(item.id)}
                              title="Reject / Request Re-submission"
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer flex items-center gap-0.5"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BILLS & RECEIPTS */}
        {activeTab === 'bills' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Itemized Bills, Garage Invoices & Payment Receipts
                </h4>
                <p className="text-[11px] text-slate-500">
                  Track vendor bills, spare parts invoices, hospital bills, and customer payment receipts.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setShowAddBillModal(true)}
                className="text-xs font-bold bg-[#1E4E8C] hover:bg-[#0B1E3D] cursor-pointer"
              >
                + Add Bill / Receipt
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Bill ID</th>
                    <th className="py-2.5 px-3">Bill Type</th>
                    <th className="py-2.5 px-3">Vendor / Service Center</th>
                    <th className="py-2.5 px-3">Invoice No.</th>
                    <th className="py-2.5 px-3">Bill Amount</th>
                    <th className="py-2.5 px-3">Uploaded By & Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {billsList.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{bill.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{bill.type}</td>
                      <td className="py-2.5 px-3 text-slate-700">{bill.vendorName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{bill.invoiceNo}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        ₹{(bill.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="block text-slate-800">{bill.uploadedBy}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{bill.uploadedDate}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => alert(`Downloading invoice ${bill.invoiceNo}...`)}
                          className="px-2.5 py-1 rounded text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Summary Banner */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Invoiced Amount</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    ₹{billsList.reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Original Claim Requested</span>
                  <div className="font-mono font-bold text-blue-800 text-sm">
                    ₹{(claim.claimAmountRequested || 35000).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                All bills reconciled with garage job card and surveyor loss assessment sheet.
              </span>
            </div>
          </div>
        )}

        {/* TAB 4: FOLLOW-UP & ACTIVITY LOG */}
        {activeTab === 'followup' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Operational Follow-Up & Chronological Activity Log
                </h4>
                <p className="text-[11px] text-slate-500">
                  Comprehensive audit trail of phone calls, workshop inspections, surveyor coordination, and customer reminders.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setShowAddFollowUpModal(true)}
                className="text-xs font-bold bg-[#1E4E8C] hover:bg-[#0B1E3D] cursor-pointer"
              >
                + Log Follow-Up
              </Button>
            </div>

            {/* Timeline cards */}
            <div className="space-y-2.5">
              {followUpsList.map((f, i) => (
                <div
                  key={f.id || i}
                  className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {f.type === 'Phone Call' ? <PhoneCall className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{f.type}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {f.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{f.notes}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-mono">
                        <span>Staff: {f.assignedEmployee}</span>
                        <span>•</span>
                        <span>Logged: {f.followUpDate}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 shrink-0 self-start">
                    {f.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SURVEY / ASSESSMENT */}
        {activeTab === 'survey' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Surveyor Inspection & Technical Loss Assessment
                </h4>
                <p className="text-[11px] text-slate-500">
                  IRDAI surveyor appointment details, depreciated loss calculation, and official survey report.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                Survey Status: Report Submitted
              </span>
            </div>

            {/* Surveyor Credentials Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Independent Surveyor</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {claim.stageDetails?.stage3?.surveyorName || 'Er. K. Natarajan (IRDA SLA: 3341)'}
                </span>
                <span className="text-[10px] text-slate-500">Certified Motor & Fire Assessor</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Contact Telephone</span>
                <span className="font-mono font-bold text-blue-800 block mt-0.5">
                  {claim.stageDetails?.stage3?.surveyorPhone || '+91 98402 44331'}
                </span>
                <span className="text-[10px] text-slate-500">Chennai Regional Office</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Inspection Date</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">
                  {claim.stageDetails?.stage3?.inspectionDate || '08/09/2026'}
                </span>
                <span className="text-[10px] text-slate-500">Spot & Dismantling Inspection</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Inspection Garage</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  Sundaram Motors (Mount Road)
                </span>
                <span className="text-[10px] text-slate-500">Cashless Authorized Hub</span>
              </div>
            </div>

            {/* Loss Assessment Breakdown Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-xs text-slate-900 flex items-center justify-between">
                <span>Detailed Loss Assessment Breakdown (IRDAI Standard Schedule)</span>
                <span className="text-[11px] font-mono text-slate-500">Currency: INR (₹)</span>
              </div>

              <div className="p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Garage Spares & Parts Estimate:</span>
                  <span className="font-mono font-bold text-slate-900">₹{lossAssessment.partsCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-rose-700">
                  <span>Less: Depreciation on Plastic / Rubber / Metal (12% Avg):</span>
                  <span className="font-mono font-bold">-₹{lossAssessment.depreciation.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-700">Authorized Workshop Labour & Painting:</span>
                  <span className="font-mono font-bold text-slate-900">₹{lossAssessment.labourCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-rose-700">
                  <span>Less: Salvage Recovery Value (Replaced Parts):</span>
                  <span className="font-mono font-bold">-₹{lossAssessment.salvage.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200 font-bold text-slate-900 bg-slate-50 px-2 rounded">
                  <span>Net Assessed Loss by Surveyor:</span>
                  <span className="font-mono text-blue-900 text-sm">₹{lossAssessment.assessed.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-amber-700">
                  <span>Less: Compulsory Policy Excess / Deductible:</span>
                  <span className="font-mono font-bold">-₹{lossAssessment.deductible.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-2 font-black text-slate-900 bg-emerald-50 px-2 rounded border border-emerald-200">
                  <span className="text-emerald-900 text-xs uppercase tracking-wide">Net Recommended Sanction Amount:</span>
                  <span className="font-mono text-emerald-800 text-base">₹{lossAssessment.netSanction.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Surveyor Remarks */}
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 block mb-1">Surveyor Technical Remarks:</span>
              <p className="text-amber-800">
                {claim.stageDetails?.stage3?.notes ||
                  'Damages are consistent with stated cause of loss. Front bumper and headlamp assembly replaced. Chassis frame intact with zero distortion. Recommended for immediate fast-track sanction.'}
              </p>
            </div>
          </div>
        )}

        {/* TAB 6: SETTLEMENT PROCESSING */}
        {activeTab === 'settlement' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Settlement & Disbursal Processing
                </h4>
                <p className="text-[11px] text-slate-500">
                  Reconcile claimed vs assessed amounts, process NEFT bank disbursements, or log policy repudiation.
                </p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                  isClaimSettled
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : isClaimRejected
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : 'bg-blue-100 text-blue-900 border-blue-300'
                }`}
              >
                Status: {isClaimSettled ? 'Disbursed via NEFT' : isClaimRejected ? 'Claim Repudiated' : 'Sanction Pending'}
              </span>
            </div>

            {/* 4 Financial Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Claimed Amount</span>
                <span className="font-mono font-black text-slate-900 text-lg mt-0.5 block">
                  ₹{(claim.claimAmountRequested || 35000).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">Customer Claim Form</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Surveyor Assessed</span>
                <span className="font-mono font-black text-blue-900 text-lg mt-0.5 block">
                  ₹{lossAssessment.assessed.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-600">Net after salvage</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Approved Sanction</span>
                <span className="font-mono font-black text-emerald-800 text-lg mt-0.5 block">
                  ₹{(claim.stageDetails?.stage4?.settledAmount || lossAssessment.netSanction).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600">Net of deductible</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Customer Deductible</span>
                <span className="font-mono font-black text-amber-900 text-lg mt-0.5 block">
                  ₹{lossAssessment.deductible.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-600">Compulsory Excess</span>
              </div>
            </div>

            {/* Settlement Status Banner / Actions */}
            {isClaimSettled ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Claim Fully Settled & Disbursed</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 block">Bank NEFT Reference:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {claim.stageDetails?.stage4?.bankRefNo || claim.bankRefNo || 'NEFT-AXIS-882190'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Disbursal Date:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {claim.stageDetails?.stage4?.settlementDate || claim.settlementDate || '08/09/2026'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sanctioned Amount:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      ₹{(claim.stageDetails?.stage4?.settledAmount || lossAssessment.netSanction).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => alert('Downloading official Settlement Voucher PDF...')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Settlement Voucher (PDF)</span>
                  </button>
                </div>
              </div>
            ) : isClaimRejected ? (
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <Ban className="w-5 h-5 text-rose-600" />
                  <span>Claim Repudiated (Rejected)</span>
                </div>
                <p className="text-xs text-rose-800">
                  {claim.stageDetails?.stage4?.rejectionReason || 'Claim repudiated due to policy condition breach.'}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Ready for Settlement Execution</h5>
                  <p className="text-[11px] text-slate-500">
                    SLA target is {daysRemaining >= 0 ? `${daysRemaining} days remaining` : `${Math.abs(daysRemaining)} days overdue`}. Disburse via NEFT or repudiate.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectModal(true)}
                    className="text-xs font-bold text-rose-700 border-rose-300 hover:bg-rose-50 cursor-pointer"
                  >
                    Repudiate / Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => setShowDisburseModal(true)}
                    className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                  >
                    Sanction & Disburse (NEFT)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. MODALS (Add Bill, Add Follow-up, Disburse, Reject) */}
      {/* ========================================================= */}

      {/* Modal: Add Bill */}
      {showAddBillModal && (
        <Modal
          isOpen={showAddBillModal}
          onClose={() => setShowAddBillModal(false)}
          title="Attach New Bill / Receipt"
        >
          <form onSubmit={handleCreateBill} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Bill Type</label>
              <select
                value={billForm.type}
                onChange={(e) => setBillForm({ ...billForm, type: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              >
                <option value="Final Garage Repair Bill">Final Garage Repair Bill</option>
                <option value="Spares / Replacement Parts Invoice">Spares / Replacement Parts Invoice</option>
                <option value="Labour & Painting Invoice">Labour & Painting Invoice</option>
                <option value="Hospital Indoor Patient Bill">Hospital Indoor Patient Bill</option>
                <option value="Pharmacy & Medicine Store Bill">Pharmacy & Medicine Store Bill</option>
                <option value="Emergency Towing Receipt">Emergency Towing Receipt</option>
                <option value="Customer Discharge Receipt">Customer Discharge Receipt</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Invoice / Bill Number</label>
                <input
                  type="text"
                  value={billForm.invoiceNo}
                  onChange={(e) => setBillForm({ ...billForm, invoiceNo: e.target.value })}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={billForm.amount}
                  onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Vendor / Workshop / Hospital Name</label>
              <input
                type="text"
                value={billForm.vendorName}
                onChange={(e) => setBillForm({ ...billForm, vendorName: e.target.value })}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowAddBillModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-[#1E4E8C]">
                Save Bill
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Add Follow-up */}
      {showAddFollowUpModal && (
        <Modal
          isOpen={showAddFollowUpModal}
          onClose={() => setShowAddFollowUpModal(false)}
          title="Log Operational Follow-Up"
        >
          <form onSubmit={handleCreateFollowUp} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Activity Type</label>
                <select
                  value={followUpForm.type}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="Surveyor Follow-up">Surveyor Follow-up</option>
                  <option value="Workshop Visit">Workshop Visit</option>
                  <option value="Customer Meeting">Customer Meeting</option>
                  <option value="Email Reminder">Email Reminder</option>
                  <option value="Insurer Portal Coordination">Insurer Portal Coordination</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Next Follow-Up Date</label>
                <input
                  type="date"
                  value={followUpForm.nextFollowUpDate}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Discussion / Activity Notes</label>
              <textarea
                rows={3}
                value={followUpForm.notes}
                onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowAddFollowUpModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-[#1E4E8C]">
                Save Activity
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Disburse Settlement */}
      {showDisburseModal && (
        <Modal
          isOpen={showDisburseModal}
          onClose={() => setShowDisburseModal(false)}
          title="Sanction & Disburse Claim Settlement"
        >
          <form onSubmit={handleConfirmDisburse} className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="font-bold text-emerald-900 block">IRDAI Fast-Track Disbursal Approval</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Executing settlement moves Claim {claim.id} to Stage 4 (Settled) and archives it out of unresolved SLA alerts.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Approved Net Amount (₹)</label>
                <input
                  type="number"
                  value={disburseForm.approvedAmount}
                  onChange={(e) => setDisburseForm({ ...disburseForm, approvedAmount: e.target.value })}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">NEFT / RTGS Bank UTR No.</label>
                <input
                  type="text"
                  value={disburseForm.bankRefNo}
                  onChange={(e) => setDisburseForm({ ...disburseForm, bankRefNo: e.target.value })}
                  required
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowDisburseModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-emerald-700 hover:bg-emerald-800">
                Confirm & Disburse Settlement
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Reject Claim */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Repudiate / Reject Claim"
        >
          <form onSubmit={handleConfirmRejectClaim} className="space-y-3 text-xs">
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-800">
              <span className="font-bold block">Caution: Formal Repudiation</span>
              <p className="text-[11px] mt-0.5">
                Repudiating this claim will officially log reason in the IRDAI broker register and issue a repudiation notice.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Repudiation Grounds / Reason</label>
              <textarea
                rows={3}
                value={rejectForm.reason}
                onChange={(e) => setRejectForm({ ...rejectForm, reason: e.target.value })}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" className="bg-rose-700 hover:bg-rose-800 text-white">
                Confirm Repudiation
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Document Reject Reason */}
      {rejectingDocId && (
        <Modal
          isOpen={Boolean(rejectingDocId)}
          onClose={() => setRejectingDocId(null)}
          title="Reject Document / Request Re-submission"
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Specify the reason why this document is rejected so the customer/workshop can re-upload:
            </p>
            <textarea
              rows={3}
              value={docRejectReason}
              onChange={(e) => setDocRejectReason(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setRejectingDocId(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmRejectDoc} className="bg-rose-600 hover:bg-rose-700 text-white">
                Reject Document
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Preview Document */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.name}`}
        >
          <div className="space-y-3 text-xs">
            <div className="p-6 bg-slate-100 rounded-xl border border-slate-200 text-center space-y-2">
              <FileText className="w-12 h-12 text-blue-600 mx-auto" />
              <div className="font-bold text-slate-900">{previewDoc.name}</div>
              <p className="text-[11px] text-slate-500 font-mono">
                Attachment: {previewDoc.file || 'Document_Copy.pdf'} • Status: {previewDoc.status}
              </p>
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Digitally Stamped & Verified by Broker Desk
              </span>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ClaimDetailDocket;
