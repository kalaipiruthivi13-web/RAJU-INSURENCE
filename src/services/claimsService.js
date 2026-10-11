import { INITIAL_CLAIMS } from '../data/mockData.js';
import { storeFileBlob, getFileBlob, removeFileBlob, getFileObjectUrl } from './indexedDbStorage.js';

const CLAIMS_STORAGE_KEY = 'raju_claims_store';
const LEGACY_STORAGE_KEY = 'raju_claims_v4';

/**
 * Single Configuration Object for Dynamic Document Checklists
 * Mapping: claimType -> list of { name, requirement, requiredAt }
 */
export const DYNAMIC_CHECKLIST_CONFIG = {
  'motor-accident': [
    { name: 'Claim Form', requirement: 'Required', requiredAt: 'review' },
    { name: 'Policy Copy', requirement: 'Required', requiredAt: 'review' },
    { name: 'RC Copy', requirement: 'Required', requiredAt: 'review' },
    { name: 'Driving Licence', requirement: 'Required', requiredAt: 'review' },
    { name: 'Repair Estimate', requirement: 'Required', requiredAt: 'review' },
    { name: 'Damage Photos', requirement: 'Required', requiredAt: 'review' },
    { name: 'Final Repair Invoice', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'Payment Receipt', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'FIR', requirement: 'If Applicable', requiredAt: 'none' },
    { name: 'Survey Report', requirement: 'If Applicable', requiredAt: 'none' },
    { name: 'Supplementary/Re-inspection Report', requirement: 'If Applicable', requiredAt: 'none' },
    { name: 'Fitness Certificate', requirement: 'If Applicable', requiredAt: 'none' },
    { name: 'Permit', requirement: 'If Applicable', requiredAt: 'none' },
    { name: 'Load Challan', requirement: 'If Applicable', requiredAt: 'none' }
  ],
  'motor-theft': [
    { name: 'Claim Form', requirement: 'Required', requiredAt: 'review' },
    { name: 'Original Policy', requirement: 'Required', requiredAt: 'review' },
    { name: 'Original RC', requirement: 'Required', requiredAt: 'review' },
    { name: 'FIR', requirement: 'Required', requiredAt: 'review' },
    { name: 'Original Vehicle Keys', requirement: 'Required', requiredAt: 'review' },
    { name: 'Sales Invoice', requirement: 'Required', requiredAt: 'review' },
    { name: 'RTO Intimation', requirement: 'Required', requiredAt: 'review' },
    { name: 'Final Police Report / Non-traceable Report', requirement: 'Required', requiredAt: 'review' },
    { name: 'Transfer Papers', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'Indemnity Bond', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'Subrogation Documents', requirement: 'Required', requiredAt: 'settlement' }
  ],
  'health-cashless': [
    { name: 'Health Card', requirement: 'Required', requiredAt: 'review' },
    { name: 'Pre-authorisation Request', requirement: 'Required', requiredAt: 'review' },
    { name: 'Doctor/Hospital & Treatment Details', requirement: 'Required', requiredAt: 'review' },
    { name: 'Pre-authorisation Approval', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'Discharge Summary', requirement: 'Required', requiredAt: 'settlement' }
  ],
  'health-reimbursement': [
    { name: 'Claim Form', requirement: 'Required', requiredAt: 'review' },
    { name: 'Policy Copy', requirement: 'Required', requiredAt: 'review' },
    { name: 'Discharge Summary', requirement: 'Required', requiredAt: 'review' },
    { name: 'Hospital Bill', requirement: 'Required', requiredAt: 'review' },
    { name: 'Hospital Receipt', requirement: 'Required', requiredAt: 'review' },
    { name: 'Investigation Reports', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'Investigation Bills', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'Pharmacy Bills', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'Prescriptions', requirement: 'Required', requiredAt: 'settlement' },
    { name: 'Photo ID/KYC', requirement: 'If Applicable', requiredAt: 'none' },
    { name: 'FIR/MLC', requirement: 'If Applicable', requiredAt: 'none' },
    { name: 'Previous Treatment Papers', requirement: 'If Applicable', requiredAt: 'none' },
    { name: 'Other Policy-specific Documents', requirement: 'Optional', requiredAt: 'none' }
  ]
};

/**
 * Standardize / normalize Claim Type string into config keys
 */
export const normalizeClaimType = (rawType = '', policyType = '') => {
  const c = (rawType || '').toLowerCase();
  const p = (policyType || '').toLowerCase();

  const isHealth = p.includes('health') || p.includes('optima') || p.includes('mediclaim') || p.includes('care') || c.includes('health');
  if (isHealth) {
    if (c.includes('cashless') || c.includes('pre-auth')) return 'health-cashless';
    return 'health-reimbursement';
  }

  if (c.includes('theft')) return 'motor-theft';
  return 'motor-accident';
};

/**
 * Generate checklist template using the config object
 */
export const getDocumentChecklistTemplate = (policyType = '', claimType = '') => {
  const normalizedKey = normalizeClaimType(claimType, policyType);
  const items = DYNAMIC_CHECKLIST_CONFIG[normalizedKey] || DYNAMIC_CHECKLIST_CONFIG['motor-accident'];

  return items.map((item, idx) => {
    let group = 'If Applicable / Optional';
    if (item.requiredAt === 'review') group = 'Required at Review';
    if (item.requiredAt === 'settlement') group = 'Required at Settlement';

    return {
      id: `doc-cl-${idx + 1}`,
      name: item.name,
      requirement: item.requirement,
      requirementTag: item.requirement,
      requiredAt: item.requiredAt,
      group,
      status: 'Pending',
      fileName: '',
      fileId: null,
      fileSize: 0,
      fileType: '',
      uploadedBy: '',
      uploadedDate: '',
      updatedAt: '',
      rejectReason: ''
    };
  });
};

/**
 * Normalize and enrich claim objects into canonical format
 */
export const normalizeClaim = (rawClaim) => {
  if (!rawClaim) return null;

  const claimNo = rawClaim.claimNo || rawClaim.id || `CLM-2024-${Math.floor(100 + Math.random() * 900)}`;
  const customerName = rawClaim.customerName || rawClaim.clientName || 'Valued Customer';
  const mobile = rawClaim.mobile || rawClaim.phone || '+91 98400 00000';
  const insuranceCompany = rawClaim.insuranceCompany || rawClaim.companyName || 'HDFC ERGO';
  const policyNo = rawClaim.policyNo || rawClaim.policyNumber || rawClaim.policyId || 'POL-DEFAULT';

  const rawPType = (rawClaim.policyType || '').toLowerCase();
  const isHealth = rawPType.includes('health') || rawPType.includes('care') || rawPType.includes('optima');
  const policyType = rawClaim.policyType || (isHealth ? 'Health' : 'Motor');

  const claimType = rawClaim.claimType || (isHealth ? 'health-reimbursement' : 'motor-accident');
  const vehicleNo = rawClaim.vehicleNo || rawClaim.vehicleNumber || (isHealth ? '' : 'TN 01 AB 1234');
  const incidentDate = rawClaim.incidentDate || new Date().toISOString().split('T')[0];
  const incidentDescription = rawClaim.incidentDescription || rawClaim.description || 'Incident reported by customer.';

  const estimatedLoss = Number(rawClaim.estimatedLoss ?? rawClaim.claimAmountRequested ?? 35000);

  // Stage (1-4)
  const stage = Number(rawClaim.stage || rawClaim.currentStage || 1);

  // Status ('Open' | 'Waiting for Documents' | 'Submitted to Insurer' | 'Survey Pending' | 'Under Review' | 'Approved' | 'Settled' | 'Rejected')
  let status = rawClaim.status;
  if (!status) {
    if (stage === 4) {
      status = rawClaim.settlementStatus === 'Rejected' ? 'Rejected' : 'Settled';
    } else if (rawClaim.settlementStatus && ['Approved', 'Under Review', 'Settled', 'Rejected'].includes(rawClaim.settlementStatus)) {
      status = rawClaim.settlementStatus;
    } else if (stage === 2) {
      status = 'Submitted to Insurer';
    } else if (stage === 3) {
      status = 'Survey Pending';
    } else {
      status = 'Open';
    }
  }

  const assignedEmployee = rawClaim.assignedEmployee || rawClaim.assignedOfficer || 'K. Priya (Operations)';

  // Calculate Internal Settlement Target (Default registration date + 7 days)
  const createdAt = rawClaim.createdAt || rawClaim.registrationDate || incidentDate;
  let settlementTargetDate = rawClaim.settlementTargetDate || rawClaim.settlementDueDate;
  if (!settlementTargetDate) {
    const regD = new Date(createdAt);
    regD.setDate(regD.getDate() + 7);
    settlementTargetDate = regD.toISOString().split('T')[0];
  }

  const nextFollowUpDate = rawClaim.nextFollowUpDate || (rawClaim.followUps?.[0]?.nextFollowUpDate) || '';
  const lastUpdated = rawClaim.lastUpdated || new Date().toISOString().split('T')[0];

  // Documents
  let documents = rawClaim.documents || rawClaim.checklistDocuments;
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    documents = getDocumentChecklistTemplate(policyType, claimType);
  } else {
    // Ensure all checklist items have standard attributes and group tags
    documents = documents.map((doc, idx) => {
      let group = doc.group;
      if (!group) {
        if (doc.requiredAt === 'review') group = 'Required at Review';
        else if (doc.requiredAt === 'settlement') group = 'Required at Settlement';
        else group = 'If Applicable / Optional';
      }
      return {
        id: doc.id || `doc-cl-${idx + 1}`,
        name: doc.name || 'Document',
        requirement: doc.requirement || doc.requirementTag || 'Required',
        requirementTag: doc.requirementTag || doc.requirement || 'Required',
        requiredAt: doc.requiredAt || (group === 'Required at Review' ? 'review' : group === 'Required at Settlement' ? 'settlement' : 'none'),
        group,
        status: doc.status || 'Pending',
        fileName: doc.fileName || '',
        fileId: doc.fileId || null,
        fileSize: doc.fileSize || 0,
        fileType: doc.fileType || '',
        uploadedBy: doc.uploadedBy || '',
        uploadedDate: doc.uploadedDate || '',
        updatedAt: doc.updatedAt || '',
        rejectReason: doc.rejectReason || ''
      };
    });
  }

  // Bills
  const bills = (rawClaim.bills || []).map((bill, bIdx) => ({
    id: bill.id || `bill-${bIdx + 1}`,
    fileName: bill.fileName || `${bill.invoiceNo || 'bill'}.pdf`,
    type: bill.type || 'Final Garage Repair Bill',
    amount: Number(bill.amount || 0),
    uploadedDate: bill.uploadedDate || bill.date || incidentDate,
    uploadedBy: bill.uploadedBy || 'Operations Staff',
    status: bill.status || 'Verified',
    invoiceNo: bill.invoiceNo || `INV-${bIdx + 100}`,
    vendorName: bill.vendorName || ''
  }));

  // Follow-ups
  const followUps = (rawClaim.followUps || []).map((flw, fIdx) => ({
    id: flw.id || `flw-${fIdx + 1}`,
    date: flw.date || incidentDate,
    type: flw.type || 'Phone Call',
    description: flw.description || flw.notes || 'Follow-up with customer.',
    assignedEmployee: flw.assignedEmployee || assignedEmployee,
    nextFollowUpDate: flw.nextFollowUpDate || '',
    status: flw.status || 'Completed',
    notes: flw.notes || ''
  }));

  // Survey
  const survey = rawClaim.survey || {
    surveyorName: rawClaim.stageDetails?.stage3?.surveyorName || 'Er. R. Sundaram (IRDA SLA-4412)',
    surveyDate: rawClaim.stageDetails?.stage3?.surveyDate || incidentDate,
    assessmentAmount: rawClaim.stageDetails?.stage3?.surveyLossAssessed || Math.round(estimatedLoss * 0.8),
    surveyStatus: rawClaim.stageDetails?.stage3?.completed ? 'Completed' : 'Assigned',
    reportAttachment: 'Survey_Loss_Assessment_Report.pdf',
    remarks: rawClaim.stageDetails?.stage3?.notes || 'Inspection completed.'
  };

  // Settlement & legacy migration
  const legacyPayment = rawClaim.payment || rawClaim.paymentDetails || {};
  let settlement = rawClaim.settlement;
  if (!settlement) {
    const isSettled = stage === 4 && (rawClaim.settlementStatus === 'Settled' || status === 'Settled');
    const isRejected = stage === 4 && (rawClaim.settlementStatus === 'Rejected' || status === 'Rejected');
    let settlementStatus = 'Pending';
    if (isSettled) settlementStatus = 'Settled';
    else if (isRejected) settlementStatus = 'Rejected';
    else if (rawClaim.settlementStatus === 'Approved') settlementStatus = 'Approved';
    else if (rawClaim.settlementStatus === 'Under Review') settlementStatus = 'Under Review';

    settlement = {
      claimedAmount: estimatedLoss,
      assessedAmount: rawClaim.stageDetails?.stage3?.surveyLossAssessed || Math.round(estimatedLoss * 0.8),
      approvedAmount: rawClaim.stageDetails?.stage4?.settlementAmount || legacyPayment.amount || (isSettled ? Math.round(estimatedLoss * 0.75) : 0),
      status: settlementStatus,
      settlementDate: rawClaim.stageDetails?.stage4?.settlementDate || legacyPayment.date || (isSettled ? incidentDate : ''),
      paymentReference: rawClaim.stageDetails?.stage4?.bankRefNo || legacyPayment.reference || legacyPayment.utrNo || (isSettled ? 'NEFT-AXIS-99881122' : ''),
      internalTargetDays: 7,
      internalDueDate: settlementTargetDate,
      remarks: rawClaim.stageDetails?.stage4?.notes || legacyPayment.remarks || ''
    };
  }

  // Timeline
  let timeline = rawClaim.timeline;
  if (!timeline || !Array.isArray(timeline) || timeline.length === 0) {
    timeline = [
      {
        id: 'tl-1',
        date: createdAt,
        time: '10:00 AM',
        user: assignedEmployee,
        actor: assignedEmployee,
        action: 'Claim Registered',
        description: `Claim ${claimNo} initiated for ${customerName} (Estimated loss: ₹${estimatedLoss.toLocaleString('en-IN')})`
      }
    ];
  }

  // Backward compatibility object
  const normalized = {
    // Canonical Data Model fields
    claimNo,
    customerName,
    mobile,
    insuranceCompany,
    policyNo,
    policyType,
    vehicleNo,
    incidentDate,
    claimType,
    estimatedLoss,
    incidentDescription,
    stage,
    status,
    assignedEmployee,
    nextFollowUpDate,
    settlementTargetDate,
    lastUpdated,
    createdAt,
    documents,
    bills,
    followUps,
    survey,
    settlement,
    timeline,

    // Legacy getters and aliases
    id: claimNo,
    clientName: customerName,
    phone: mobile,
    companyName: insuranceCompany,
    policyNumber: policyNo,
    policyId: policyNo,
    vehicleNumber: vehicleNo,
    claimAmountRequested: estimatedLoss,
    currentStage: stage,
    settlementStatus: settlement?.status || status,
    settlementDueDate: settlementTargetDate,
    checklistDocuments: documents,
    stageDetails: rawClaim.stageDetails || {
      stage1: { completed: true, status: 'Registered' },
      stage2: { completed: stage >= 2, status: stage >= 2 ? 'Submitted' : 'Pending' },
      stage3: { completed: stage >= 3, status: stage >= 3 ? 'Survey Complete' : 'Pending' },
      stage4: { completed: stage >= 4, status: stage >= 4 ? settlement?.status : 'Pending' }
    }
  };

  return normalized;
};

class ClaimsService {
  constructor() {
    this.memoryClaims = null;
  }

  /**
   * Reads claims from storage with fallback to mock data
   */
  getClaims() {
    if (typeof window === 'undefined') {
      if (!this.memoryClaims) {
        this.memoryClaims = (INITIAL_CLAIMS || []).map(normalizeClaim);
      }
      return this.memoryClaims;
    }

    try {
      const stored = localStorage.getItem(CLAIMS_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalizedList = parsed.map(normalizeClaim);
          return normalizedList;
        }
      }
    } catch (e) {
      console.warn('Error reading claims from localStorage, fallback to initial mock:', e);
    }

    const initial = (INITIAL_CLAIMS || []).map(normalizeClaim);
    this.saveClaims(initial);
    return initial;
  }

  /**
   * Persists claims to localStorage
   */
  saveClaims(claims) {
    if (typeof window === 'undefined') {
      this.memoryClaims = claims;
      return;
    }
    try {
      localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
      // Keep legacy key in sync for safety
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(claims));
    } catch (e) {
      console.error('Failed to save claims to localStorage:', e);
    }
  }

  /**
   * Retrieve single claim by ID / claimNo
   */
  getClaimById(id) {
    const all = this.getClaims();
    return all.find((c) => c.claimNo === id || c.id === id) || null;
  }

  /**
   * Helper to append a timeline entry and update lastUpdated
   */
  _appendTimeline(claim, action, description, user = 'K. Priya (Operations)') {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    claim.lastUpdated = todayStr;
    if (!claim.timeline) claim.timeline = [];

    claim.timeline.unshift({
      id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: todayStr,
      time: timeStr,
      user,
      actor: user,
      action,
      description
    });
  }

  /**
   * Creates and registers a new claim atomically
   * Supports optional pre-attached files
   */
  createClaim(claimData, attachedFiles = []) {
    const all = this.getClaims();

    // Generate unique sequential claim number
    const year = new Date().getFullYear();
    const existingSameYear = all.filter((c) => (c.claimNo || '').startsWith(`CLM-${year}-`));
    const nextSeq = existingSameYear.length + 101;
    const claimNo = claimData.claimNo || `CLM-${year}-${nextSeq}`;

    const rawPType = (claimData.policyType || '').toLowerCase();
    const isHealth = rawPType.includes('health') || rawPType.includes('care') || rawPType.includes('optima');
    const policyType = isHealth ? 'Health' : 'Motor';
    const claimType = claimData.claimType || (isHealth ? 'health-reimbursement' : 'motor-accident');

    // Generate dynamic checklist
    let checklist = getDocumentChecklistTemplate(policyType, claimType);

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (Number(claimData.settlementTargetDays) || 7));
    const settlementTargetDate = dueDate.toISOString().split('T')[0];

    const estimatedLoss = Number(claimData.estimatedLoss ?? claimData.claimAmountRequested ?? 35000);
    const assignedEmployee = claimData.assignedEmployee || 'K. Priya (Operations)';

    const newClaim = normalizeClaim({
      claimNo,
      customerName: claimData.customerName || claimData.clientName || 'Valued Customer',
      mobile: claimData.mobile || claimData.phone || '+91 98400 00000',
      insuranceCompany: claimData.insuranceCompany || claimData.companyName || 'HDFC ERGO',
      policyNo: claimData.policyNo || claimData.policyNumber || 'POL-DEFAULT',
      policyType,
      vehicleNo: isHealth ? '' : (claimData.vehicleNo || claimData.vehicleNumber || 'TN 01 AB 1234'),
      incidentDate: claimData.incidentDate || todayStr,
      claimType,
      estimatedLoss,
      incidentDescription: claimData.incidentDescription || claimData.description || 'Incident reported.',
      stage: 1,
      status: 'Open',
      assignedEmployee,
      settlementTargetDate,
      createdAt: todayStr,
      lastUpdated: todayStr,
      documents: checklist,
      bills: [],
      followUps: [],
      survey: {
        surveyorName: isHealth ? 'Medical Claims Auditor' : 'Er. R. Sundaram (IRDA SLA-4412)',
        surveyDate: '',
        assessmentAmount: 0,
        surveyStatus: 'Not Assigned',
        reportAttachment: '',
        remarks: ''
      },
      settlement: {
        claimedAmount: estimatedLoss,
        assessedAmount: 0,
        approvedAmount: 0,
        status: 'Pending',
        settlementDate: '',
        paymentReference: '',
        internalTargetDays: 7,
        internalDueDate: settlementTargetDate,
        remarks: ''
      },
      timeline: []
    });

    // Add first timeline entry
    this._appendTimeline(
      newClaim,
      'Claim Registered',
      `Claim ${claimNo} initiated for ${newClaim.customerName} (Estimated loss: ₹${estimatedLoss.toLocaleString('en-IN')})`,
      assignedEmployee
    );

    // Process attached files if provided at registration
    if (attachedFiles && attachedFiles.length > 0) {
      attachedFiles.forEach((fileItem) => {
        const matchingDoc = newClaim.documents.find((d) => d.name === fileItem.docType);
        if (matchingDoc) {
          matchingDoc.status = 'Uploaded';
          matchingDoc.fileName = fileItem.name;
          matchingDoc.fileId = fileItem.fileId || `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          matchingDoc.fileSize = fileItem.size || 0;
          matchingDoc.fileType = fileItem.type || 'application/pdf';
          matchingDoc.uploadedBy = assignedEmployee;
          matchingDoc.uploadedDate = todayStr;
        } else {
          // Extra document ("Other")
          newClaim.documents.push({
            id: `doc-extra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: fileItem.docType || fileItem.name,
            requirement: 'Optional',
            requirementTag: 'Optional',
            requiredAt: 'none',
            group: 'If Applicable / Optional',
            status: 'Uploaded',
            fileName: fileItem.name,
            fileId: fileItem.fileId || `file-${Date.now()}`,
            fileSize: fileItem.size || 0,
            fileType: fileItem.type || 'application/pdf',
            uploadedBy: assignedEmployee,
            uploadedDate: todayStr,
            updatedAt: todayStr,
            rejectReason: ''
          });
        }
        this._appendTimeline(
          newClaim,
          'Document Uploaded',
          `Document uploaded at registration: ${fileItem.name} (${fileItem.docType || 'Supporting'})`,
          assignedEmployee
        );
      });
    }

    all.unshift(newClaim);
    this.saveClaims(all);
    return newClaim;
  }

  /**
   * Rule 1: Validation for Stage 2 -> Stage 3
   * BLOCKED unless (a) every 'review' item is Uploaded or Verified AND (b) status is "Submitted to Insurer"
   */
  canMoveToStage3(claim) {
    if (!claim) return { canAdvance: false, missingDocs: ['Claim not found'] };

    const reviewDocs = (claim.documents || []).filter((d) => d.requiredAt === 'review' || d.group === 'Required at Review');
    const missingDocs = reviewDocs
      .filter((d) => d.status !== 'Uploaded' && d.status !== 'Verified')
      .map((d) => d.name);

    const isSubmitted = claim.status === 'Submitted to Insurer';

    const canAdvance = missingDocs.length === 0 && isSubmitted;
    let reason = '';
    if (missingDocs.length > 0) {
      reason = `Mandatory documents missing. Upload required documents to proceed to Survey / Review: ${missingDocs.join(', ')}`;
    } else if (!isSubmitted) {
      reason = `Claim status must be "Submitted to Insurer" before advancing to Survey / Review.`;
    }

    return {
      canAdvance,
      missingDocs,
      isSubmitted,
      reason
    };
  }

  /**
   * Rule 2: Validation for Settlement Approval & Mark as Settled
   * BLOCKED unless every 'settlement' item is Uploaded or Verified AND all 'review' items are Verified
   */
  canApproveSettlement(claimId, approvedAmount = 0) {
    const claim = typeof claimId === 'string' ? this.getClaimById(claimId) : claimId;
    if (!claim) return { canApprove: false, reason: 'Claim record not found.' };

    if (Number(approvedAmount) <= 0 && (!claim.settlement?.approvedAmount || claim.settlement.approvedAmount <= 0)) {
      return { canApprove: false, reason: 'Approved settlement amount must be greater than zero.' };
    }

    const reviewDocs = (claim.documents || []).filter((d) => d.requiredAt === 'review' || d.group === 'Required at Review');
    const unverifiedReviewDocs = reviewDocs.filter((d) => d.status !== 'Verified').map((d) => d.name);

    const settlementDocs = (claim.documents || []).filter((d) => (d.requiredAt === 'settlement' || d.group === 'Required at Settlement') && d.requirementTag === 'Required');
    const pendingSettlementDocs = settlementDocs.filter((d) => d.status !== 'Uploaded' && d.status !== 'Verified').map((d) => d.name);

    const missingOrUnverified = [...unverifiedReviewDocs, ...pendingSettlementDocs];

    if (missingOrUnverified.length > 0) {
      return {
        canApprove: false,
        reason: `Mandatory documents unverified or missing for settlement approval: ${missingOrUnverified.join(', ')}.`,
        missingDocs: missingOrUnverified
      };
    }

    return { canApprove: true, reason: '' };
  }

  /**
   * P3 / Rule 5 / Section 5: Stage progression with mandatory note & override
   */
  updateStage(claimId, targetStage, stageData = {}, isOverride = false) {
    const all = this.getClaims();
    const index = all.findIndex((c) => c.claimNo === claimId || c.id === claimId);
    if (index === -1) throw new Error(`Claim ${claimId} not found`);

    const claim = all[index];
    const prevStage = claim.stage;
    const note = stageData.note || stageData.transitionNote || 'Stage progression confirmed.';

    if (!note.trim()) {
      throw new Error('A transition note is required when moving stages.');
    }

    // Health claims survey bypass check (Rule 5)
    const isHealth = (claim.policyType || '').toLowerCase().includes('health');

    // Rule 1 Enforcement for advancing from Stage 2 to Stage 3
    if (targetStage === 3 && prevStage < 3 && !isOverride) {
      const check = this.canMoveToStage3(claim);
      if (!check.canAdvance) {
        throw new Error(check.reason);
      }
    }

    claim.stage = Number(targetStage);
    claim.currentStage = Number(targetStage);

    // Update status based on stage
    if (targetStage === 1) {
      claim.status = 'Open';
    } else if (targetStage === 2) {
      claim.status = stageData.status || 'Submitted to Insurer';
    } else if (targetStage === 3) {
      claim.status = isHealth ? 'Under Review' : 'Survey Pending';
    } else if (targetStage === 4) {
      if (claim.settlement?.status === 'Settled') {
        claim.status = 'Settled';
      } else if (claim.settlement?.status === 'Rejected') {
        claim.status = 'Rejected';
      } else {
        claim.status = 'Under Review';
      }
    }

    const actionTitle = isOverride
      ? `Stage Override: Advanced to Stage ${targetStage}`
      : `Advanced to Stage ${targetStage}`;

    const user = stageData.user || 'K. Priya (Operations)';
    this._appendTimeline(claim, actionTitle, `Note: ${note}${isOverride ? ' [Manager Override]' : ''}`, user);

    all[index] = normalizeClaim(claim);
    this.saveClaims(all);
    return all[index];
  }

  /**
   * P3: Start Settlement Review
   * settlement.status: Pending -> Under Review (claim now appears in Settlement Tracking)
   */
  startSettlementReview(claimId, user = 'K. Priya (Operations)') {
    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    if (!claim.settlement) {
      claim.settlement = {};
    }

    claim.settlement.status = 'Under Review';
    claim.status = 'Under Review';
    claim.settlementStatus = 'Under Review';

    this._appendTimeline(claim, 'Settlement Review Started', 'Claim entered Settlement Review stage; active in Settlement Tracking.', user);

    this.saveClaims(all);
    return claim;
  }

  /**
   * P3: Approve Settlement
   * Requires approvedAmount > 0 and Rule 2 check
   */
  approveSettlement(claimId, approvedAmount, remarks = '', user = 'R. Rajkumar (Principal Broker)') {
    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    const amount = Number(approvedAmount);
    if (amount <= 0) {
      throw new Error('Approved settlement amount must be greater than zero.');
    }

    const check = this.canApproveSettlement(claim, amount);
    if (!check.canApprove) {
      throw new Error(check.reason);
    }

    if (!claim.settlement) claim.settlement = {};
    claim.settlement.status = 'Approved';
    claim.settlement.approvedAmount = amount;
    claim.settlement.remarks = remarks || claim.settlement.remarks;

    claim.status = 'Approved';
    claim.settlementStatus = 'Approved';

    this._appendTimeline(
      claim,
      'Settlement Approved',
      `Settlement sanctioned for ₹${amount.toLocaleString('en-IN')}. ${remarks ? `Remarks: ${remarks}` : ''}`,
      user
    );

    this.saveClaims(all);
    return claim;
  }

  /**
   * P3: Mark as Settled
   * Sets status = 'Settled', stage = 4, claim CLOSED
   */
  markAsSettled(claimId, { paymentReference, settlementDate, note = '' }, user = 'R. Rajkumar (Principal Broker)') {
    if (!paymentReference || !paymentReference.trim()) {
      throw new Error('Payment / settlement reference (e.g. UTR / NEFT) is required to settle claim.');
    }
    if (!settlementDate || !settlementDate.trim()) {
      throw new Error('Official settlement disbursement date is required.');
    }

    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    if (!claim.settlement) claim.settlement = {};
    claim.settlement.status = 'Settled';
    claim.settlement.paymentReference = paymentReference;
    claim.settlement.settlementDate = settlementDate;
    claim.settlement.remarks = note || claim.settlement.remarks;

    claim.stage = 4;
    claim.currentStage = 4;
    claim.status = 'Settled';
    claim.settlementStatus = 'Settled';

    this._appendTimeline(
      claim,
      'Claim Settled & Closed',
      `Payment reference ${paymentReference} released on ${settlementDate}. Claim marked as Settled (Stage 4).`,
      user
    );

    this.saveClaims(all);
    return claim;
  }

  /**
   * P3 / Rule 3: Reject Claim (at any stage, never blocked by documents)
   * Sets status = 'Rejected', stage = 4, claim CLOSED
   */
  rejectClaim(claimId, reason, user = 'R. Rajkumar (Principal Broker)') {
    if (!reason || !reason.trim()) {
      throw new Error('A rejection reason is mandatory to repudiate a claim.');
    }

    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    if (!claim.settlement) claim.settlement = {};
    claim.settlement.status = 'Rejected';
    claim.settlement.rejectionReason = reason;

    claim.stage = 4;
    claim.currentStage = 4;
    claim.status = 'Rejected';
    claim.settlementStatus = 'Rejected';

    this._appendTimeline(
      claim,
      'Claim Repudiated / Rejected',
      `Claim rejected and closed at Stage 4. Reason: ${reason}`,
      user
    );

    this.saveClaims(all);
    return claim;
  }

  /**
   * Document Updates (Upload, Verify, Reject, Resubmit)
   */
  updateDocument(claimId, docId, updates, user = 'K. Priya (Operations)') {
    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    const docIndex = (claim.documents || []).findIndex((d) => d.id === docId);
    if (docIndex === -1) throw new Error(`Document ${docId} not found on claim`);

    const doc = claim.documents[docIndex];
    const prevStatus = doc.status;

    if (updates.status === 'Rejected') {
      if (!updates.rejectReason || !updates.rejectReason.trim()) {
        throw new Error('A rejection reason is mandatory when rejecting a document.');
      }
      updates.status = 'Resubmission Required'; // Per prompt: status becomes Resubmission Required until new file is uploaded
    }

    Object.assign(doc, updates);

    // Timeline event
    if (updates.status === 'Verified') {
      this._appendTimeline(claim, 'Document Verified', `Document verified: ${doc.name}`, user);
    } else if (updates.status === 'Resubmission Required' || updates.status === 'Rejected') {
      this._appendTimeline(claim, 'Document Rejected', `Document rejected: ${doc.name}. Reason: ${updates.rejectReason}`, user);
    } else if (updates.status === 'Uploaded' || updates.fileName) {
      this._appendTimeline(claim, 'Document Uploaded', `Document uploaded: ${doc.name} (${doc.fileName})`, user);
    }

    this.saveClaims(all);
    return doc;
  }

  /**
   * Bills management
   */
  addBill(claimId, billData, user = 'K. Priya (Operations)') {
    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    if (!claim.bills) claim.bills = [];

    const newBill = {
      id: billData.id || `bill-${Date.now()}`,
      fileName: billData.fileName || `${billData.invoiceNo || 'bill'}.pdf`,
      fileId: billData.fileId || null,
      type: billData.type || 'Final Garage Repair Bill',
      amount: Number(billData.amount || 0),
      uploadedDate: billData.uploadedDate || new Date().toISOString().split('T')[0],
      uploadedBy: user,
      status: billData.status || 'Verified',
      invoiceNo: billData.invoiceNo || `INV-${Date.now().toString().slice(-4)}`,
      vendorName: billData.vendorName || ''
    };

    claim.bills.push(newBill);
    this._appendTimeline(claim, 'Bill Recorded', `Bill recorded: ${newBill.type} (${newBill.fileName}) for ₹${newBill.amount.toLocaleString('en-IN')}`, user);

    this.saveClaims(all);
    return newBill;
  }

  deleteBill(claimId, billId, user = 'K. Priya (Operations)') {
    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    claim.bills = (claim.bills || []).filter((b) => b.id !== billId);
    this._appendTimeline(claim, 'Bill Removed', `Bill ID ${billId} removed from docket`, user);

    this.saveClaims(all);
    return true;
  }

  /**
   * Follow-up interactions
   */
  addFollowUp(claimId, followUpData, user = 'K. Priya (Operations)') {
    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    if (!claim.followUps) claim.followUps = [];

    const todayStr = new Date().toISOString().split('T')[0];
    const newFollowUp = {
      id: followUpData.id || `flw-${Date.now()}`,
      date: followUpData.date || todayStr,
      type: followUpData.type || 'Phone Call',
      description: followUpData.description || followUpData.notes || 'Follow-up interaction logged.',
      assignedEmployee: followUpData.assignedEmployee || user,
      nextFollowUpDate: followUpData.nextFollowUpDate || '',
      status: followUpData.status || 'Completed',
      notes: followUpData.notes || ''
    };

    claim.followUps.unshift(newFollowUp);

    // Sync claim's nextFollowUpDate
    if (newFollowUp.nextFollowUpDate) {
      claim.nextFollowUpDate = newFollowUp.nextFollowUpDate;
    }

    this._appendTimeline(
      claim,
      'Follow-up Logged',
      `${newFollowUp.type}: ${newFollowUp.description}${newFollowUp.nextFollowUpDate ? ` (Next: ${newFollowUp.nextFollowUpDate})` : ''}`,
      user
    );

    this.saveClaims(all);
    return newFollowUp;
  }

  /**
   * Update settlement parameters & Internal Settlement Target
   */
  updateSettlement(claimId, settlementUpdates, user = 'R. Rajkumar (Principal Broker)') {
    const all = this.getClaims();
    const claim = all.find((c) => c.claimNo === claimId || c.id === claimId);
    if (!claim) throw new Error(`Claim ${claimId} not found`);

    if (!claim.settlement) claim.settlement = {};
    Object.assign(claim.settlement, settlementUpdates);

    if (settlementUpdates.internalDueDate) {
      claim.settlementTargetDate = settlementUpdates.internalDueDate;
      claim.settlementDueDate = settlementUpdates.internalDueDate;
    }

    this._appendTimeline(claim, 'Settlement Parameters Updated', 'Settlement parameters or SLA target updated.', user);
    this.saveClaims(all);
    return claim.settlement;
  }

  /**
   * Helper: Check if a claim is closed
   */
  isClaimClosed(claim) {
    if (!claim) return false;
    const st = claim.status;
    const sst = claim.settlement?.status || claim.settlementStatus;
    return st === 'Settled' || st === 'Rejected' || sst === 'Settled' || sst === 'Rejected';
  }

  /**
   * Helper: Check if a claim is in Settlement Processing
   * closed === false AND settlement.status in ('Under Review', 'Approved')
   */
  isInSettlementProcessing(claim) {
    if (this.isClaimClosed(claim)) return false;
    const sst = claim.settlement?.status || claim.settlementStatus;
    return sst === 'Under Review' || sst === 'Approved';
  }

  /**
   * Helper: Check if claim is pending with pending reason
   * closed === false AND NOT in Settlement Processing AND has action pending
   */
  getPendingInfo(claim) {
    if (this.isClaimClosed(claim)) return { isPending: false, reason: '' };
    if (this.isInSettlementProcessing(claim)) return { isPending: false, reason: '' };

    // Check action pending
    const docs = claim.documents || [];
    const missingReview = docs.filter((d) => (d.requiredAt === 'review' || d.group === 'Required at Review') && (d.status === 'Pending' || d.status === 'Required'));
    const rejectedDocs = docs.filter((d) => d.status === 'Rejected' || d.status === 'Resubmission Required');

    if (rejectedDocs.length > 0) {
      return { isPending: true, reason: `Resubmission Required (${rejectedDocs[0].name})` };
    }
    if (missingReview.length > 0) {
      return { isPending: true, reason: `Missing Documents (${missingReview[0].name})` };
    }

    if (claim.stage === 3 && claim.survey?.surveyStatus !== 'Completed') {
      return { isPending: true, reason: 'Surveyor Inspection Pending' };
    }

    if (claim.nextFollowUpDate) {
      const today = new Date().toISOString().split('T')[0];
      if (claim.nextFollowUpDate <= today) {
        return { isPending: true, reason: 'Follow-up Due / Overdue' };
      }
    }

    if (claim.stage === 4 && (claim.settlement?.status === 'Pending' || !claim.settlement?.status)) {
      return { isPending: true, reason: 'Settlement Review Not Started' };
    }

    return { isPending: true, reason: 'Action in Progress' };
  }

  /**
   * Comprehensive Filter Engine with Mutual Exclusivity (P4 / Section 7)
   */
  filterClaims(claims, filters = {}) {
    const {
      view = 'ALL', // 'ALL' | 'PENDING' | 'SETTLEMENTS'
      product = 'ALL',
      status = 'ALL',
      insurer = 'ALL',
      employee = 'ALL',
      claimType = 'ALL',
      search = '',
      dateFrom = '',
      dateTo = ''
    } = filters;

    return claims.filter((claim) => {
      const isClosed = this.isClaimClosed(claim);
      const isSettlement = this.isInSettlementProcessing(claim);
      const pendingInfo = this.getPendingInfo(claim);

      // Mutual Exclusivity for Views
      if (view === 'SETTLEMENTS') {
        if (!isSettlement) return false;
      } else if (view === 'PENDING') {
        // Must NOT be in Settlement Processing and must NOT be closed
        if (isClosed || isSettlement || !pendingInfo.isPending) return false;
      }

      // Product filter
      if (product !== 'ALL') {
        const pType = (claim.policyType || '').toLowerCase();
        if (product.toLowerCase() === 'motor' && !pType.includes('motor')) return false;
        if (product.toLowerCase() === 'health' && !pType.includes('health') && !pType.includes('care') && !pType.includes('optima')) return false;
      }

      // Status filter
      if (status !== 'ALL') {
        const cStatus = (claim.status || '').toLowerCase();
        const sStatus = (claim.settlement?.status || '').toLowerCase();
        const target = status.toLowerCase();
        if (cStatus !== target && sStatus !== target) return false;
      }

      // Insurer filter
      if (insurer !== 'ALL') {
        const cInsurer = (claim.insuranceCompany || claim.companyName || '').toLowerCase();
        if (!cInsurer.includes(insurer.toLowerCase())) return false;
      }

      // Employee filter
      if (employee !== 'ALL') {
        const cEmp = (claim.assignedEmployee || '').toLowerCase();
        if (!cEmp.includes(employee.toLowerCase())) return false;
      }

      // Claim Type filter
      if (claimType !== 'ALL') {
        const cType = (claim.claimType || '').toLowerCase();
        if (!cType.includes(claimType.toLowerCase())) return false;
      }

      // Incident Date Range filter
      if (dateFrom && claim.incidentDate && claim.incidentDate < dateFrom) return false;
      if (dateTo && claim.incidentDate && claim.incidentDate > dateTo) return false;

      // Search Query filter
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        const matchNo = (claim.claimNo || '').toLowerCase().includes(q);
        const matchCustomer = (claim.customerName || '').toLowerCase().includes(q);
        const matchPolicy = (claim.policyNo || '').toLowerCase().includes(q);
        const matchVehicle = (claim.vehicleNo || '').toLowerCase().includes(q);
        const matchInsurer = (claim.insuranceCompany || '').toLowerCase().includes(q);
        if (!matchNo && !matchCustomer && !matchPolicy && !matchVehicle && !matchInsurer) return false;
      }

      return true;
    });
  }
}

export const claimsService = new ClaimsService();
export default claimsService;
