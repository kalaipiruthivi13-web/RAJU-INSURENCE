import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_POLICIES,
  INITIAL_CLAIMS,
  INITIAL_LOANS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVES
} from '../data/mockData';
import { INSURANCE_PARTNERS, MOCK_REPOSITORY_DOCS, MOCK_PRODUCTS } from '../data/mockInsurancePartners';
import { claimsService } from '../services/claimsService';

const AppDataContext = createContext(null);

export const INITIAL_ACTION_REQUIRED = [
  {
    id: 'ACT-01',
    title: '5 Pending Approvals',
    description: 'High IDV (>₹20L) & Special Broker Discount overrides awaiting sign-off',
    severity: 'high',
    count: 5,
    actionLabel: 'Review Approvals',
    targetTab: 'applications',
    borderAccent: '#6366F1' // Indigo
  },
  {
    id: 'ACT-02',
    title: '3 Claims Follow-up Overdue',
    description: 'Surveyor inspection report pending >48 hours for New India & HDFC claims',
    severity: 'urgent',
    count: 3,
    actionLabel: 'Follow-up Surveyors',
    targetTab: 'claims',
    borderAccent: '#F59E0B' // Amber
  },
  {
    id: 'ACT-03',
    title: '7 Renewals Due in 7 Days',
    description: 'Critical policies expiring within 7 days. Customer reminder required.',
    severity: 'warning',
    count: 7,
    actionLabel: 'Send Reminder →',
    targetTab: 'renewals',
    borderAccent: '#EC4899' // Pink
  },
  {
    id: 'ACT-04',
    title: '4 Documents Pending Verification',
    description: 'Vehicle RC Book & medical discharge summaries awaiting KYC team sign-off',
    severity: 'medium',
    count: 4,
    actionLabel: 'Verify Documents',
    targetTab: 'repository',
    borderAccent: '#10B981' // Emerald
  }
];

export const INITIAL_QUOTES = [
  {
    id: 'QT-2024-901',
    clientName: 'G. Shanmugam (Logistics)',
    product: 'Commercial Goods Vehicle',
    vehicleNumber: 'TN 22 DK 8812',
    preferredInsurer: 'New India Assurance',
    idv: 1450000,
    quoteAmount: 38400,
    createdDate: '2024-09-18',
    status: 'Pending Client Approval'
  },
  {
    id: 'QT-2024-902',
    clientName: 'Dr. Aruna Vasanth',
    product: 'Health Care Supreme (Family)',
    vehicleNumber: 'N/A (Health)',
    preferredInsurer: 'Care Health',
    idv: 2500000,
    quoteAmount: 24600,
    createdDate: '2024-09-19',
    status: 'Underwriting Review'
  },
  {
    id: 'QT-2024-903',
    clientName: 'Praveen Kumar R.',
    product: 'Private Car Comprehensive',
    vehicleNumber: 'TN 02 CD 4455',
    preferredInsurer: 'HDFC ERGO',
    idv: 780000,
    quoteAmount: 16200,
    createdDate: '2024-09-20',
    status: 'Ready for Issuance'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-101',
    user: 'R. Rajkumar (Principal Broker)',
    action: 'Special Discount Override Approved (5%)',
    entity: 'POL-2024-7712',
    time: '2024-09-20 10:14 AM'
  },
  {
    id: 'AUD-102',
    user: 'S. Suresh (Claims Coordinator)',
    action: 'Claim Advanced to Stage 4 (Survey Assigned)',
    entity: 'CLM-2024-101',
    time: '2024-09-20 11:45 AM'
  },
  {
    id: 'AUD-103',
    user: 'M. Deepika (Retention Officer)',
    action: '30-Day WhatsApp Renewal Notice Dispatched',
    entity: 'POL-2024-6540',
    time: '2024-09-20 02:15 PM'
  }
];

export const INITIAL_TOWING_JOBS = [
  {
    id: 'TOW-2026-00125',
    billNo: 'TOW-BILL-2026-00125',
    requestDateTime: '08/10/2026 07:10 PM',
    pickupDateTime: '08/10/2026 07:20 PM',
    policyNumber: 'POL-2024-8891',
    vehicleNumber: 'TN 09 BX 4512',
    clientName: 'R. Karthikeyan',
    phone: '+91 98412 34567',
    breakdownLocation: 'GST Road, Near Kathipara Flyover, Chennai',
    destinationWorkshop: 'Authorized Maruti Service Center, Guindy',
    breakdownReason: 'Accident Collision / Non-Driveable',
    towType: 'Flatbed Tow Truck',
    vehicleCondition: 'Non-Driveable',
    estimatedDistanceKm: 18.5,
    actualDistanceKm: 18.5,
    partnerName: 'TVS Auto Assist 24x7',
    partnerPhone: '+91 98409 11223',
    towTruckNo: 'TN 09 TC 4488',
    driverName: 'S. Velu',
    driverPhone: '+91 94441 66778',
    rateCard: 'Standard',
    baseTowingCharge: 450,
    baseIncludedKm: 10,
    ratePerKm: 25,
    labourTowing: 200,
    labourRecovery: 100,
    labourLoading: 0,
    labourAdditionalHours: 0,
    labourRatePerHour: 150,
    freeWaitingMin: 30,
    actualWaitingMin: 55,
    waitingRatePer30Min: 100,
    nightChargeEnabled: false,
    nightChargeAmount: 200,
    expressChargeEnabled: false,
    expressChargeAmount: 150,
    tollChargeAmount: 150,
    parkingChargeAmount: 0,
    otherChargeAmount: 0,
    eligibleCoverage: 1500,
    alreadyUsedCoverage: 500,
    jobStatus: 'Dispatched',
    paymentStatus: 'Pending',
    paymentMethod: 'UPI',
    transactionId: '',
    paymentDate: '',
    documents: [
      { id: 'doc-1', name: 'Breakdown Spot Photo.jpg', category: 'Breakdown Photo', status: 'Uploaded', url: '#' },
      { id: 'doc-2', name: 'Front Bumper Condition.jpg', category: 'Vehicle Condition Photo', status: 'Uploaded', url: '#' },
      { id: 'doc-3', name: 'Flatbed Tow Truck Spot.jpg', category: 'Tow Truck Photo', status: 'Uploaded', url: '#' },
      { id: 'doc-4', name: 'Workshop Delivery Acknowledgement.pdf', category: 'Delivery Confirmation', status: 'Pending', url: '#' }
    ]
  }
];

export const INITIAL_APPLICATIONS = [
  {
    id: 'APP-2024-551',
    clientName: 'Senthil Nathan K.',
    phone: '+91 98410 77654',
    email: 'senthil.nathan@gmail.com',
    productType: 'Motor Comprehensive (Zero Dep)',
    assetRef: 'TN 07 DJ 2341 (Hyundai Creta)',
    createdDate: '2024-09-20',
    status: 'Draft',
    stepProgress: 'Step 3 of 7 (Coverage Selected)',
    payablePremium: 18486,
    paymentStatus: 'Pending',
    paymentMethod: 'N/A'
  },
  {
    id: 'APP-2024-552',
    clientName: 'Dr. Aruna Vasanth',
    phone: '+91 94441 55210',
    email: 'aruna.vasanth@apollo.org',
    productType: 'Health Care Supreme (Family)',
    assetRef: '4 Insured Members',
    createdDate: '2024-09-19',
    status: 'Pending Issuance',
    stepProgress: 'Step 7 of 7 (Review Completed)',
    payablePremium: 28650,
    paymentStatus: 'Pending',
    paymentMethod: 'N/A'
  },
  {
    id: 'APP-2024-548',
    clientName: 'Apex Logistics Pvt Ltd',
    phone: '+91 99620 11456',
    email: 'operations@apexlogistics.in',
    productType: 'Commercial Goods Vehicle Fleet',
    assetRef: 'TN 22 DK 8812 (Tata 407)',
    createdDate: '2024-09-18',
    status: 'Completed & Bound',
    stepProgress: 'Policy POL-2024-8891 Issued',
    payablePremium: 42500,
    paymentStatus: 'Paid',
    paymentMethod: 'NetBanking'
  }
];

export const USERS = {
  ADMIN: {
    id: 'USR-ADMIN-01',
    name: 'R. Rajkumar',
    role: 'ADMIN',
    roleLabel: 'Admin',
    roleTitle: 'Principal Broker',
    email: 'rajkumar@rajuvendor.in',
    phone: '+91 94440 12345',
    license: 'IRDA/DB-784/21',
    initials: 'RR',
    avatarBg: 'bg-indigo-600'
  },
  USER: {
    id: 'USR-STAFF-02',
    name: 'K. Priya',
    role: 'USER',
    roleLabel: 'Staff / User',
    roleTitle: 'Operations Executive',
    email: 'priya.k@rajuvendor.in',
    phone: '+91 98410 77889',
    license: 'IRDA/POSP-4412',
    initials: 'KP',
    avatarBg: 'bg-blue-600'
  }
};

export function AppDataProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('raju_current_user');
    return saved ? JSON.parse(saved) : USERS.ADMIN;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('raju_is_authenticated');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // LocalStorage / In-memory state
  const [policies, setPolicies] = useState(() => {
    const saved = localStorage.getItem('raju_policies');
    return saved ? JSON.parse(saved) : INITIAL_POLICIES;
  });

  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem('raju_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('raju_applications', JSON.stringify(applications));
  }, [applications]);

  const [claims, setClaims] = useState(() => {
    return claimsService.getClaims();
  });

  useEffect(() => {
    claimsService.saveClaims(claims);
  }, [claims]);

  const [selectedClaimId, setSelectedClaimId] = useState('CLM-2024-105');
  const [showRegisterClaimModal, setShowRegisterClaimModal] = useState(false);
  const [showTowingModal, setShowTowingModal] = useState(false);

  const [towingJobs, setTowingJobs] = useState(() => {
    const saved = localStorage.getItem('raju_towing_jobs');
    return saved ? JSON.parse(saved) : INITIAL_TOWING_JOBS;
  });

  useEffect(() => {
    localStorage.setItem('raju_towing_jobs', JSON.stringify(towingJobs));
  }, [towingJobs]);

  const [claimsFilter, setClaimsFilter] = useState({
    subTab: 'ALL', // 'ALL' | 'PENDING' | 'SETTLEMENTS'
    settlementSubFilter: 'ALL', // 'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'DUE_7_DAYS' | 'PROCESSING' | 'SETTLED'
    stageFilter: null // null | 1 | 2 | 3 | 4
  });

  const navigateToClaimsWithFilter = (subTab = 'ALL', settlementSubFilter = 'ALL', stageFilter = null) => {
    setClaimsFilter({
      subTab,
      settlementSubFilter,
      stageFilter
    });
    if (subTab === 'PENDING') {
      setActiveTab('claims-pending');
    } else if (subTab === 'SETTLEMENTS') {
      setActiveTab('claims-settlements');
    } else {
      setActiveTab('claims');
    }
  };

  const checkPolicyClaimStatus = (policyId) => {
    if (!policyId) return { hasUnresolvedClaim: false, claim: null };
    const policy = policies.find((p) => p.id === policyId);

    const matchedClaim = claims.find((c) => {
      const matchPolicy = c.policyId === policyId;
      const matchVehicle = policy?.vehicleNumber && c.vehicleNumber && policy.vehicleNumber.trim().toUpperCase() === c.vehicleNumber.trim().toUpperCase();
      return matchPolicy || matchVehicle;
    });

    if (!matchedClaim) return { hasUnresolvedClaim: false, claim: null };

    const isSettled =
      (matchedClaim.currentStage === 4 && (matchedClaim.stageDetails?.stage4?.status === 'Settled' || matchedClaim.stageDetails?.stage4?.completed)) ||
      matchedClaim.settlementStatus === 'Settled' ||
      matchedClaim.settlementStatus === 'Closed';

    return {
      hasUnresolvedClaim: !isSettled,
      claim: matchedClaim
    };
  };

  const navigateToClaim = (claimId) => {
    setSelectedClaimId(claimId);
    setActiveTab('claims');
  };

  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem('raju_loans');
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('raju_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [leaves, setLeaves] = useState(() => {
    const saved = localStorage.getItem('raju_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [actionTasks, setActionTasks] = useState(INITIAL_ACTION_REQUIRED);
  const [repositoryDocs, setRepositoryDocs] = useState(MOCK_REPOSITORY_DOCS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('raju_policies', JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem('raju_claims_v4', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('raju_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('raju_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('raju_leaves', JSON.stringify(leaves));
  }, [leaves]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [{ id, message, type, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const addAuditLog = (action, entity) => {
    const newLog = {
      id: `AUD-${Date.now()}`,
      user: 'R. Rajkumar (Principal Broker)',
      action,
      entity,
      time: new Date().toLocaleString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const login = (role = 'ADMIN', credentials = {}) => {
    const userTemplate = role === 'ADMIN' ? USERS.ADMIN : USERS.USER;
    const resolvedUser = {
      ...userTemplate,
      name: credentials.name || userTemplate.name,
      email: credentials.email || userTemplate.email
    };
    setCurrentUser(resolvedUser);
    setIsAuthenticated(true);
    localStorage.setItem('raju_current_user', JSON.stringify(resolvedUser));
    localStorage.setItem('raju_is_authenticated', JSON.stringify(true));
    addNotification(`Signed in successfully as ${resolvedUser.name} (${resolvedUser.roleTitle})`, 'success');
    addAuditLog(`User signed in as ${resolvedUser.roleLabel}`, resolvedUser.email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('raju_is_authenticated', JSON.stringify(false));
    addNotification('You have been logged out securely.', 'info');
    addAuditLog('User logged out', currentUser?.email || 'Session Closed');
  };

  const switchRole = (role) => {
    login(role);
  };

  // 1. Policy Actions
  const addPolicy = (newPolicy) => {
    const id = `POL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPolicy = {
      id,
      status: 'Active',
      renewableVia: 'Direct',
      issueDate: new Date().toISOString().split('T')[0],
      ...newPolicy
    };
    setPolicies((prev) => [fullPolicy, ...prev]);
    addNotification(`Policy ${id} issued for ${newPolicy.clientName}`, 'success');
    addAuditLog(`Policy ${id} issued via Policy Application Engine`, newPolicy.clientName);
    return fullPolicy;
  };

  // 1b. Application Actions
  const addApplication = (appData) => {
    const year = new Date().getFullYear();
    const id = appData.id || `APP-${year}-${Math.floor(100 + Math.random() * 900)}`;
    const newApp = {
      id,
      clientName: appData.clientName || 'Unnamed Proposer',
      phone: appData.phone || 'N/A',
      email: appData.email || 'N/A',
      productType: appData.productType || 'Comprehensive Insurance',
      assetRef: appData.assetRef || 'N/A',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Pending Issuance',
      stepProgress: 'Step 7 of 7 (Review Completed)',
      payablePremium: appData.payablePremium || 0,
      paymentStatus: 'Pending',
      paymentMethod: 'N/A',
      underwriterNotes: appData.underwriterNotes || '',
      approvalDecision: appData.approvalDecision || 'APPROVED',
      ...appData
    };
    setApplications((prev) => [newApp, ...prev]);
    addNotification(`Application ${id} submitted with status Pending Issuance`, 'success');
    addAuditLog(`Application ${id} submitted for underwriting`, newApp.clientName);
    return newApp;
  };

  // 2. 4-Stage Claims Pipeline Actions via claimsService
  const addClaim = (claimData) => {
    const newClaim = claimsService.createClaim(claimData);
    setClaims(claimsService.getClaims());
    setSelectedClaimId(newClaim.id);
    addNotification(`New Claim ${newClaim.id} initiated for ${newClaim.clientName}`, 'info');
    addAuditLog(`Claim ${newClaim.id} registered`, newClaim.clientName);
    return newClaim;
  };

  const updateClaimStage = (claimId, targetStage, stageData = {}) => {
    const updated = claimsService.updateStage(claimId, targetStage, stageData);
    setClaims(claimsService.getClaims());
    addNotification(`Claim ${claimId} advanced to Stage ${targetStage}`, 'success');
    addAuditLog(`Claim ${claimId} advanced to Stage ${targetStage}`, `Stage ${targetStage}`);
    return updated;
  };

  // Claims Extended Actions (Documents, Bills, Follow-ups, Settlement)
  const updateClaimDocument = (claimId, docId, updates) => {
    claimsService.updateDocument(claimId, docId, updates);
    setClaims(claimsService.getClaims());
    addNotification(`Claim document updated`, 'info');
  };

  const addClaimBill = (claimId, bill) => {
    const newBill = claimsService.addBill(claimId, bill);
    setClaims(claimsService.getClaims());
    addNotification(`Bill recorded for Claim ${claimId}`, 'success');
    return newBill;
  };

  const deleteClaimBill = (claimId, billId) => {
    claimsService.deleteBill(claimId, billId);
    setClaims(claimsService.getClaims());
    addNotification(`Bill removed from Claim ${claimId}`, 'info');
  };

  const addClaimFollowUp = (claimId, followUp) => {
    const newFollowUp = claimsService.addFollowUp(claimId, followUp);
    setClaims(claimsService.getClaims());
    addNotification(`Follow-up activity logged for Claim ${claimId}`, 'info');
    return newFollowUp;
  };

  const updateClaimSettlement = (claimId, settlementUpdates) => {
    claimsService.updateSettlement(claimId, settlementUpdates);
    setClaims(claimsService.getClaims());
    addNotification(`Settlement parameters updated for Claim ${claimId}`, 'success');
  };

  // Towing / Roadside Assistance Actions
  const addTowingJob = (jobData) => {
    const year = new Date().getFullYear();
    const id = jobData.id || `TOW-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
    const isCompleted = jobData.jobStatus === 'Completed';
    // Generate bill number ONCE only when job is completed
    const billNo = jobData.billNo || (isCompleted ? `TOW-BILL-${year}-${Math.floor(10000 + Math.random() * 90000)}` : '');

    const newJob = {
      ...jobData,
      id,
      billNo,
      jobStatus: jobData.jobStatus || 'Draft',
      paymentStatus: jobData.paymentStatus || 'Pending'
    };
    setTowingJobs((prev) => [newJob, ...prev]);
    const label = newJob.jobStatus === 'Draft' ? 'Draft Saved' : 'Job Dispatched';
    addNotification(`Towing ${label}: ${newJob.id} (${newJob.vehicleNumber || newJob.clientName || 'Draft'})`, 'success');
    addAuditLog(`Towing ${label} (${newJob.id})`, newJob.vehicleNumber || newJob.clientName);
    return newJob;
  };

  const updateTowingJob = (jobId, updates) => {
    let generatedBillNo = null;
    setTowingJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        // Keep existing billNo; only generate if completing and billNo is empty
        let finalBillNo = j.billNo || updates.billNo || '';
        if (updates.jobStatus === 'Completed' && !finalBillNo) {
          const year = new Date().getFullYear();
          finalBillNo = `TOW-BILL-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
          generatedBillNo = finalBillNo;
        }
        return { ...j, ...updates, billNo: finalBillNo };
      })
    );
    const updateLabel = updates.jobStatus === 'Completed' ? 'Completed & Billed' : 'Updated';
    addNotification(`Towing Job ${jobId} ${updateLabel}`, 'info');
    return generatedBillNo;
  };

  // 3. Renewals Actions
  const sendRenewalReminder = (policyId, method = 'WhatsApp') => {
    addNotification(`30-Day Renewal reminder sent via ${method} for Policy ${policyId}`, 'info');
    addAuditLog(`Renewal reminder dispatched via ${method}`, policyId);
  };

  const renewPolicy = (policyId, { newExpiryDate, newCompanyId }) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== policyId) return p;
        const partner = newCompanyId ? INSURANCE_PARTNERS.find((ip) => ip.id === newCompanyId) : null;
        return {
          ...p,
          status: 'Active',
          expiryDate: newExpiryDate,
          companyId: partner ? partner.id : p.companyId,
          companyName: partner ? partner.shortName : p.companyName,
          renewableVia: 'Direct'
        };
      })
    );
    addNotification(`Policy ${policyId} renewed successfully!`, 'success');
    addAuditLog(`Policy ${policyId} renewed for 1 year`, newExpiryDate);
  };

  // 4. Loans Actions
  const addLoan = (loanData) => {
    const id = `LOAN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const principal = Number(loanData.principalAmount);
    const newLoan = {
      id,
      clientName: loanData.clientName,
      phone: loanData.phone,
      guarantorName: loanData.guarantorName || 'Self',
      principalAmount: principal,
      monthlyRatePercent: Number(loanData.monthlyRatePercent) || 2.0,
      issueDate: loanData.issueDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      ledger: [
        {
          id: `TX-${Date.now()}`,
          date: loanData.issueDate || new Date().toISOString().split('T')[0],
          particulars: 'Principal Loan Disbursed',
          debit: principal,
          credit: 0,
          interestAccrued: 0,
          balance: principal
        }
      ]
    };
    setLoans((prev) => [newLoan, ...prev]);
    addNotification(`New Loan ${id} issued for ${loanData.clientName}`, 'success');
    return newLoan;
  };

  const addLoanCreditPayment = (loanId, { amount, particulars = 'Client Credit Repayment' }) => {
    const payment = Number(amount);
    if (!payment || payment <= 0) return;

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        const lastBalance = l.ledger[l.ledger.length - 1]?.balance || l.principalAmount;
        const newBalance = Math.max(0, lastBalance - payment);

        const newEntry = {
          id: `TX-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          particulars: particulars,
          debit: 0,
          credit: payment,
          interestAccrued: 0,
          balance: newBalance
        };

        return {
          ...l,
          status: newBalance === 0 ? 'Closed' : 'Active',
          ledger: [...l.ledger, newEntry]
        };
      })
    );
    addNotification(`Payment of ₹${payment.toLocaleString('en-IN')} credited to Loan ${loanId}`, 'success');
  };

  const accrue30DayInterest = (loanId) => {
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        const lastBalance = l.ledger[l.ledger.length - 1]?.balance || l.principalAmount;
        const interest = Math.round(lastBalance * (l.monthlyRatePercent / 100));
        const newBalance = lastBalance + interest;

        const newEntry = {
          id: `TX-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          particulars: `30-Day Interest Accrual (${l.monthlyRatePercent}% on ₹${lastBalance.toLocaleString('en-IN')})`,
          debit: interest,
          credit: 0,
          interestAccrued: interest,
          balance: newBalance
        };

        return {
          ...l,
          ledger: [...l.ledger, newEntry]
        };
      })
    );
    addNotification(`30-day interest accrued on Loan ${loanId}`, 'info');
  };

  // 5. HR & Leaves
  const updateLeaveStatus = (leaveId, status) => {
    setLeaves((prev) =>
      prev.map((lv) => (lv.id === leaveId ? { ...lv, status } : lv))
    );
    addNotification(`Leave request ${leaveId} was ${status.toLowerCase()}`, status === 'Approved' ? 'success' : 'danger');
  };

  // Metrics
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringSoonCount = policies.filter((p) => {
    const expiry = new Date(p.expiryDate);
    return expiry >= now && expiry <= thirtyDaysLater;
  }).length;

  const totalLoanBalance = loans.reduce((sum, l) => {
    const currentBal = l.ledger[l.ledger.length - 1]?.balance || 0;
    return sum + currentBal;
  }, 0);

  const totalMonthlyInterest = loans.reduce((sum, l) => {
    const currentBal = l.ledger[l.ledger.length - 1]?.balance || 0;
    return sum + Math.round(currentBal * (l.monthlyRatePercent / 100));
  }, 0);

  return (
    <AppDataContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        switchRole,
        USERS,
        activeTab,
        setActiveTab,
        globalSearch,
        setGlobalSearch,
        policies,
        claims,
        claimsFilter,
        setClaimsFilter,
        navigateToClaimsWithFilter,
        checkPolicyClaimStatus,
        selectedClaimId,
        setSelectedClaimId,
        navigateToClaim,
        showRegisterClaimModal,
        setShowRegisterClaimModal,
        showTowingModal,
        setShowTowingModal,
        towingJobs,
        addTowingJob,
        updateTowingJob,
        updateClaimDocument,
        addClaimBill,
        deleteClaimBill,
        addClaimFollowUp,
        updateClaimSettlement,
        claimsService,
        loans,
        employees,
        leaves,
        quotes,
        actionTasks,
        repositoryDocs,
        auditLogs,
        partners: INSURANCE_PARTNERS,
        products: MOCK_PRODUCTS,
        notifications,
        applications,
        setApplications,
        addApplication,
        addPolicy,
        addClaim,
        updateClaimStage,
        sendRenewalReminder,
        renewPolicy,
        addLoan,
        addLoanCreditPayment,
        accrue30DayInterest,
        updateLeaveStatus,
        metrics: {
          activePolicies: policies.length,
          expiringSoonCount: 76, // Standardized locked metric
          pendingClaimsCount: 48, // Standardized locked metric
          pendingQuotesCount: 18, // Standardized locked metric
          activePartnersCount: 15,
          totalLoanBalance,
          totalMonthlyInterest
        }
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
