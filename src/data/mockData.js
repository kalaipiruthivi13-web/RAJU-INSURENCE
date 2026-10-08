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
  },
  {
    id: "CLM-2024-107",
    policyId: "POL-2024-5521",
    clientName: "M. Sivakumar",
    phone: "+91 94442 11223",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 09 CL 5521",
    incidentDate: "2024-09-02",
    claimAmountRequested: 42000,
    settlementDueDate: getDueOffsetDate(-3),
    settlementStatus: "Overdue",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-02", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-04", docs: ["RC Copy", "FIR Copy", "Garage Estimate"], insurerRefNo: "NIA-COM-2024-88121", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. K. Natarajan (IRDA SLA: 3341)", surveyorPhone: "+91 98402 44331", inspectionDate: "2024-09-07", notes: "Survey report awaited from Tiruvallur hub" },
      stage4: { completed: false, status: "Overdue Survey Approval", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-107-1", name: "RC_TN09CL5521.pdf", category: "RC Copy", size: "1.1 MB", status: "Verified", uploadedAt: "2024-09-03" }]
  },
  {
    id: "CLM-2024-108",
    policyId: "POL-2024-1289",
    clientName: "S. Geetha Lakshmi",
    phone: "+91 98403 99881",
    companyId: "hdfc_ergo",
    companyName: "HDFC ERGO",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 07 AX 1289",
    incidentDate: "2024-09-04",
    claimAmountRequested: 31500,
    settlementDueDate: getDueOffsetDate(-1),
    settlementStatus: "Overdue",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-04", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-05", docs: ["DL Copy", "RC Copy", "Spot Photos"], insurerRefNo: "HEGO-MOT-2024-66441", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. M. Saravanan (IRDA SLA: 4821)", surveyorPhone: "+91 98400 33211", inspectionDate: "2024-09-09", notes: "Workshop parts quotation clearance pending" },
      stage4: { completed: false, status: "Overdue Sanction", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-108-1", name: "Damage_FrontBumper.jpg", category: "Photos / Videos", size: "2.4 MB", status: "Verified", uploadedAt: "2024-09-05" }]
  },
  {
    id: "CLM-2024-109",
    policyId: "POL-2024-4321",
    clientName: "Dr. R. Subramanian",
    phone: "+91 98841 22334",
    companyId: "star_health",
    companyName: "Star Health",
    policyType: "Senior Citizen Red Carpet",
    vehicleNumber: "Health Insurance",
    incidentDate: "2024-09-08",
    claimAmountRequested: 85000,
    settlementDueDate: getDueOffsetDate(0),
    settlementStatus: "Due Today",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-08", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-09", docs: ["Discharge Summary", "Hospital Invoices", "Doctor Prescription"], insurerRefNo: "SHAI-MED-2024-77124", portalSubmissionStatus: "Approved by TPA" },
      stage3: { completed: false, surveyorName: "Dr. B. Ramanathan (TPA Auditor)", surveyorPhone: "+91 94441 55667", inspectionDate: "2024-09-12", notes: "Audit verification in final stage. Fast-track disbursal due today." },
      stage4: { completed: false, status: "Due Today", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-109-1", name: "Discharge_MGM.pdf", category: "Other Documents", size: "3.2 MB", status: "Verified", uploadedAt: "2024-09-09" }]
  },
  {
    id: "CLM-2024-110",
    policyId: "POL-2024-9944",
    clientName: "N. Balaji Transport",
    phone: "+91 94440 88776",
    companyId: "icici_lombard",
    companyName: "ICICI Lombard",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 20 BK 9944",
    incidentDate: "2024-09-09",
    claimAmountRequested: 54000,
    settlementDueDate: getDueOffsetDate(1),
    settlementStatus: "Due in 1 day",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-09", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-10", docs: ["RC Copy", "DL Copy", "Load Challan", "Estimate"], insurerRefNo: "ICICI-ILG-2024-8821", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. P. Venkatesh (SLA-9921)", surveyorPhone: "+91 98841 77665", inspectionDate: "2024-09-13", notes: "Final loss assessment sheet under insurer clearance" },
      stage4: { completed: false, status: "Due in 1 day", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-110-1", name: "RC_TN20BK9944.pdf", category: "RC Copy", size: "1.2 MB", status: "Verified", uploadedAt: "2024-09-10" }]
  },
  {
    id: "CLM-2024-111",
    policyId: "POL-2024-3321",
    clientName: "K. Saravanan",
    phone: "+91 98411 44556",
    companyId: "tata_aig",
    companyName: "Tata AIG",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 10 EF 3321",
    incidentDate: "2024-09-11",
    claimAmountRequested: 28000,
    settlementDueDate: getDueOffsetDate(2),
    settlementStatus: "Due in 2 days",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-11", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-12", docs: ["DL Copy", "RC Copy", "Repair Estimate"], insurerRefNo: "TAIG-MOT-2024-99112", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. R. Sundaralingam (SLA-8910)", surveyorPhone: "+91 94440 22334", inspectionDate: "2024-09-14", notes: "Garage supplementary estimate approved" },
      stage4: { completed: false, status: "Due in 2 days", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-111-1", name: "Workshop_Estimate.pdf", category: "Repair Estimate", size: "1.4 MB", status: "Verified", uploadedAt: "2024-09-12" }]
  },
  {
    id: "CLM-2024-112",
    policyId: "POL-2024-8877",
    clientName: "Meena Kumari",
    phone: "+91 97908 66778",
    companyId: "united_india",
    companyName: "United India Insurance",
    policyType: "Two Wheeler Package",
    vehicleNumber: "TN 03 GH 8877",
    incidentDate: "2024-09-13",
    claimAmountRequested: 12500,
    settlementDueDate: getDueOffsetDate(5),
    settlementStatus: "Due in 5 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-13", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-14", docs: ["RC Copy", "Driving Licence", "Spot Photos"], insurerRefNo: "UII-MOT-2024-44119", portalSubmissionStatus: "Submitted to Portal" },
      stage3: { completed: false, surveyorName: "Awaiting Surveyor Assignment", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Due in 5 days", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-112-1", name: "TwoWheeler_RC.pdf", category: "RC Copy", size: "890 KB", status: "Verified", uploadedAt: "2024-09-14" }]
  },
  {
    id: "CLM-2024-113",
    policyId: "POL-2024-4410",
    clientName: "R. Senthamil Selvan",
    phone: "+91 94432 55667",
    companyId: "bajaj_allianz",
    companyName: "Bajaj Allianz",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 22 BN 4410",
    incidentDate: "2024-09-10",
    claimAmountRequested: 49000,
    settlementDueDate: getDueOffsetDate(5),
    settlementStatus: "Due in 5 days",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-10", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-11", docs: ["RC Copy", "FIR Copy", "Load Challan"], insurerRefNo: "BAGIC-COM-2024-55112", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. K. Natarajan (SLA: 3341)", surveyorPhone: "+91 98402 44331", inspectionDate: "2024-09-15", notes: "Rear axle assessment submitted to hub" },
      stage4: { completed: false, status: "Due in 5 days", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-113-1", name: "FIR_Tambaram.pdf", category: "FIR / Police Report", size: "2.1 MB", status: "Verified", uploadedAt: "2024-09-11" }]
  },
  {
    id: "CLM-2024-114",
    policyId: "POL-2024-7722",
    clientName: "V. Vignesh Cargo",
    phone: "+91 98401 22338",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 05 DJ 7722",
    incidentDate: "2024-09-14",
    claimAmountRequested: 72000,
    settlementDueDate: getDueOffsetDate(7),
    settlementStatus: "Due in 7 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-14", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-15", docs: ["RC Copy", "Fitness Certificate", "Estimate"], insurerRefNo: "NIA-COM-2024-99881", portalSubmissionStatus: "Submitted" },
      stage3: { completed: false, surveyorName: "Surveyor Assignment in Progress", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Due in 7 days", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-114-1", name: "Fitness_Cert.pdf", category: "Other Documents", size: "1.3 MB", status: "Verified", uploadedAt: "2024-09-15" }]
  },
  {
    id: "CLM-2024-115",
    policyId: "POL-2024-4511",
    clientName: "D. Muralidharan",
    phone: "+91 98412 88992",
    companyId: "oriental",
    companyName: "Oriental Insurance",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 02 AB 4511",
    incidentDate: "2024-09-12",
    claimAmountRequested: 36000,
    settlementDueDate: getDueOffsetDate(7),
    settlementStatus: "Due in 7 days",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-12", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-13", docs: ["RC Copy", "DL Copy", "Garage Estimate"], insurerRefNo: "OIC-MOT-2024-33219", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. P. Venkatesh (SLA-9921)", surveyorPhone: "+91 98841 77665", inspectionDate: "2024-09-16", notes: "Side door panel inspection completed" },
      stage4: { completed: false, status: "Due in 7 days", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-115-1", name: "SidePanel_Photos.jpg", category: "Photos / Videos", size: "3.5 MB", status: "Verified", uploadedAt: "2024-09-13" }]
  },
  {
    id: "CLM-2024-116",
    policyId: "POL-2024-8811",
    clientName: "P. Jayanthi",
    phone: "+91 97890 22119",
    companyId: "star_health",
    companyName: "Star Health",
    policyType: "Family Health Optima",
    vehicleNumber: "Health Insurance",
    incidentDate: "2024-09-16",
    claimAmountRequested: 45000,
    settlementDueDate: getDueOffsetDate(12),
    settlementStatus: "Due in 12 days",
    currentStage: 1,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-16", status: "Claim Registered in Broker System" },
      stage2: { completed: false, docs: ["Awaiting discharge summary & bills"], insurerRefNo: "", portalSubmissionStatus: "Draft" },
      stage3: { completed: false, surveyorName: "", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Pending Docs", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: []
  },
  {
    id: "CLM-2024-117",
    policyId: "POL-2024-6611",
    clientName: "G. Shanmuga Sundaram",
    phone: "+91 94441 33445",
    companyId: "hdfc_ergo",
    companyName: "HDFC ERGO",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 01 CP 6611",
    incidentDate: "2024-09-16",
    claimAmountRequested: 26000,
    settlementDueDate: getDueOffsetDate(14),
    settlementStatus: "Due in 14 days",
    currentStage: 1,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-16", status: "Claim Registered in Broker System" },
      stage2: { completed: false, docs: ["Awaiting workshop estimate"], insurerRefNo: "", portalSubmissionStatus: "Draft" },
      stage3: { completed: false, surveyorName: "", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Pending Docs", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: []
  },
  {
    id: "CLM-2024-118",
    policyId: "POL-2024-1234",
    clientName: "A. Anbarasan",
    phone: "+91 98842 11993",
    companyId: "tata_aig",
    companyName: "Tata AIG",
    policyType: "Two Wheeler Package",
    vehicleNumber: "TN 09 ER 1234",
    incidentDate: "2024-09-17",
    claimAmountRequested: 8500,
    settlementDueDate: getDueOffsetDate(15),
    settlementStatus: "Due in 15 days",
    currentStage: 1,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-17", status: "Claim Registered in Broker System" },
      stage2: { completed: false, docs: ["Awaiting driving license copy"], insurerRefNo: "", portalSubmissionStatus: "Draft" },
      stage3: { completed: false, surveyorName: "", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Pending Docs", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: []
  },
  {
    id: "CLM-2024-119",
    policyId: "POL-2024-9081",
    clientName: "S. Loganathan",
    phone: "+91 94443 77881",
    companyId: "icici_lombard",
    companyName: "ICICI Lombard",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 23 BK 9081",
    incidentDate: "2024-09-17",
    claimAmountRequested: 62000,
    settlementDueDate: getDueOffsetDate(16),
    settlementStatus: "Due in 16 days",
    currentStage: 1,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-17", status: "Claim Registered in Broker System" },
      stage2: { completed: false, docs: ["Awaiting spot survey report"], insurerRefNo: "", portalSubmissionStatus: "Draft" },
      stage3: { completed: false, surveyorName: "", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Pending Docs", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: []
  },
  {
    id: "CLM-2024-120",
    policyId: "POL-2024-7744",
    clientName: "K. Vijayalakshmi",
    phone: "+91 98402 33441",
    companyId: "care_health",
    companyName: "Care Health",
    policyType: "Health Care Supreme",
    vehicleNumber: "Health Insurance",
    incidentDate: "2024-09-18",
    claimAmountRequested: 92000,
    settlementDueDate: getDueOffsetDate(18),
    settlementStatus: "Due in 18 days",
    currentStage: 1,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-18", status: "Claim Registered in Broker System" },
      stage2: { completed: false, docs: ["Awaiting discharge summary"], insurerRefNo: "", portalSubmissionStatus: "Draft" },
      stage3: { completed: false, surveyorName: "", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Pending Docs", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: []
  },
  {
    id: "CLM-2024-121",
    policyId: "POL-2024-3344",
    clientName: "M. Palanivel",
    phone: "+91 97901 88772",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 04 CD 3344",
    incidentDate: "2024-09-18",
    claimAmountRequested: 34000,
    settlementDueDate: getDueOffsetDate(19),
    settlementStatus: "Due in 19 days",
    currentStage: 1,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-18", status: "Claim Registered in Broker System" },
      stage2: { completed: false, docs: ["Awaiting claim form signed copy"], insurerRefNo: "", portalSubmissionStatus: "Draft" },
      stage3: { completed: false, surveyorName: "", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Pending Docs", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: []
  },
  {
    id: "CLM-2024-122",
    policyId: "POL-2024-5566",
    clientName: "T. Rajesh Kannan",
    phone: "+91 98415 66778",
    companyId: "united_india",
    companyName: "United India Insurance",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 18 BR 5566",
    incidentDate: "2024-09-19",
    claimAmountRequested: 29500,
    settlementDueDate: getDueOffsetDate(20),
    settlementStatus: "Due in 20 days",
    currentStage: 1,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-19", status: "Claim Registered in Broker System" },
      stage2: { completed: false, docs: ["Awaiting garage initial quote"], insurerRefNo: "", portalSubmissionStatus: "Draft" },
      stage3: { completed: false, surveyorName: "", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Pending Docs", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: []
  },
  {
    id: "CLM-2024-123",
    policyId: "POL-2024-6811",
    clientName: "R. Dhanalakshmi",
    phone: "+91 94444 11229",
    companyId: "star_health",
    companyName: "Star Health",
    policyType: "Family Health Optima",
    vehicleNumber: "Health Insurance",
    incidentDate: "2024-09-14",
    claimAmountRequested: 68000,
    settlementDueDate: getDueOffsetDate(11),
    settlementStatus: "Due in 11 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-14", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-15", docs: ["Discharge Summary", "Hospital Pharmacy Bills"], insurerRefNo: "SHAI-MED-2024-55441", portalSubmissionStatus: "Document Scrutiny" },
      stage3: { completed: false, surveyorName: "Medical Auditor Pending", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Docs Verified", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-123-1", name: "Discharge_Summary_SIMS.pdf", category: "Other Documents", size: "2.1 MB", status: "Verified", uploadedAt: "2024-09-15" }]
  },
  {
    id: "CLM-2024-124",
    policyId: "POL-2024-9988",
    clientName: "V. Arulraj Logistics",
    phone: "+91 98403 44551",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Goods Carrier (Heavy)",
    vehicleNumber: "TN 05 ER 9988",
    incidentDate: "2024-09-13",
    claimAmountRequested: 81000,
    settlementDueDate: getDueOffsetDate(10),
    settlementStatus: "Due in 10 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-13", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-14", docs: ["RC Copy", "National Permit", "Load Challan", "Estimate"], insurerRefNo: "NIA-COM-2024-11223", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Awaiting Surveyor Slot", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Submitted to NIA", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-124-1", name: "Permit_TN05ER9988.pdf", category: "Other Documents", size: "1.5 MB", status: "Verified", uploadedAt: "2024-09-14" }]
  },
  {
    id: "CLM-2024-125",
    policyId: "POL-2024-3322",
    clientName: "K. Balamurugan",
    phone: "+91 97891 55662",
    companyId: "hdfc_ergo",
    companyName: "HDFC ERGO",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 07 DK 3322",
    incidentDate: "2024-09-14",
    claimAmountRequested: 27500,
    settlementDueDate: getDueOffsetDate(9),
    settlementStatus: "Due in 9 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-14", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-15", docs: ["DL Copy", "RC Copy", "Garage Estimate"], insurerRefNo: "HEGO-MOT-2024-33441", portalSubmissionStatus: "Processing" },
      stage3: { completed: false, surveyorName: "Surveyor Assignment Pending", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Docs Approved", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-125-1", name: "Bumper_Estimate.pdf", category: "Repair Estimate", size: "1.8 MB", status: "Verified", uploadedAt: "2024-09-15" }]
  },
  {
    id: "CLM-2024-126",
    policyId: "POL-2024-4455",
    clientName: "S. Revathi",
    phone: "+91 98841 88773",
    companyId: "tata_aig",
    companyName: "Tata AIG",
    policyType: "Two Wheeler Package",
    vehicleNumber: "TN 02 FE 4455",
    incidentDate: "2024-09-15",
    claimAmountRequested: 11200,
    settlementDueDate: getDueOffsetDate(8),
    settlementStatus: "Due in 8 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-15", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-16", docs: ["RC Copy", "Spot Photos", "Repair Estimate"], insurerRefNo: "TAIG-MOT-2024-55661", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Self-Survey Video Assessment", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Video Survey Queued", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-126-1", name: "TwoWheeler_Damage.jpg", category: "Photos / Videos", size: "2.7 MB", status: "Verified", uploadedAt: "2024-09-16" }]
  },
  {
    id: "CLM-2024-127",
    policyId: "POL-2024-7766",
    clientName: "M. Kumaresan",
    phone: "+91 94445 22118",
    companyId: "icici_lombard",
    companyName: "ICICI Lombard",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 14 CL 7766",
    incidentDate: "2024-09-13",
    claimAmountRequested: 56000,
    settlementDueDate: getDueOffsetDate(10),
    settlementStatus: "Due in 10 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-13", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-14", docs: ["RC Copy", "Fitness", "FIR Copy"], insurerRefNo: "ICICI-ILG-2024-9912", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Surveyor Assignment Pending", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Submitted", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-127-1", name: "RC_TN14CL7766.pdf", category: "RC Copy", size: "1.1 MB", status: "Verified", uploadedAt: "2024-09-14" }]
  },
  {
    id: "CLM-2024-128",
    policyId: "POL-2024-8899",
    clientName: "P. Senthil Nathan",
    phone: "+91 97902 44335",
    companyId: "bajaj_allianz",
    companyName: "Bajaj Allianz",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 09 GM 8899",
    incidentDate: "2024-09-15",
    claimAmountRequested: 33000,
    settlementDueDate: getDueOffsetDate(9),
    settlementStatus: "Due in 9 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-15", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-16", docs: ["RC Copy", "DL Copy", "Garage Estimate"], insurerRefNo: "BAGIC-MOT-2024-33211", portalSubmissionStatus: "Submitted" },
      stage3: { completed: false, surveyorName: "Digital Surveyor Assigned", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "In Scrutiny", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-128-1", name: "Garage_Bill_Estimate.pdf", category: "Repair Estimate", size: "1.9 MB", status: "Verified", uploadedAt: "2024-09-16" }]
  },
  {
    id: "CLM-2024-129",
    policyId: "POL-2024-2211",
    clientName: "G. Soundararajan",
    phone: "+91 98416 77884",
    companyId: "oriental",
    companyName: "Oriental Insurance",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 11 DA 2211",
    incidentDate: "2024-09-14",
    claimAmountRequested: 41000,
    settlementDueDate: getDueOffsetDate(11),
    settlementStatus: "Due in 11 days",
    currentStage: 2,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-14", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-15", docs: ["RC Copy", "DL Copy", "Spot Photos"], insurerRefNo: "OIC-MOT-2024-55442", portalSubmissionStatus: "Submitted" },
      stage3: { completed: false, surveyorName: "Awaiting Surveyor Slot", surveyorPhone: "", inspectionDate: "", notes: "" },
      stage4: { completed: false, status: "Under Scrutiny", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-129-1", name: "Front_Damage.jpg", category: "Photos / Videos", size: "2.8 MB", status: "Verified", uploadedAt: "2024-09-15" }]
  },
  {
    id: "CLM-2024-130",
    policyId: "POL-2024-7411",
    clientName: "R. Hemalatha",
    phone: "+91 94446 33221",
    companyId: "care_health",
    companyName: "Care Health",
    policyType: "Health Care Supreme",
    vehicleNumber: "Health Insurance",
    incidentDate: "2024-09-11",
    claimAmountRequested: 74000,
    settlementDueDate: getDueOffsetDate(8),
    settlementStatus: "Due in 8 days",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-11", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-12", docs: ["Discharge Summary", "Final Bill"], insurerRefNo: "CARE-MED-2024-99881", portalSubmissionStatus: "Approved by TPA" },
      stage3: { completed: false, surveyorName: "Dr. K. Jayaraman (Medical Auditor)", surveyorPhone: "+91 98401 99882", inspectionDate: "2024-09-16", notes: "ICU room rent capping applied per policy terms" },
      stage4: { completed: false, status: "Audit Review", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-130-1", name: "Discharge_Fortis.pdf", category: "Other Documents", size: "3.4 MB", status: "Verified", uploadedAt: "2024-09-12" }]
  },
  {
    id: "CLM-2024-131",
    policyId: "POL-2024-1122",
    clientName: "N. Kalimuthu",
    phone: "+91 97892 77881",
    companyId: "united_india",
    companyName: "United India Insurance",
    policyType: "Goods Carrier (3-Wheeler)",
    vehicleNumber: "TN 22 HP 1122",
    incidentDate: "2024-09-12",
    claimAmountRequested: 47000,
    settlementDueDate: getDueOffsetDate(9),
    settlementStatus: "Due in 9 days",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-12", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-13", docs: ["RC Copy", "FIR Copy", "Driver License"], insurerRefNo: "UII-COM-2024-66551", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. M. Saravanan (SLA: 4821)", surveyorPhone: "+91 98400 33211", inspectionDate: "2024-09-17", notes: "Engine chassis alignment check in progress" },
      stage4: { completed: false, status: "Inspection Completed", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-131-1", name: "RC_TN22HP1122.pdf", category: "RC Copy", size: "1.0 MB", status: "Verified", uploadedAt: "2024-09-13" }]
  },
  {
    id: "CLM-2024-132",
    policyId: "POL-2024-9900",
    clientName: "V. Chandrasekar",
    phone: "+91 98843 44552",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 01 DJ 9900",
    incidentDate: "2024-09-12",
    claimAmountRequested: 39000,
    settlementDueDate: getDueOffsetDate(8),
    settlementStatus: "Due in 8 days",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-12", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-13", docs: ["RC Copy", "DL Copy", "Garage Estimate"], insurerRefNo: "NIA-MOT-2024-77884", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. K. Natarajan (SLA: 3341)", surveyorPhone: "+91 98402 44331", inspectionDate: "2024-09-16", notes: "Airbag replacement approved under zero dep addon" },
      stage4: { completed: false, status: "Survey Approved", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-132-1", name: "Airbag_Damage.jpg", category: "Photos / Videos", size: "2.9 MB", status: "Verified", uploadedAt: "2024-09-13" }]
  },
  {
    id: "CLM-2024-133",
    policyId: "POL-2024-4433",
    clientName: "T. Manoharan",
    phone: "+91 94447 55663",
    companyId: "hdfc_ergo",
    companyName: "HDFC ERGO",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 19 BK 4433",
    incidentDate: "2024-09-11",
    claimAmountRequested: 63000,
    settlementDueDate: getDueOffsetDate(9),
    settlementStatus: "Due in 9 days",
    currentStage: 3,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-11", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-12", docs: ["RC Copy", "Permit", "Garage Estimate"], insurerRefNo: "HEGO-COM-2024-88771", portalSubmissionStatus: "Verified" },
      stage3: { completed: false, surveyorName: "Er. R. Sundaralingam (SLA-8910)", surveyorPhone: "+91 94440 22334", inspectionDate: "2024-09-15", notes: "Differential assembly inspection done. Awaiting final bill." },
      stage4: { completed: false, status: "Awaiting Invoice", settledAmount: 0, bankRefNo: "", rejectionReason: "" }
    },
    attachments: [{ id: "att-133-1", name: "Permit_TN19BK4433.pdf", category: "Other Documents", size: "1.4 MB", status: "Verified", uploadedAt: "2024-09-12" }]
  },
  {
    id: "CLM-2024-134",
    policyId: "POL-2024-8899",
    clientName: "S. Poongodi",
    phone: "+91 97903 88994",
    companyId: "tata_aig",
    companyName: "Tata AIG",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 03 CA 8899",
    incidentDate: "2024-08-25",
    claimAmountRequested: 25000,
    settlementDueDate: "2024-09-06",
    settlementStatus: "Rejected",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-25", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-26", docs: ["DL Copy", "RC Copy", "Workshop Quote"], insurerRefNo: "TAIG-MOT-2024-44551", portalSubmissionStatus: "Rejected by TPA" },
      stage3: { completed: true, surveyorName: "Er. P. Venkatesh (SLA-9921)", surveyorPhone: "+91 98841 77665", inspectionDate: "2024-08-30", notes: "Pre-existing scratch and dent damages unrelated to reported collision." },
      stage4: { completed: true, status: "Rejected", settledAmount: 0, bankRefNo: "", settlementDate: "2024-09-06", rejectionReason: "Survey report confirms damages occurred prior to policy inception period." }
    },
    attachments: [{ id: "att-134-1", name: "Mirror_Damage.jpg", category: "Photos / Videos", size: "1.7 MB", status: "Verified", uploadedAt: "2024-08-26" }]
  },
  {
    id: "CLM-2024-135",
    policyId: "POL-2024-3511",
    clientName: "K. Rajasekar",
    phone: "+91 98404 11228",
    companyId: "hdfc_ergo",
    companyName: "HDFC ERGO",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 02 BC 3511",
    incidentDate: "2024-08-10",
    claimAmountRequested: 35000,
    settlementDueDate: "2024-08-22",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-10", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-11", docs: ["RC Copy", "DL Copy", "Garage Invoice"], insurerRefNo: "HEGO-MOT-2024-11990", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. M. Saravanan (SLA: 4821)", surveyorPhone: "+91 98400 33211", inspectionDate: "2024-08-15", notes: "Damage verified. 5% salvage deduction applied." },
      stage4: { completed: true, status: "Settled", settledAmount: 33200, bankRefNo: "NEFT-HDFC-882194301", settlementDate: "2024-08-22", rejectionReason: "" }
    },
    attachments: [{ id: "att-135-1", name: "Settlement_Voucher.pdf", category: "Other Documents", size: "1.2 MB", status: "Verified", uploadedAt: "2024-08-22" }]
  },
  {
    id: "CLM-2024-136",
    policyId: "POL-2024-7811",
    clientName: "M. Ulaganathan",
    phone: "+91 94448 66772",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 09 ER 7811",
    incidentDate: "2024-08-12",
    claimAmountRequested: 78000,
    settlementDueDate: "2024-08-24",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-12", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-13", docs: ["RC Copy", "FIR Copy", "Repair Bill"], insurerRefNo: "NIA-COM-2024-77661", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. K. Natarajan (SLA: 3341)", surveyorPhone: "+91 98402 44331", inspectionDate: "2024-08-18", notes: "Cab replacement sanctioned per policy clause." },
      stage4: { completed: true, status: "Settled", settledAmount: 74500, bankRefNo: "NEFT-SBI-443321908", settlementDate: "2024-08-24", rejectionReason: "" }
    },
    attachments: [{ id: "att-136-1", name: "NEFT_Advice_NIA.pdf", category: "Other Documents", size: "980 KB", status: "Verified", uploadedAt: "2024-08-24" }]
  },
  {
    id: "CLM-2024-137",
    policyId: "POL-2024-1400",
    clientName: "R. Karpagam",
    phone: "+91 97893 22339",
    companyId: "icici_lombard",
    companyName: "ICICI Lombard",
    policyType: "Two Wheeler Package",
    vehicleNumber: "TN 05 BF 1400",
    incidentDate: "2024-08-18",
    claimAmountRequested: 14000,
    settlementDueDate: "2024-08-29",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-18", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-19", docs: ["RC Copy", "DL Copy", "Workshop Estimate"], insurerRefNo: "ICICI-MOT-2024-33119", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. P. Venkatesh (SLA-9921)", surveyorPhone: "+91 98841 77665", inspectionDate: "2024-08-23", notes: "Handlebar and headlamp replacement verified." },
      stage4: { completed: true, status: "Settled", settledAmount: 13100, bankRefNo: "NEFT-ICIC-998822145", settlementDate: "2024-08-29", rejectionReason: "" }
    },
    attachments: [{ id: "att-137-1", name: "Payment_Ack.pdf", category: "Other Documents", size: "850 KB", status: "Verified", uploadedAt: "2024-08-29" }]
  },
  {
    id: "CLM-2024-138",
    policyId: "POL-2024-4200",
    clientName: "S. Vetrivel",
    phone: "+91 98844 77883",
    companyId: "tata_aig",
    companyName: "Tata AIG",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 22 DK 4200",
    incidentDate: "2024-08-20",
    claimAmountRequested: 42000,
    settlementDueDate: "2024-09-01",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-20", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-21", docs: ["RC Copy", "DL Copy", "Garage Tax Invoice"], insurerRefNo: "TAIG-MOT-2024-11883", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. R. Sundaralingam (SLA-8910)", surveyorPhone: "+91 94440 22334", inspectionDate: "2024-08-25", notes: "Radiator grill repair approved with zero depreciation." },
      stage4: { completed: true, status: "Settled", settledAmount: 39800, bankRefNo: "NEFT-AXIS-771123490", settlementDate: "2024-09-01", rejectionReason: "" }
    },
    attachments: [{ id: "att-138-1", name: "Settlement_Disbursal.pdf", category: "Other Documents", size: "1.1 MB", status: "Verified", uploadedAt: "2024-09-01" }]
  },
  {
    id: "CLM-2024-139",
    policyId: "POL-2024-8900",
    clientName: "D. Punitha",
    phone: "+91 94449 88991",
    companyId: "star_health",
    companyName: "Star Health",
    policyType: "Family Health Optima",
    vehicleNumber: "Health Insurance",
    incidentDate: "2024-08-22",
    claimAmountRequested: 89000,
    settlementDueDate: "2024-09-03",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-22", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-23", docs: ["Discharge Summary", "Consolidated Hospital Bill"], insurerRefNo: "SHAI-MED-2024-33882", portalSubmissionStatus: "Approved by Star TPA" },
      stage3: { completed: true, surveyorName: "Dr. B. Ramanathan (TPA Auditor)", surveyorPhone: "+91 94441 55667", inspectionDate: "2024-08-28", notes: "Full medical audit clearance granted." },
      stage4: { completed: true, status: "Settled", settledAmount: 84000, bankRefNo: "NEFT-KOTK-334412987", settlementDate: "2024-09-03", rejectionReason: "" }
    },
    attachments: [{ id: "att-139-1", name: "Hospital_Settlement_Letter.pdf", category: "Other Documents", size: "2.4 MB", status: "Verified", uploadedAt: "2024-09-03" }]
  },
  {
    id: "CLM-2024-140",
    policyId: "POL-2024-5200",
    clientName: "G. Srinivasan",
    phone: "+91 97904 11226",
    companyId: "bajaj_allianz",
    companyName: "Bajaj Allianz",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 10 BK 5200",
    incidentDate: "2024-08-25",
    claimAmountRequested: 52000,
    settlementDueDate: "2024-09-05",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-25", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-26", docs: ["RC Copy", "FIR Copy", "Workshop Bill"], insurerRefNo: "BAGIC-COM-2024-77441", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. K. Natarajan (SLA: 3341)", surveyorPhone: "+91 98402 44331", inspectionDate: "2024-08-30", notes: "Chassis cross-member repair completed." },
      stage4: { completed: true, status: "Settled", settledAmount: 49000, bankRefNo: "NEFT-HDFC-112299843", settlementDate: "2024-09-05", rejectionReason: "" }
    },
    attachments: [{ id: "att-140-1", name: "NEFT_Bajaj.pdf", category: "Other Documents", size: "1.0 MB", status: "Verified", uploadedAt: "2024-09-05" }]
  },
  {
    id: "CLM-2024-141",
    policyId: "POL-2024-3100",
    clientName: "P. Mohanraj",
    phone: "+91 98417 33449",
    companyId: "united_india",
    companyName: "United India Insurance",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 07 EM 3100",
    incidentDate: "2024-08-27",
    claimAmountRequested: 31000,
    settlementDueDate: "2024-09-07",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-27", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-28", docs: ["RC Copy", "DL Copy", "Garage Tax Invoice"], insurerRefNo: "UII-MOT-2024-88331", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. M. Saravanan (SLA: 4821)", surveyorPhone: "+91 98400 33211", inspectionDate: "2024-09-02", notes: "Bonnet painting and denting approved." },
      stage4: { completed: true, status: "Settled", settledAmount: 29500, bankRefNo: "NEFT-IOB-887766321", settlementDate: "2024-09-07", rejectionReason: "" }
    },
    attachments: [{ id: "att-141-1", name: "United_Settlement_Letter.pdf", category: "Other Documents", size: "1.3 MB", status: "Verified", uploadedAt: "2024-09-07" }]
  },
  {
    id: "CLM-2024-142",
    policyId: "POL-2024-1050",
    clientName: "K. Devaki",
    phone: "+91 98845 66774",
    companyId: "care_health",
    companyName: "Care Health",
    policyType: "Health Care Supreme",
    vehicleNumber: "Health Insurance",
    incidentDate: "2024-08-28",
    claimAmountRequested: 105000,
    settlementDueDate: "2024-09-09",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-28", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-29", docs: ["Discharge Summary", "Diagnostic Reports", "Final Invoices"], insurerRefNo: "CARE-MED-2024-11228", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Dr. K. Jayaraman (Medical Auditor)", surveyorPhone: "+91 98401 99882", inspectionDate: "2024-09-04", notes: "Laparoscopic surgery package sanction verified." },
      stage4: { completed: true, status: "Settled", settledAmount: 98000, bankRefNo: "NEFT-YESB-554433210", settlementDate: "2024-09-09", rejectionReason: "" }
    },
    attachments: [{ id: "att-142-1", name: "Care_Settlement_Voucher.pdf", category: "Other Documents", size: "2.1 MB", status: "Verified", uploadedAt: "2024-09-09" }]
  },
  {
    id: "CLM-2024-143",
    policyId: "POL-2024-2800",
    clientName: "M. Velmurugan",
    phone: "+91 94440 44558",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 04 ER 2800",
    incidentDate: "2024-08-29",
    claimAmountRequested: 28000,
    settlementDueDate: "2024-09-10",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-29", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-30", docs: ["RC Copy", "DL Copy", "Garage Estimate"], insurerRefNo: "NIA-MOT-2024-99001", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. K. Natarajan (SLA: 3341)", surveyorPhone: "+91 98402 44331", inspectionDate: "2024-09-05", notes: "Windshield glass replacement sanctioned under glass addon." },
      stage4: { completed: true, status: "Settled", settledAmount: 26400, bankRefNo: "NEFT-CAN-667788192", settlementDate: "2024-09-10", rejectionReason: "" }
    },
    attachments: [{ id: "att-143-1", name: "Windshield_Invoice.pdf", category: "Repair Estimate", size: "920 KB", status: "Verified", uploadedAt: "2024-09-10" }]
  },
  {
    id: "CLM-2024-144",
    policyId: "POL-2024-9500",
    clientName: "S. Nalini",
    phone: "+91 97905 55663",
    companyId: "hdfc_ergo",
    companyName: "HDFC ERGO",
    policyType: "Two Wheeler Package",
    vehicleNumber: "TN 09 CK 9500",
    incidentDate: "2024-08-30",
    claimAmountRequested: 9500,
    settlementDueDate: "2024-09-11",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-30", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-31", docs: ["RC Copy", "DL Copy", "Service Center Bill"], insurerRefNo: "HEGO-MOT-2024-44229", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. M. Saravanan (SLA: 4821)", surveyorPhone: "+91 98400 33211", inspectionDate: "2024-09-06", notes: "Silencer assembly and mudguard claim passed." },
      stage4: { completed: true, status: "Settled", settledAmount: 9000, bankRefNo: "NEFT-HDFC-332211904", settlementDate: "2024-09-11", rejectionReason: "" }
    },
    attachments: [{ id: "att-144-1", name: "HDFC_Disbursal_Advice.pdf", category: "Other Documents", size: "750 KB", status: "Verified", uploadedAt: "2024-09-11" }]
  },
  {
    id: "CLM-2024-145",
    policyId: "POL-2024-6400",
    clientName: "R. Ilayaraja",
    phone: "+91 98418 88995",
    companyId: "icici_lombard",
    companyName: "ICICI Lombard",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 18 DH 6400",
    incidentDate: "2024-09-01",
    claimAmountRequested: 64000,
    settlementDueDate: "2024-09-12",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-01", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-02", docs: ["RC Copy", "FIR Copy", "Workshop Bill"], insurerRefNo: "ICICI-ILG-2024-55449", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. P. Venkatesh (SLA-9921)", surveyorPhone: "+91 98841 77665", inspectionDate: "2024-09-07", notes: "Cabin floor overhaul and panel fabrication approved." },
      stage4: { completed: true, status: "Settled", settledAmount: 61200, bankRefNo: "NEFT-ICIC-445566332", settlementDate: "2024-09-12", rejectionReason: "" }
    },
    attachments: [{ id: "att-145-1", name: "ICICI_Settlement_Letter.pdf", category: "Other Documents", size: "1.4 MB", status: "Verified", uploadedAt: "2024-09-12" }]
  },
  {
    id: "CLM-2024-146",
    policyId: "POL-2024-3700",
    clientName: "V. Chitra",
    phone: "+91 98846 99885",
    companyId: "tata_aig",
    companyName: "Tata AIG",
    policyType: "Private Car - Own Damage",
    vehicleNumber: "TN 01 DJ 3700",
    incidentDate: "2024-09-02",
    claimAmountRequested: 37000,
    settlementDueDate: "2024-09-13",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-02", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-03", docs: ["RC Copy", "DL Copy", "Workshop Invoice"], insurerRefNo: "TAIG-MOT-2024-88339", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. R. Sundaralingam (SLA-8910)", surveyorPhone: "+91 94440 22334", inspectionDate: "2024-09-08", notes: "Front suspension and steering arm claim approved." },
      stage4: { completed: true, status: "Settled", settledAmount: 35000, bankRefNo: "NEFT-AXIS-990011445", settlementDate: "2024-09-13", rejectionReason: "" }
    },
    attachments: [{ id: "att-146-1", name: "Disbursal_Advice_TAIG.pdf", category: "Other Documents", size: "1.2 MB", status: "Verified", uploadedAt: "2024-09-13" }]
  },
  {
    id: "CLM-2024-147",
    policyId: "POL-2024-4600",
    clientName: "T. Selvaraj",
    phone: "+91 94441 77663",
    companyId: "oriental",
    companyName: "Oriental Insurance",
    policyType: "Motor Comprehensive",
    vehicleNumber: "TN 20 CH 4600",
    incidentDate: "2024-09-03",
    claimAmountRequested: 46000,
    settlementDueDate: "2024-09-14",
    settlementStatus: "Settled",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-09-03", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-09-04", docs: ["RC Copy", "DL Copy", "Repair Bills"], insurerRefNo: "OIC-MOT-2024-99221", portalSubmissionStatus: "Approved" },
      stage3: { completed: true, surveyorName: "Er. P. Venkatesh (SLA-9921)", surveyorPhone: "+91 98841 77665", inspectionDate: "2024-09-09", notes: "Rear tailgate and bumper replacement passed." },
      stage4: { completed: true, status: "Settled", settledAmount: 43500, bankRefNo: "NEFT-SBI-223344556", settlementDate: "2024-09-14", rejectionReason: "" }
    },
    attachments: [{ id: "att-147-1", name: "Oriental_NEFT_Letter.pdf", category: "Other Documents", size: "1.1 MB", status: "Verified", uploadedAt: "2024-09-14" }]
  },
  {
    id: "CLM-2024-148",
    policyId: "POL-2024-5500",
    clientName: "A. Marimuthu",
    phone: "+91 97906 33221",
    companyId: "new_india",
    companyName: "New India Assurance",
    policyType: "Commercial Goods Vehicle",
    vehicleNumber: "TN 11 DJ 5500",
    incidentDate: "2024-08-26",
    claimAmountRequested: 55000,
    settlementDueDate: "2024-09-07",
    settlementStatus: "Rejected",
    currentStage: 4,
    stageDetails: {
      stage1: { completed: true, date: "2024-08-26", status: "Claim Registered in Broker System" },
      stage2: { completed: true, date: "2024-08-27", docs: ["RC Copy", "FIR Copy", "Weighbridge Slip"], insurerRefNo: "NIA-COM-2024-44118", portalSubmissionStatus: "Rejected by Underwriter" },
      stage3: { completed: true, surveyorName: "Er. K. Natarajan (SLA: 3341)", surveyorPhone: "+91 98402 44331", inspectionDate: "2024-09-01", notes: "Weighbridge slip indicates vehicle was overloaded by 4.2 tonnes beyond permissible GVW limit." },
      stage4: { completed: true, status: "Rejected", settledAmount: 0, bankRefNo: "", settlementDate: "2024-09-07", rejectionReason: "FIR and weighbridge report confirm severe overloading beyond registered GVW, violating policy endorsement clause 4B." }
    },
    attachments: [{ id: "att-148-1", name: "Rejection_Letter_NIA.pdf", category: "Other Documents", size: "1.5 MB", status: "Verified", uploadedAt: "2024-09-07" }]
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
