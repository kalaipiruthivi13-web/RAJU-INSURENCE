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
  ArrowRight,
  Trash2,
  RefreshCw,
  Lock,
  History,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { claimsService, normalizeClaimType, DYNAMIC_CHECKLIST_CONFIG } from '../../services/claimsService';
import ClaimTimeline4Stage from './ClaimTimeline4Stage';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

export function ClaimDetailDocket({
  claim,
  onAdvanceStage,
  onUpdateDocument,
  onAddBill,
  onDeleteBill,
  onAddFollowUp,
  onUpdateSettlement,
  onRegisterNewClaim
}) {
  const { currentUser } = useAppData();

  // EXACTLY 6 TABS: Overview | Documents & Bills | Follow-up | Survey / Assessment | Settlement | Activity Timeline
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'docs_bills' | 'followup' | 'survey' | 'settlement' | 'timeline'

  // Modals state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [showRejectDocModal, setShowRejectDocModal] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // Preserved Form States (Survives tab switching without data loss)
  const [settlementForm, setSettlementForm] = useState({
    assessedAmount: claim?.settlement?.assessedAmount || Math.round((claim?.estimatedLoss || claim?.claimAmountRequested || 35000) * 0.8),
    approvedAmount: claim?.settlement?.approvedAmount || 0,
    paymentReference: claim?.settlement?.paymentReference || '',
    settlementDate: claim?.settlement?.settlementDate || new Date().toISOString().split('T')[0],
    internalTargetDate: claim?.settlementTargetDate || claim?.settlementDueDate || '',
    remarks: claim?.settlement?.remarks || ''
  });

  const [settlementError, setSettlementError] = useState('');

  // Bill Form state
  const [billForm, setBillForm] = useState({
    type: 'Final Garage Repair Bill',
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    vendorName: 'Sundaram Motors Authorized Workshop',
    amount: '18500',
    fileName: 'Garage_Final_Bill_Itemized.pdf'
  });

  // Follow-up Form state
  const [followUpForm, setFollowUpForm] = useState({
    type: 'Phone Call',
    assignedEmployee: currentUser?.name || 'K. Priya (Operations)',
    description: 'Followed up with regional claims surveyor. Inspection report clearance confirmed for tomorrow.',
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    status: 'Completed',
    notes: 'Surveyor submitted preliminary report.'
  });

  // Custom Upload Doc Form
  const [customDocForm, setCustomDocForm] = useState({
    name: '',
    requirementTag: 'Optional',
    fileName: '',
    group: 'If Applicable / Optional'
  });

  // Reject Claim modal state
  const [showRejectClaimModal, setShowRejectClaimModal] = useState(false);
  const [rejectClaimReason, setRejectClaimReason] = useState(
    'Incident occurred outside territorial jurisdiction and before policy inception date.'
  );

  if (!claim) return null;

  // RBAC Permission Check (Section 0 & P7)
  const canManage = !currentUser || !currentUser.role || currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
  const requireAdminMessage = () => {
    alert('Admin or Manager permissions are required to verify, reject, override, or edit the Internal Settlement Target.');
  };

  const settlementStatus = claim.settlement?.status || claim.settlementStatus || (claim.stage === 4 ? 'Settled' : 'Pending');
  const isClaimSettled = settlementStatus === 'Settled' || (claim.stage === 4 && claim.status === 'Settled');
  const isClaimRejected = settlementStatus === 'Rejected' || (claim.stage === 4 && claim.status === 'Rejected');
  const isClaimClosed = isClaimSettled || isClaimRejected;

  // Days remaining calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDateStr = claim.settlementTargetDate || claim.settlementDueDate;
  const daysRemaining = useMemo(() => {
    if (!targetDateStr) return 7;
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [targetDateStr, today]);

  const isHealth = (claim.policyType || '').toLowerCase().includes('health') || (claim.policyType || '').toLowerCase().includes('optima');

  // Documents list strictly from claim.documents or claim.checklistDocuments
  const documentList = useMemo(() => {
    return claim.documents || claim.checklistDocuments || [];
  }, [claim.documents, claim.checklistDocuments]);

  // Grouped Documents (Section 4 & P5):
  // 1. Required at Review
  // 2. Required at Settlement
  // 3. If Applicable / Optional
  // 4. Rejected / Resubmission Required
  const groupedDocuments = useMemo(() => {
    const rejected = documentList.filter((d) => d.status === 'Rejected' || d.status === 'Resubmission Required');
    const nonRejected = documentList.filter((d) => d.status !== 'Rejected' && d.status !== 'Resubmission Required');

    const reqReview = nonRejected.filter((d) => d.requiredAt === 'review' || d.group === 'Required at Review');
    const reqSettlement = nonRejected.filter((d) => d.requiredAt === 'settlement' || d.group === 'Required at Settlement');
    const ifAppOrOpt = nonRejected.filter(
      (d) => (d.requiredAt === 'none' || d.group === 'If Applicable / Optional' || (!d.group && (d.requirementTag === 'If Applicable' || d.requirementTag === 'Optional'))) &&
        !reqReview.includes(d) && !reqSettlement.includes(d)
    );

    return {
      review: reqReview,
      settlement: reqSettlement,
      optional: ifAppOrOpt,
      rejected
    };
  }, [documentList]);

  // Bills list & total calculation
  const billsList = useMemo(() => {
    return claim.bills || [];
  }, [claim.bills]);

  const totalBillsAmount = useMemo(() => {
    return billsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  }, [billsList]);

  // Follow-ups list
  const followUpsList = useMemo(() => {
    return claim.followUps || [];
  }, [claim.followUps]);

  // Timeline list
  const timelineList = useMemo(() => {
    return claim.timeline || [];
  }, [claim.timeline]);

  // Stage 3 progression check
  const stage3Check = useMemo(() => {
    return claimsService.canMoveToStage3(claim);
  }, [claim]);

  // Document Handlers
  const handleUploadDoc = (doc) => {
    const fileName = `${doc.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}_uploaded.pdf`;
    const todayStr = new Date().toISOString().split('T')[0];
    onUpdateDocument(claim.claimNo || claim.id, doc.id, {
      status: 'Under Review',
      fileName,
      uploadedBy: currentUser?.name || 'K. Priya (Operations)',
      uploadedDate: todayStr
    });
  };

  const handleVerifyDoc = (doc) => {
    if (!canManage) {
      requireAdminMessage();
      return;
    }
    onUpdateDocument(claim.claimNo || claim.id, doc.id, {
      status: 'Verified',
      updatedAt: new Date().toLocaleDateString('en-GB')
    });
  };

  const handleOpenRejectDocModal = (doc) => {
    if (!canManage) {
      requireAdminMessage();
      return;
    }
    setRejectingDocId(doc.id);
    setDocRejectReason('Document unclear / official seal missing. Re-submission required.');
    setShowRejectDocModal(true);
  };

  const handleConfirmRejectDoc = () => {
    if (rejectingDocId) {
      onUpdateDocument(claim.claimNo || claim.id, rejectingDocId, {
        status: 'Rejected',
        rejectReason: docRejectReason || 'Re-submission required'
      });
      setRejectingDocId(null);
      setDocRejectReason('');
      setShowRejectDocModal(false);
    }
  };

  const handleMarkNotApplicable = (doc) => {
    onUpdateDocument(claim.claimNo || claim.id, doc.id, {
      status: 'Not Applicable',
      requirementTag: 'Optional',
      requiredAt: 'none',
      group: 'If Applicable / Optional'
    });
  };

  const handleAddCustomDoc = (e) => {
    e.preventDefault();
    if (!customDocForm.name.trim()) return;

    const newDoc = {
      id: `doc-custom-${Date.now()}`,
      name: customDocForm.name,
      requirement: customDocForm.requirementTag,
      requirementTag: customDocForm.requirementTag,
      requiredAt: 'none',
      group: 'If Applicable / Optional',
      status: customDocForm.fileName ? 'Uploaded' : 'Pending',
      fileName: customDocForm.fileName || '',
      uploadedBy: currentUser?.name || 'Operations Staff',
      uploadedDate: new Date().toISOString().split('T')[0]
    };

    onUpdateDocument(claim.claimNo || claim.id, newDoc.id, newDoc);
    setShowAddDocModal(false);
    setCustomDocForm({ name: '', requirementTag: 'Optional', fileName: '', group: 'If Applicable / Optional' });
  };

  // Settlement Flow Handlers (Section 6 & P3)
  const handleStartSettlementReview = () => {
    try {
      claimsService.startSettlementReview(claim.claimNo || claim.id);
      if (onUpdateSettlement) {
        onUpdateSettlement(claim.claimNo || claim.id, { status: 'Under Review' });
      }
      setSettlementError('');
    } catch (err) {
      setSettlementError(err.message);
    }
  };

  const handleApproveSettlement = () => {
    if (!canManage) {
      requireAdminMessage();
      return;
    }
    try {
      const amount = Number(settlementForm.approvedAmount);
      if (amount <= 0) {
        setSettlementError('Approved amount must be greater than 0.');
        return;
      }

      // Check Rule 2: All Required at Settlement docs must be Verified
      const check = claimsService.canApproveSettlement(claim.claimNo || claim.id, amount);
      if (!check.canApprove) {
        setSettlementError(check.reason);
        return;
      }

      claimsService.approveSettlement(claim.claimNo || claim.id, amount, settlementForm.remarks);
      if (onUpdateSettlement) {
        onUpdateSettlement(claim.claimNo || claim.id, {
          status: 'Approved',
          approvedAmount: amount,
          remarks: settlementForm.remarks
        });
      }
      setSettlementError('');
    } catch (err) {
      setSettlementError(err.message);
    }
  };

  const handleMarkAsSettled = () => {
    if (!canManage) {
      requireAdminMessage();
      return;
    }
    try {
      if (!settlementForm.paymentReference || !settlementForm.paymentReference.trim()) {
        setSettlementError('Payment / settlement reference (e.g. UTR / NEFT) is required.');
        return;
      }
      if (!settlementForm.settlementDate || !settlementForm.settlementDate.trim()) {
        setSettlementError('Settlement date is required.');
        return;
      }

      claimsService.markAsSettled(claim.claimNo || claim.id, {
        paymentReference: settlementForm.paymentReference,
        settlementDate: settlementForm.settlementDate,
        note: settlementForm.remarks
      });

      if (onUpdateSettlement) {
        onUpdateSettlement(claim.claimNo || claim.id, {
          status: 'Settled',
          bankRefNo: settlementForm.paymentReference,
          settlementDate: settlementForm.settlementDate
        });
      }
      setSettlementError('');
    } catch (err) {
      setSettlementError(err.message);
    }
  };

  const handleConfirmRejectClaim = () => {
    if (!rejectClaimReason.trim()) {
      alert('A rejection reason is mandatory to repudiate a claim.');
      return;
    }
    try {
      claimsService.rejectClaim(claim.claimNo || claim.id, rejectClaimReason);
      if (onUpdateSettlement) {
        onUpdateSettlement(claim.claimNo || claim.id, {
          status: 'Rejected',
          rejectionReason: rejectClaimReason
        });
      }
      setShowRejectClaimModal(false);
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    }
  };

  const handleUpdateInternalTargetDate = () => {
    if (!canManage) {
      requireAdminMessage();
      return;
    }
    if (!settlementForm.internalTargetDate) return;
    claimsService.updateSettlement(claim.claimNo || claim.id, {
      internalDueDate: settlementForm.internalTargetDate
    });
    alert('Internal Settlement Target SLA updated successfully.');
  };

  const handleConfirmOverride = () => {
    if (!canManage) {
      requireAdminMessage();
      return;
    }
    if (!overrideReason.trim()) {
      alert('A mandatory reason is required to override document enforcement.');
      return;
    }
    onAdvanceStage(claim.claimNo || claim.id, 3, { note: overrideReason }, true);
    setShowOverrideModal(false);
    setOverrideReason('');
  };

  // Render document checklist row helper
  const renderDocRow = (item, idx) => {
    const isVerified = item.status === 'Verified';
    const isRejected = item.status === 'Rejected' || item.status === 'Resubmission Required';
    const isUnderReview = item.status === 'Under Review';
    const isPending = item.status === 'Pending' || item.status === 'Required';
    const isNotApplicable = item.status === 'Not Applicable';

    return (
      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
          {idx + 1}
        </td>
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-800 text-xs">{item.name}</span>
          </div>
          {item.rejectReason && (
            <span className="text-[10px] text-rose-600 block font-medium mt-0.5">
              Reason: {item.rejectReason}
            </span>
          )}
        </td>
        <td className="py-2.5 px-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              item.requirementTag === 'Required'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : item.requirementTag === 'If Applicable'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {item.requirementTag || 'Required'}
          </span>
        </td>
        <td className="py-2.5 px-3">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isVerified
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : isRejected
                ? 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold'
                : isUnderReview
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : isNotApplicable
                ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {item.status || 'Pending'}
          </span>
        </td>
        <td className="py-2.5 px-3">
          <span className="font-mono text-[11px] text-slate-800 block truncate max-w-[150px]">
            {item.fileName || '-'}
          </span>
        </td>
        <td className="py-2.5 px-3 text-[11px] text-slate-600">
          {item.uploadedBy || '-'}
        </td>
        <td className="py-2.5 px-3 text-[11px] font-mono text-slate-500">
          {item.uploadedDate || item.updatedAt || '-'}
        </td>
        <td className="py-2.5 px-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => handleUploadDoc(item)}
                  className="px-2 py-1 rounded text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                {item.requirementTag !== 'Required' && (
                  <button
                    type="button"
                    onClick={() => handleMarkNotApplicable(item)}
                    className="px-1.5 py-1 rounded text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title="Mark Not Applicable"
                  >
                    N/A
                  </button>
                )}
              </>
            )}

            {isUnderReview && (
              <>
                <button
                  type="button"
                  onClick={() => handleVerifyDoc(item)}
                  className="px-2 py-1 rounded text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Check className="w-3 h-3" />
                  <span>Verify</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenRejectDocModal(item)}
                  className="px-2 py-1 rounded text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {isRejected && (
              <button
                type="button"
                onClick={() => handleUploadDoc(item)}
                className="px-2 py-1 rounded text-[11px] font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-upload</span>
              </button>
            )}

            {isVerified && (
              <button
                type="button"
                onClick={() => handleUploadDoc(item)}
                className="px-2 py-1 rounded text-[11px] font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-100 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace</span>
              </button>
            )}

            {item.fileName && (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(item)}
                  className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                  title="Preview Document"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Downloading document: ${item.fileName}`)}
                  className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                  title="Download Document"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* 1. DOSSIER MASTER HEADER */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-[#0B1E3D] to-slate-900 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base font-black tracking-wider text-blue-300">
                {claim.claimNo || claim.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-200 uppercase tracking-wider">
                {claim.policyType} &bull; {claim.claimType}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isClaimSettled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : isClaimRejected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                Stage {claim.stage || 1} &bull; {claim.status || 'Open'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
              <span className="font-bold text-white flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                {claim.customerName || claim.clientName}
              </span>
              <span>&bull;</span>
              <span className="font-mono text-slate-300 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                {claim.policyNo || claim.policyNumber} ({claim.insuranceCompany || claim.companyName})
              </span>
              {claim.vehicleNo && (
                <>
                  <span>&bull;</span>
                  <span className="font-mono text-slate-300 font-bold">
                    {claim.vehicleNo}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Internal Settlement Target
              </span>
              <span
                className={`font-mono font-bold text-xs ${
                  daysRemaining < 0
                    ? 'text-rose-400'
                    : daysRemaining === 0
                    ? 'text-amber-300'
                    : 'text-emerald-300'
                }`}
              >
                {claim.settlementTargetDate || claim.settlementDueDate} ({daysRemaining < 0 ? `${Math.abs(daysRemaining)}d Overdue` : `${daysRemaining}d SLA Left`})
              </span>
            </div>

            <div className="h-7 w-px bg-white/20 hidden sm:block mx-1" />

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Assigned Officer
              </span>
              <span className="text-xs font-bold text-slate-200">
                {claim.assignedEmployee || 'K. Priya (Operations)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXACTLY 6 TABS NAVIGATION (Overview | Documents & Bills | Follow-up | Survey / Assessment | Settlement | Activity Timeline) */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('docs_bills')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'docs_bills'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents & Bills</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-800">
            {documentList.length + billsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('followup')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'followup'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Follow-up</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-800">
            {followUpsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('survey')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'survey'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Survey / Assessment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settlement')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settlement'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Settlement</span>
          {isClaimClosed && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-[#1E4E8C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Activity Timeline</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-800">
            {timelineList.length}
          </span>
        </button>
      </div>

      {/* 3. TAB CONTENT PANELS */}
      <div className="p-4">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Overview & 4-Stage Stepper Controls
                </h3>
                <p className="text-[11px] text-slate-500">
                  Comprehensive vitals, policy information, and stage progression controls with document enforcement.
                </p>
              </div>

              {/* Enforcement Warning Banner if blocked from Stage 3 */}
              {claim.stage === 2 && !stage3Check.canAdvance && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px] font-bold">
                      {stage3Check.reason}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOverrideModal(true)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    Proceed anyway →
                  </button>
                </div>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Claimed Loss</span>
                <p className="text-sm font-mono font-black text-slate-900 mt-0.5">
                  ₹{(claim.estimatedLoss || claim.claimAmountRequested || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Assessed Amount</span>
                <p className="text-sm font-mono font-black text-blue-900 mt-0.5">
                  ₹{(claim.settlement?.assessedAmount || Math.round((claim.estimatedLoss || 35000) * 0.8)).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Approved Amount</span>
                <p className="text-sm font-mono font-black text-emerald-900 mt-0.5">
                  ₹{(claim.settlement?.approvedAmount || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Next Follow-up</span>
                <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                  {claim.nextFollowUpDate || 'None Scheduled'}
                </p>
              </div>
            </div>

            {/* 4-Stage Stepper Component */}
            <ClaimTimeline4Stage
              claim={claim}
              onAdvanceStage={onAdvanceStage}
            />
          </div>
        )}

        {/* TAB 2: DOCUMENTS & BILLS */}
        {activeTab === 'docs_bills' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Document Checklist & Itemized Bills
                </h3>
                <p className="text-[11px] text-slate-500">
                  Track dynamic checklist requirements across review and settlement milestones, plus itemized garage & medical invoices.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => setShowAddDocModal(true)}
                  className="text-xs font-bold cursor-pointer"
                >
                  + Upload Document
                </Button>

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
            </div>

            {/* Total Bills Summary Banner */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-blue-950">
                  Total Recorded Invoices & Bills:
                </span>
                <span className="font-mono font-black text-sm text-blue-900">
                  ₹{totalBillsAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-600 font-medium">
                  ({billsList.length} itemized receipts attached)
                </span>
              </div>

              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                Reconciliation Active
              </span>
            </div>

            {/* GROUP 1: Required at Review */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-blue-50/70 px-3 py-1.5 rounded-lg border border-blue-200">
                <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                  1. Required at Review ({groupedDocuments.review.length})
                </span>
                <span className="text-[10px] text-blue-700 font-bold">Mandatory for Survey & Review (Rule 1)</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Document Name</th>
                      <th className="py-2 px-3">Requirement</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3">Uploaded By</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedDocuments.review.map(renderDocRow)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GROUP 2: Required at Settlement */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-emerald-50/70 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  2. Required at Settlement ({groupedDocuments.settlement.length})
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">Mandatory before Settlement Approval (Rule 2)</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Document Name</th>
                      <th className="py-2 px-3">Requirement</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3">Uploaded By</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedDocuments.settlement.map(renderDocRow)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GROUP 3: If Applicable / Optional */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  3. If Applicable / Optional ({groupedDocuments.optional.length})
                </span>
                <span className="text-[10px] text-slate-500 font-bold">Never blocks any stage progression or approval</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Document Name</th>
                      <th className="py-2 px-3">Requirement</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3">Uploaded By</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedDocuments.optional.map(renderDocRow)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GROUP 4: Rejected Documents */}
            {groupedDocuments.rejected.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                  <span className="text-xs font-black text-rose-950 uppercase tracking-wider">
                    4. Rejected / Resubmission Required ({groupedDocuments.rejected.length})
                  </span>
                  <span className="text-[10px] text-rose-700 font-bold">Customer or workshop must re-upload clean copies</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-rose-200">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-rose-100/50 text-rose-900 font-bold text-[10px] uppercase border-b border-rose-200">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Document Name</th>
                        <th className="py-2 px-3">Requirement</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">File Name</th>
                        <th className="py-2 px-3">Uploaded By</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      {groupedDocuments.rejected.map(renderDocRow)}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ITEMIZED BILLS TABLE */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-blue-600" />
                  <span>Itemized Bills & Payment Receipts ({billsList.length})</span>
                </h4>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3">File Name</th>
                      <th className="py-2.5 px-3">Bill Type</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Uploaded Date</th>
                      <th className="py-2.5 px-3">Uploaded By</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billsList.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                          {bill.fileName}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{bill.type}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          ₹{(bill.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{bill.uploadedDate}</td>
                        <td className="py-2.5 px-3 text-slate-700">{bill.uploadedBy}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {bill.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => alert(`Previewing bill: ${bill.fileName}`)}
                              className="px-2 py-1 rounded text-[10px] font-bold text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => alert(`Downloading bill: ${bill.fileName}`)}
                              className="p-1 rounded text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                              title="Download Bill"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteBill(claim.claimNo || claim.id, bill.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete Bill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOLLOW-UP */}
        {activeTab === 'followup' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Follow-up & Communication History
                </h3>
                <p className="text-[11px] text-slate-500">
                  Customer interaction logs, insurer query responses, and next scheduled action dates.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setShowAddFollowUpModal(true)}
                className="text-xs font-bold bg-[#1E4E8C] hover:bg-[#0B1E3D] cursor-pointer"
              >
                + Add Follow-up
              </Button>
            </div>

            {/* Follow-up Timeline Feed */}
            <div className="space-y-3">
              {followUpsList.map((flw) => (
                <div
                  key={flw.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:border-slate-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-900">{flw.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">&bull; {flw.date}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        flw.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {flw.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">{flw.description || flw.notes}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Officer: <strong className="text-slate-700">{flw.assignedEmployee}</strong></span>
                    {flw.nextFollowUpDate && (
                      <span className="font-mono text-blue-700 font-bold">
                        Next Follow-up: {flw.nextFollowUpDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SURVEY / ASSESSMENT */}
        {activeTab === 'survey' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Survey & Loss Assessment Details
                </h3>
                <p className="text-[11px] text-slate-500">
                  Official inspection reports, authorized loss breakdown, and surveyor credentials.
                </p>
              </div>

              {isHealth && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Medical Desk Review (Physical Survey Optional)
                </span>
              )}
            </div>

            {isHealth && (
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Health Claim Notice:</span> Physical on-site vehicle inspection is not required for Health hospitalization dockets. You may pass Stage 3 based on medical discharge summary audit.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Surveyor Particulars
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Surveyor Name:</span>
                    <span className="font-bold text-slate-900">{claim.survey?.surveyorName || 'Er. R. Sundaram'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inspection Date:</span>
                    <span className="font-mono text-slate-800">{claim.survey?.surveyDate || claim.incidentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Survey Status:</span>
                    <span className="font-bold text-emerald-700">{claim.survey?.surveyStatus || 'Completed'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Report Attachment:</span>
                    <span className="font-mono text-blue-700 font-bold">{claim.survey?.reportAttachment || 'Loss_Assessment_Report.pdf'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Assessed Loss Computation
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Claimed Loss:</span>
                    <span className="font-mono font-bold text-slate-900">₹{(claim.estimatedLoss || 35000).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loss Assessed by Surveyor:</span>
                    <span className="font-mono font-bold text-blue-900">₹{(claim.settlement?.assessedAmount || Math.round((claim.estimatedLoss || 35000) * 0.8)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                    <span className="text-slate-700">Remarks:</span>
                    <span className="text-slate-900">{claim.survey?.remarks || 'Damaged parts inspected.'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SETTLEMENT */}
        {activeTab === 'settlement' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Settlement & End-to-End Payout Processing
                </h3>
                <p className="text-[11px] text-slate-500">
                  Manage sanction approvals, release payments, and execute final claim closure (Stage 4).
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Settlement Status:</span>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                    isClaimSettled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : isClaimRejected
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : settlementStatus === 'Under Review'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {settlementStatus}
                </span>
              </div>
            </div>

            {/* Error Message Box */}
            {settlementError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{settlementError}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">
                  Claimed Amount (Read-Only)
                </label>
                <div className="px-3 py-2 bg-slate-200/70 border border-slate-300 rounded-lg font-mono font-bold text-slate-700">
                  ₹{(claim.estimatedLoss || claim.claimAmountRequested || 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Surveyor Assessed Amount (₹)
                </label>
                <input
                  type="number"
                  value={settlementForm.assessedAmount}
                  onChange={(e) => setSettlementForm({ ...settlementForm, assessedAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sanctioned / Approved Amount (₹)
                </label>
                <input
                  type="number"
                  value={settlementForm.approvedAmount}
                  onChange={(e) => setSettlementForm({ ...settlementForm, approvedAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Payment Reference (UTR / NEFT / Cheque)
                </label>
                <input
                  type="text"
                  value={settlementForm.paymentReference}
                  onChange={(e) => setSettlementForm({ ...settlementForm, paymentReference: e.target.value })}
                  placeholder="e.g. NEFT-AXIS-99881122"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Settlement Date
                </label>
                <input
                  type="date"
                  value={settlementForm.settlementDate}
                  onChange={(e) => setSettlementForm({ ...settlementForm, settlementDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Internal Settlement Target (Editable by Admin/Manager)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={settlementForm.internalTargetDate}
                    onChange={(e) => setSettlementForm({ ...settlementForm, internalTargetDate: e.target.value })}
                    className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateInternalTargetDate}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[11px] font-bold text-slate-700 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">
                  Settlement Remarks / Discharge Notes
                </label>
                <input
                  type="text"
                  value={settlementForm.remarks}
                  onChange={(e) => setSettlementForm({ ...settlementForm, remarks: e.target.value })}
                  placeholder="e.g. Final NEFT disbursement completed directly to insured bank account."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons (Section 6 & P3) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {settlementStatus === 'Pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={PlayCircleIcon}
                    onClick={handleStartSettlementReview}
                    className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-white font-bold cursor-pointer"
                  >
                    Start Settlement Review
                  </Button>
                )}

                {settlementStatus === 'Under Review' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Check}
                    onClick={handleApproveSettlement}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Approve Settlement
                  </Button>
                )}

                {(settlementStatus === 'Approved' || settlementStatus === 'Under Review') && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={handleMarkAsSettled}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                  >
                    Mark as Settled (Stage 4)
                  </Button>
                )}
              </div>

              {!isClaimClosed && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Ban}
                  onClick={() => setShowRejectClaimModal(true)}
                  className="text-rose-700 border-rose-300 hover:bg-rose-50 font-bold cursor-pointer"
                >
                  Reject Claim
                </Button>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: ACTIVITY TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Activity & Audit Timeline
                </h3>
                <p className="text-[11px] text-slate-500">
                  Full chronological history from docket creation to latest update, ordered newest first.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-slate-500">
                {timelineList.length} events logged
              </span>
            </div>

            {/* Timeline Stream */}
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-4 py-2">
              {timelineList.map((entry) => (
                <div key={entry.id} className="relative pl-6 group">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-1 ring-blue-300 group-hover:scale-125 transition-transform" />
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-slate-300 transition-all shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{entry.action}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {entry.date} &bull; {entry.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{entry.description}</p>
                    <div className="text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200/50">
                      Actor: {entry.user || entry.actor || 'System'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}

      {/* 1. Preview Document Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={`Preview: ${previewDoc.name}`}
          subtitle={`File: ${previewDoc.fileName || 'document.pdf'}`}
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{previewDoc.fileName || previewDoc.name}</h4>
              <p className="text-xs text-slate-500 mt-1">Status: <span className="font-bold">{previewDoc.status}</span> &bull; Uploaded: {previewDoc.uploadedDate || 'Today'}</p>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg text-xs text-slate-600 max-w-sm mx-auto">
              Simulated document preview viewer. In production, this renders the decrypted binary PDF or high-resolution image blob.
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Add Bill Modal */}
      {showAddBillModal && (
        <Modal
          isOpen={showAddBillModal}
          onClose={() => setShowAddBillModal(false)}
          title="Add Itemized Bill / Receipt"
          subtitle="Record repair invoices, spare parts, or payment receipts"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddBill(claim.claimNo || claim.id, billForm);
              setShowAddBillModal(false);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bill / Document Type</label>
              <select
                value={billForm.type}
                onChange={(e) => setBillForm({ ...billForm, type: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
              >
                <option value="Final Garage Repair Bill">Repair Bill (Garage / Workshop)</option>
                <option value="Hospital Bill">Hospital Bill (Itemized)</option>
                <option value="Payment Receipt">Payment Receipt</option>
                <option value="Other Supporting Bill">Other Supporting Bill</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice / Receipt No</label>
              <input
                type="text"
                value={billForm.invoiceNo}
                onChange={(e) => setBillForm({ ...billForm, invoiceNo: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                value={billForm.amount}
                onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor / Garage Name</label>
              <input
                type="text"
                value={billForm.vendorName}
                onChange={(e) => setBillForm({ ...billForm, vendorName: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddBillModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" type="submit" className="bg-[#1E4E8C] text-white font-bold">Save Bill</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Add Follow-up Modal */}
      {showAddFollowUpModal && (
        <Modal
          isOpen={showAddFollowUpModal}
          onClose={() => setShowAddFollowUpModal(false)}
          title="Log Customer / Insurer Follow-up"
          subtitle="Record phone calls, emails, or field visits"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddFollowUp(claim.claimNo || claim.id, followUpForm);
              setShowAddFollowUpModal(false);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interaction Type</label>
              <select
                value={followUpForm.type}
                onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-semibold"
              >
                <option value="Phone Call">Phone Call</option>
                <option value="Email">Email Communication</option>
                <option value="Insurer Query">Insurer Query / Clarification</option>
                <option value="Field Visit">Field Visit / Workshop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notes & Details</label>
              <textarea
                rows={2}
                required
                value={followUpForm.description}
                onChange={(e) => setFollowUpForm({ ...followUpForm, description: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Follow-up Date (Optional)</label>
              <input
                type="date"
                value={followUpForm.nextFollowUpDate}
                onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpDate: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddFollowUpModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" type="submit" className="bg-[#1E4E8C] text-white font-bold">Log Activity</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. Reject Document Modal */}
      {showRejectDocModal && (
        <Modal
          isOpen={showRejectDocModal}
          onClose={() => setShowRejectDocModal(false)}
          title="Reject Document"
          subtitle="Mandatory rejection reason required for resubmission"
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={docRejectReason}
                onChange={(e) => setDocRejectReason(e.target.value)}
                placeholder="State why this document is unacceptable..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRejectDocModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleConfirmRejectDoc} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Confirm Reject
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Reject Claim Modal */}
      {showRejectClaimModal && (
        <Modal
          isOpen={showRejectClaimModal}
          onClose={() => setShowRejectClaimModal(false)}
          title="Reject Claim (Stage 4 Repudiation)"
          subtitle="Repudiate claim permanently with official grounds"
        >
          <div className="space-y-3 text-xs">
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px]">
              <strong>Rule 3:</strong> Claim rejection is NEVER blocked by missing documents. A mandatory reason is required. The claim will be closed permanently at Stage 4.
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectClaimReason}
                onChange={(e) => setRejectClaimReason(e.target.value)}
                placeholder="State formal repudiation grounds..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRejectClaimModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleConfirmRejectClaim} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                Repudiate & Close Claim
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Override Rule 1 Modal */}
      {showOverrideModal && (
        <Modal
          isOpen={showOverrideModal}
          onClose={() => setShowOverrideModal(false)}
          title="Manager Override: Advance to Stage 3"
          subtitle="Bypass document validation with documented rationale"
        >
          <div className="space-y-3 text-xs">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
              <strong>Rule 4:</strong> Manager override requires a mandatory justification note, which is recorded in the Activity Timeline.
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Override Justification Note <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Authorized by Principal Broker based on physical inspection urgency..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowOverrideModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleConfirmOverride} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                Confirm Override
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Add Custom Doc Modal */}
      {showAddDocModal && (
        <Modal
          isOpen={showAddDocModal}
          onClose={() => setShowAddDocModal(false)}
          title="Upload Extra Document"
          subtitle="Add an ad-hoc or supporting document to the checklist"
        >
          <form onSubmit={handleAddCustomDoc} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Document Name</label>
              <input
                type="text"
                required
                value={customDocForm.name}
                onChange={(e) => setCustomDocForm({ ...customDocForm, name: e.target.value })}
                placeholder="e.g. Supplementary Garage Estimate, NOC Copy"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">File Name</label>
              <input
                type="text"
                value={customDocForm.fileName}
                onChange={(e) => setCustomDocForm({ ...customDocForm, fileName: e.target.value })}
                placeholder="e.g. Supplementary_Estimate.pdf"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddDocModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" type="submit" className="bg-[#1E4E8C] text-white font-bold">Attach Document</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// Icon helper
function PlayCircleIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    </svg>
  );
}

export default ClaimDetailDocket;
