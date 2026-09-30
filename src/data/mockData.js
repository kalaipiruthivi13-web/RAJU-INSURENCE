export const INITIAL_POLICIES = [
  {
    id: "POL-2024-8891",
    clientName: "R. Karthikeyan",
    phone: "+91 98412 34567",
    email: "karthi.chennai@gmail.com",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 09 BX 4512",
    companyId: "hdfc_ergo",
    companyName: "HDFC ERGO",
    premium: 14250,
    sumInsured: 650000,
    issueDate: "2023-10-10",
    expiryDate: "2024-10-09", // < 30 days alert!
    status: "Expiring Soon",
    renewableVia: "Direct",
    notes: "Zero Dep + Engine Protection added"
  },
  {
    id: "POL-2024-7712",
    clientName: "Sundaramurthy M.",
    phone: "+91 94440 98123",
    email: "sundar.murthy@yahoo.com",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 22 CZ 7890",
    companyId: "icici_lombard",
    companyName: "ICICI Lombard",
    premium: 28500,
    sumInsured: 1200000,
    issueDate: "2023-09-28",
    expiryDate: "2024-09-27", // within 12 days!
    status: "Expiring Soon",
    renewableVia: "Direct",
    notes: "Renewal notice SMS sent on 15th Sep"
  },
  {
    id: "POL-2024-6540",
    clientName: "P. Meenakshi Ammal",
    phone: "+91 97890 11223",
    email: "meenakshi.p@outlook.com",
    policyType: "Family Health Optima",
    vehicleNumber: "Health Insurance",
    companyId: "star_health",
    companyName: "Star Health",
    premium: 19800,
    sumInsured: 1000000,
    issueDate: "2023-10-01",
    expiryDate: "2024-09-30", // within 15 days!
    status: "Expiring Soon",
    renewableVia: "Direct",
    notes: "Customer renewal reminder scheduled"
  },
  {
    id: "POL-2024-9120",
    clientName: "Anandhakumar S.",
    phone: "+91 98840 55678",
    email: "anand.kumar@gmail.com",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 01 AU 6677",
    companyId: "tata_aig",
    companyName: "Tata AIG",
    premium: 11400,
    sumInsured: 520000,
    issueDate: "2024-02-15",
    expiryDate: "2025-02-14",
    status: "Active",
    renewableVia: "Direct",
    notes: "All 3-year third party active"
  },
  {
    id: "POL-2024-5231",
    clientName: "Venkatesan G.",
    phone: "+91 93810 44556",
    email: "venkat.logistics@gmail.com",
    policyType: "Two Wheeler Package",
    vehicleNumber: "TN 07 DC 9988",
    companyId: "bajaj_allianz",
    companyName: "Bajaj Allianz",
    premium: 2450,
    sumInsured: 85000,
    issueDate: "2024-04-10",
    expiryDate: "2025-04-09",
    status: "Active",
    renewableVia: "Direct",
    notes: "Direct agent code linked"
  },
  {
    id: "POL-2024-4321",
    clientName: "Kavitha Rajendran",
    phone: "+91 98401 77889",
    email: "kavitha.r@gmail.com",
    policyType: "Senior Citizen Red Carpet",
    vehicleNumber: "Health Insurance",
    companyId: "star_health",
    companyName: "Star Health",
    premium: 24200,
    sumInsured: 750000,
    issueDate: "2023-10-18",
    expiryDate: "2024-10-17",
    status: "Expiring Soon",
    renewableVia: "Direct",
    notes: "Pre-existing diabetes coverage endorsed"
  }
];

// Helper function for dynamic settlement due dates
const getDueOffsetDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_CLAIMS = [
  {
    id: "CLM-2024-105",
    policyId: "POL-2024-7712",
    clientName: "K. Thangavel",
    phone: "+91 94441 88990",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 05 BQ 7712",
    incidentDate: "2024-09-01",
    claimAmountRequested: 65000,
    settlementDueDate: getDueOffsetDate(-2),
    settlementStatus: "Overdue",
    currentStage: 3, // 1: Registered, 2: Documents & Submission, 3: Survey, 4: Settlement
    stageDetails: {
      stage1: {
        completed: true,
        date: "2024-09-01",
        status: "Claim Registered in Broker System"
      },
      stage2: {
        completed: true,
        date: "2024-09-03",
        docs: ["FIR Copy", "RC Copy", "Fitness Certificate", "Load Challan"],
        insurerRefNo: "NIA-COM-2024-33120",
        portalSubmissionStatus: "Verified by Regional Hub"
      },
      stage3: {
        completed: false,
        surveyorName: "Er. K. Natarajan (IRDA SLA: 3341)",
        surveyorPhone: "+91 98402 44331",
        inspectionDate: "2024-09-08",
        notes: "Inspection overdue. Final garage invoice clearance delayed."
      },
      stage4: {
        completed: false,
        status: "Overdue Survey Approval",
        settledAmount: 0,
        bankRefNo: "",
        rejectionReason: ""
      }
    },
    attachments: [
      { id: "att-105-1", name: "FIR_Police_Report_Tiruvallur.pdf", category: "FIR / Police Report", size: "2.4 MB", status: "Verified", uploadedAt: "2024-09-02" },
      { id: "att-105-2", name: "RC_Book_TN05BQ7712.pdf", category: "RC Copy", size: "1.2 MB", status: "Verified", uploadedAt: "2024-09-02" },
      { id: "att-105-3", name: "Driver_Licence_Heavy.pdf", category: "Driving Licence", size: "900 KB", status: "Verified", uploadedAt: "2024-09-02" },
      { id: "att-105-4", name: "Garage_Repair_Estimate.pdf", category: "Repair Estimate", size: "1.8 MB", status: "Verified", uploadedAt: "2024-09-03" }
    ]
  },
  {
    id: "CLM-2024-103",
    policyId: "POL-2024-9120",
    clientName: "Anandhakumar S.",
    phone: "+91 98840 55678",
    companyId: "tata_aig",
    companyName: "Tata AIG",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 01 AU 6677",
    incidentDate: "2024-09-12",
    claimAmountRequested: 22500,
    settlementDueDate: getDueOffsetDate(0),
    settlementStatus: "Due Today",
    currentStage: 2,
    stageDetails: {
      stage1: {
        completed: true,
        date: "2024-09-12",
        status: "Claim Registered in Broker System"
      },
      stage2: {
        completed: true,
        date: "2024-09-13",
        docs: ["RC Copy", "DL copy", "Spot photos"],
        insurerRefNo: "TAIG-MOT-2024-88712",
        portalSubmissionStatus: "Under processing with Regional Claims Office"
      },
      stage3: {
        completed: false,
        surveyorName: "Awaiting Surveyor Assignment",
        surveyorPhone: "",
        inspectionDate: "",
        notes: "Vehicle stationed at ABT Maruti Workshop, Guindy. Fast track settlement due today."
      },
      stage4: {
        completed: false,
        status: "Pending Settlement Approval",
        settledAmount: 0,
        bankRefNo: "",
        rejectionReason: ""
      }
    },
    attachments: [
      { id: "att-103-1", name: "RC_SmartCard_TN01AU6677.pdf", category: "RC Copy", size: "1.1 MB", status: "Verified", uploadedAt: "2024-09-13" },
      { id: "att-103-2", name: "DL_AnandhaKumar.pdf", category: "Driving Licence", size: "820 KB", status: "Verified", uploadedAt: "2024-09-13" },
      { id: "att-103-3", name: "ABT_Maruti_Damage_Estimate.pdf", category: "Repair Estimate", size: "1.5 MB", status: "Verified", uploadedAt: "2024-09-13" },
      { id: "att-103-4", name: "Front_Damage_Photos.jpg", category: "Photos / Videos", size: "3.2 MB", status: "Verified", uploadedAt: "2024-09-13" }
    ]
  },
  {
    id: "CLM-2024-101",
    policyId: "POL-2024-8891",
    clientName: "R. Karthikeyan",
    phone: "+91 98412 34567",
    companyId: "hdfc_ergo",
    companyName: "HDFC ERGO",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 09 BX 4512",
    incidentDate: "2024-09-05",
    claimAmountRequested: 48000,
    settlementDueDate: getDueOffsetDate(3),
    settlementStatus: "Due in 3 days",
    currentStage: 3,
    stageDetails: {
      stage1: {
        completed: true,
        date: "2024-09-05",
        status: "Claim Registered in Broker System"
      },
      stage2: {
        completed: true,
        date: "2024-09-06",
        docs: ["Driving License", "RC Book copy", "Damage Photos (4)", "Repair Estimate"],
        insurerRefNo: "HEGO-CLM-2024-98441",
        portalSubmissionStatus: "Registered at HDFC ERGO Hub"
      },
      stage3: {
        completed: false,
        surveyorName: "Er. M. Saravanan (IRDA SLA: 4821)",
        surveyorPhone: "+91 98400 33211",
        inspectionDate: "2024-09-10",
        notes: "Front bumper & radiator damage verified. Awaiting garage final invoice."
      },
      stage4: {
        completed: false,
        status: "Pending Final Survey Approval",
        settledAmount: 0,
        bankRefNo: "",
        rejectionReason: ""
      }
    },
    attachments: [
      { id: "att-101-1", name: "RC_Book_TN09BX4512.pdf", category: "RC Copy", size: "1.4 MB", status: "Verified", uploadedAt: "2024-09-06" },
      { id: "att-101-2", name: "Driving_Licence_Karthik.pdf", category: "Driving Licence", size: "850 KB", status: "Verified", uploadedAt: "2024-09-06" },
      { id: "att-101-3", name: "HDFC_Garage_Estimate.pdf", category: "Repair Estimate", size: "2.1 MB", status: "Verified", uploadedAt: "2024-09-07" },
      { id: "att-101-4", name: "Damage_Spot_Photos.zip", category: "Photos / Videos", size: "8.4 MB", status: "Verified", uploadedAt: "2024-09-07" }
    ]
  },
  {
    id: "CLM-2024-106",
    policyId: "POL-2024-6540",
    clientName: "Selvi Meenakshi",
    phone: "+91 97909 22114",
    companyId: "icici_lombard",
    companyName: "ICICI Lombard",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 22 CA 1120",
    incidentDate: "2024-09-10",
    claimAmountRequested: 38000,
    settlementDueDate: getDueOffsetDate(4),
    settlementStatus: "Due in 4 days",
    currentStage: 3,
    stageDetails: {
      stage1: {
        completed: true,
        date: "2024-09-10",
        status: "Claim Registered in Broker System"
      },
      stage2: {
        completed: true,
        date: "2024-09-11",
        docs: ["RC Copy", "DL Copy", "Garage Estimate"],
        insurerRefNo: "ICICI-ILG-2024-7788",
        portalSubmissionStatus: "Digital Surveyor Assigned"
      },
      stage3: {
        completed: false,
        surveyorName: "Er. P. Venkatesh (SLA-9921)",
        surveyorPhone: "+91 98841 77665",
        inspectionDate: "2024-09-15",
        notes: "Live video assessment completed. Final settlement sanction due in 4 days."
      },
      stage4: {
        completed: false,
        status: "Sanction in Progress",
        settledAmount: 0,
        bankRefNo: "",
        rejectionReason: ""
      }
    },
    attachments: [
      { id: "att-106-1", name: "RC_Book_TN22CA1120.pdf", category: "RC Copy", size: "1.3 MB", status: "Verified", uploadedAt: "2024-09-11" },
      { id: "att-106-2", name: "DL_Meenakshi.pdf", category: "Driving Licence", size: "780 KB", status: "Verified", uploadedAt: "2024-09-11" },
      { id: "att-106-3", name: "Authorized_Service_Estimate.pdf", category: "Repair Estimate", size: "1.9 MB", status: "Verified", uploadedAt: "2024-09-12" }
    ]
  },
  {
    id: "CLM-2024-104",
    policyId: "POL-2024-5231",
    clientName: "Venkatesan G.",
    phone: "+91 93810 44556",
    companyId: "bajaj_allianz",
    companyName: "Bajaj Allianz",
    policyType: "Two Wheeler Package",
    vehicleNumber: "TN 07 DC 9988",
    incidentDate: "2024-09-15",
    claimAmountRequested: 9800,
    settlementDueDate: getDueOffsetDate(6),
    settlementStatus: "Due in 6 days",
    currentStage: 1,
    stageDetails: {
      stage1: {
        completed: true,
        date: "2024-09-15",
        status: "Claim Registered in Broker System"
      },
      stage2: {
        completed: false,
        docs: ["Awaiting Garage Estimate & DL copy"],
        insurerRefNo: "",
        portalSubmissionStatus: "Draft"
      },
      stage3: {
        completed: false,
        surveyorName: "",
        surveyorPhone: "",
        inspectionDate: "",
        notes: ""
      },
      stage4: {
        completed: false,
        status: "Pending Docs",
        settledAmount: 0,
        bankRefNo: "",
        rejectionReason: ""
      }
    },
    attachments: [
      { id: "att-104-1", name: "Two_Wheeler_RC_TN07DC9988.pdf", category: "RC Copy", size: "950 KB", status: "Verified", uploadedAt: "2024-09-15" }
    ]
  },
  {
    id: "CLM-2024-102",
    policyId: "POL-2024-6540",
    clientName: "P. Meenakshi Ammal",
    phone: "+91 97890 11223",
    companyId: "star_health",
    companyName: "Star Health",
    policyType: "Family Health Optima",
    vehicleNumber: "Health Insurance",
    incidentDate: "2024-08-15",
    claimAmountRequested: 115000,
    settlementDueDate: "2024-08-28",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: {
        completed: true,
        date: "2024-08-15",
        status: "Claim Registered in Broker System"
      },
      stage2: {
        completed: true,
        date: "2024-08-16",
        docs: ["Discharge Summary", "Final Hospital Bill", "Pharmacy Invoices", "Investigation Reports"],
        insurerRefNo: "SHAI-MED-2024-44120",
        portalSubmissionStatus: "Approved by Star TPA"
      },
      stage3: {
        completed: true,
        surveyorName: "Dr. B. Ramanathan (Medical TPA Auditor)",
        surveyorPhone: "+91 94441 55667",
        inspectionDate: "2024-08-20",
        notes: "Medical necessity verified. Non-medical items ₹6,200 deducted."
      },
      stage4: {
        completed: true,
        status: "Settled",
        settledAmount: 108800,
        bankRefNo: "NEFT-HDFC-9988214309",
        settlementDate: "2024-08-28",
        rejectionReason: ""
      }
    },
    attachments: [
      { id: "att-102-1", name: "Discharge_Summary_Apollo.pdf", category: "Other Documents", size: "3.1 MB", status: "Verified", uploadedAt: "2024-08-16" },
      { id: "att-102-2", name: "Final_Hospital_Bill_Consolidated.pdf", category: "Other Documents", size: "2.8 MB", status: "Verified", uploadedAt: "2024-08-16" }
    ]
  }
];

export const INITIAL_LOANS = [
  {
    id: "LOAN-2024-001",
    clientName: "Murugan Selvam",
    phone: "+91 98402 11990",
    guarantorName: "K. Veerappan",
    principalAmount: 200000,
    monthlyRatePercent: 2.0, // 2% per 30 days (24% per annum)
    issueDate: "2024-07-01",
    dueDate: "2024-10-01",
    status: "Active",
    ledger: [
      {
        id: "TX-1",
        date: "2024-07-01",
        particulars: "Principal Loan Disbursed",
        debit: 200000,
        credit: 0,
        interestAccrued: 0,
        balance: 200000
      },
      {
        id: "TX-2",
        date: "2024-07-31",
        particulars: "30-Day Interest Accrual (2% on ₹2,00,000)",
        debit: 4000,
        credit: 0,
        interestAccrued: 4000,
        balance: 204000
      },
      {
        id: "TX-3",
        date: "2024-08-05",
        particulars: "Client Cash Repayment (Interest cleared)",
        debit: 0,
        credit: 4000,
        interestAccrued: 0,
        balance: 200000
      },
      {
        id: "TX-4",
        date: "2024-08-30",
        particulars: "30-Day Interest Accrual (2% on ₹2,00,000)",
        debit: 4000,
        credit: 0,
        interestAccrued: 4000,
        balance: 204000
      },
      {
        id: "TX-5",
        date: "2024-09-05",
        particulars: "Credit Payment (₹4,000 Interest + ₹20,000 Principal)",
        debit: 0,
        credit: 24000,
        interestAccrued: 0,
        balance: 180000
      }
    ]
  },
  {
    id: "LOAN-2024-002",
    clientName: "Balamurugan Transport",
    phone: "+91 97910 88221",
    guarantorName: "S. Dharmalingam",
    principalAmount: 350000,
    monthlyRatePercent: 1.8,
    issueDate: "2024-08-01",
    dueDate: "2024-11-01",
    status: "Active",
    ledger: [
      {
        id: "TX-1",
        date: "2024-08-01",
        particulars: "Principal Loan Disbursed for Fleet Insurance",
        debit: 350000,
        credit: 0,
        interestAccrued: 0,
        balance: 350000
      },
      {
        id: "TX-2",
        date: "2024-08-31",
        particulars: "30-Day Interest Accrual (1.8% on ₹3,50,000)",
        debit: 6300,
        credit: 0,
        interestAccrued: 6300,
        balance: 356300
      },
      {
        id: "TX-3",
        date: "2024-09-10",
        particulars: "NEFT Credit by Client",
        debit: 0,
        credit: 50000,
        interestAccrued: 0,
        balance: 306300
      }
    ]
  },
  {
    id: "LOAN-2024-003",
    clientName: "Jayanthi Textiles",
    phone: "+91 94432 66778",
    guarantorName: "N. Palaniswamy",
    principalAmount: 100000,
    monthlyRatePercent: 2.0,
    issueDate: "2024-08-15",
    dueDate: "2024-09-15",
    status: "Active",
    ledger: [
      {
        id: "TX-1",
        date: "2024-08-15",
        particulars: "Emergency Business Working Capital",
        debit: 100000,
        credit: 0,
        interestAccrued: 0,
        balance: 100000
      },
      {
        id: "TX-2",
        date: "2024-09-14",
        particulars: "30-Day Interest Accrual (2% on ₹1,00,000)",
        debit: 2000,
        credit: 0,
        interestAccrued: 2000,
        balance: 102000
      }
    ]
  }
];

export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-01",
    name: "R. Rajkumar",
    role: "Principal Broker & Branch Director",
    department: "Management",
    email: "rajkumar@raju.in",
    phone: "+91 98401 22334",
    basicSalary: 45000,
    allowances: 12000,
    deductions: 3600,
    joinDate: "2021-04-01",
    status: "Active",
    avatar: "RR"
  },
  {
    id: "EMP-02",
    name: "S. Suresh",
    role: "Claims & Survey Coordinator",
    department: "Claims",
    email: "suresh@raju.in",
    phone: "+91 97899 44556",
    basicSalary: 32000,
    allowances: 8500,
    deductions: 2800,
    joinDate: "2022-06-15",
    status: "Active",
    avatar: "SS"
  },
  {
    id: "EMP-03",
    name: "M. Deepika",
    role: "Renewal Retention Officer",
    department: "Sales",
    email: "deepika@raju.in",
    phone: "+91 94445 77889",
    basicSalary: 28000,
    allowances: 6000,
    deductions: 2200,
    joinDate: "2023-01-10",
    status: "Active",
    avatar: "MD"
  },
  {
    id: "EMP-04",
    name: "K. Manikandan",
    role: "Loan Ledger & Accounts Specialist",
    department: "Finance",
    email: "mani@raju.in",
    phone: "+91 98842 11223",
    basicSalary: 30000,
    allowances: 7000,
    deductions: 2500,
    joinDate: "2022-11-01",
    status: "Active",
    avatar: "KM"
  }
];

export const INITIAL_LEAVES = [
  {
    id: "LEV-101",
    employeeId: "EMP-03",
    employeeName: "M. Deepika",
    leaveType: "Casual Leave",
    startDate: "2024-09-20",
    endDate: "2024-09-21",
    days: 2,
    reason: "Family temple function in Madurai",
    status: "Pending",
    appliedOn: "2024-09-14"
  },
  {
    id: "LEV-102",
    employeeId: "EMP-02",
    employeeName: "S. Suresh",
    leaveType: "Sick Leave",
    startDate: "2024-09-08",
    endDate: "2024-09-09",
    days: 2,
    reason: "Viral fever - Doctor advised rest",
    status: "Approved",
    appliedOn: "2024-09-07"
  }
];
