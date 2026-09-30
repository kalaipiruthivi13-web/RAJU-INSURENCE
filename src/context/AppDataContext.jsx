import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_POLICIES,
  INITIAL_CLAIMS,
  INITIAL_LOANS,
  INITIAL_EMPLOYEES,
  INITIAL_LEAVES
} from '../data/mockData';
import { INSURANCE_PARTNERS, MOCK_REPOSITORY_DOCS, MOCK_PRODUCTS } from '../data/mockInsurancePartners';

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
    time: '2024-09-20 01:20 PM'
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

  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem('raju_claims_v3');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [selectedClaimId, setSelectedClaimId] = useState('CLM-2024-105');
  const [showRegisterClaimModal, setShowRegisterClaimModal] = useState(false);

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
    localStorage.setItem('raju_claims_v3', JSON.stringify(claims));
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
    addAuditLog(`Policy ${id} issued via 8-Step Dynamic Wizard`, newPolicy.clientName);
    return fullPolicy;
  };

  // 2. 4-Stage Claims Pipeline Actions
  const addClaim = (claimData) => {
    const id = `CLM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    
    // Auto-calculate settlement due date (+7 days)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const calculatedDueDate = claimData.settlementDueDate || dueDate.toISOString().split('T')[0];

    const newClaim = {
      id,
      currentStage: 1, // 1: Registered, 2: Documents & Insurer Submission, 3: Survey / Review, 4: Settlement / Rejection
      settlementDueDate: calculatedDueDate,
      settlementStatus: 'Due in 7 days',
      attachments: claimData.attachments || [],
      ...claimData,
      stageDetails: {
        stage1: {
          completed: true,
          date: new Date().toISOString().split('T')[0],
          status: 'Claim Registered in Broker System'
        },
        stage2: {
          completed: (claimData.attachments && claimData.attachments.length > 0) ? true : false,
          date: (claimData.attachments && claimData.attachments.length > 0) ? new Date().toISOString().split('T')[0] : '',
          docs: claimData.attachments?.map((a) => a.name) || ['RC Copy', 'Spot Photos', 'Damage Estimate'],
          insurerRefNo: `IR-${Math.floor(10000 + Math.random() * 90000)}`,
          portalSubmissionStatus: (claimData.attachments && claimData.attachments.length > 0) ? 'Submitted to Carrier Portal' : 'Draft'
        },
        stage3: {
          completed: false,
          surveyorName: '',
          surveyorPhone: '',
          inspectionDate: '',
          notes: ''
        },
        stage4: {
          completed: false,
          status: 'Pending',
          settledAmount: 0,
          bankRefNo: '',
          rejectionReason: ''
        }
      }
    };

    // If documents were uploaded right away, we can advance or keep at 1/2
    if (claimData.attachments && claimData.attachments.length >= 2) {
      newClaim.currentStage = 2;
    }

    setClaims((prev) => [newClaim, ...prev]);
    setSelectedClaimId(id);
    addNotification(`New Claim ${id} initiated for ${claimData.clientName} with ${claimData.attachments?.length || 0} attachment(s)`, 'info');
    addAuditLog(`Claim ${id} registered with attachments`, claimData.clientName);
    return newClaim;
  };

  const updateClaimStage = (claimId, targetStage, stageData) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const updatedDetails = { ...c.stageDetails };

        if (targetStage === 2) {
          updatedDetails.stage2 = {
            completed: true,
            date: new Date().toISOString().split('T')[0],
            docs: stageData.docs || ['RC Copy', 'Spot Photos', 'Estimate'],
            insurerRefNo: stageData.insurerRefNo || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
            portalSubmissionStatus: 'Submitted to Carrier Portal'
          };
        } else if (targetStage === 3) {
          updatedDetails.stage3 = {
            completed: true,
            surveyorName: stageData.surveyorName || 'Assigned Surveyor',
            surveyorPhone: stageData.surveyorPhone || '+91 98400 00000',
            inspectionDate: stageData.inspectionDate || new Date().toISOString().split('T')[0],
            notes: stageData.notes || 'Inspection completed. Loss assessed.'
          };
        } else if (targetStage === 4) {
          updatedDetails.stage4 = {
            completed: true,
            status: stageData.status || 'Settled',
            settledAmount: Number(stageData.settledAmount) || c.claimAmountRequested,
            bankRefNo: stageData.bankRefNo || `NEFT-${Math.floor(10000000 + Math.random() * 90000000)}`,
            settlementDate: new Date().toISOString().split('T')[0],
            rejectionReason: stageData.rejectionReason || ''
          };
        }

        return {
          ...c,
          currentStage: targetStage,
          stageDetails: updatedDetails
        };
      })
    );
    addNotification(`Claim ${claimId} advanced to Stage ${targetStage}`, 'success');
    addAuditLog(`Claim ${claimId} advanced to Stage ${targetStage}`, `Stage ${targetStage}`);
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
        selectedClaimId,
        setSelectedClaimId,
        navigateToClaim,
        showRegisterClaimModal,
        setShowRegisterClaimModal,
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
