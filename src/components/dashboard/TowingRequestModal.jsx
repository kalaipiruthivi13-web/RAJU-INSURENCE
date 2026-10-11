import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Truck,
  MapPin,
  Car,
  Phone,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  IndianRupee,
  FileText,
  Receipt,
  Download,
  Printer,
  Send,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Layers,
  AlertCircle,
  Eye,
  X,
  Lock,
  Unlock,
  FilePlus2
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import DocumentScanDropzone from '../common/DocumentScanDropzone';
import { useAppData } from '../../context/AppDataContext';

// Shared Indian Rupee Currency Formatter
export const formatINR = (amount, decimals = 2) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

const BLANK_JOB_TEMPLATE = {
  id: '',
  billNo: '',
  requestDateTime: '',
  pickupDateTime: '',
  policyNumber: '',
  vehicleNumber: '',
  clientName: '',
  phone: '',
  breakdownLocation: '',
  destinationWorkshop: '',
  breakdownReason: 'Accident Collision / Non-Driveable',
  towType: 'Flatbed Tow Truck',
  vehicleCondition: 'Non-Driveable',
  estimatedDistanceKm: 0,
  actualDistanceKm: 0,
  partnerName: 'TVS Auto Assist 24x7',
  partnerPhone: '+91 98409 11223',
  towTruckNo: '',
  driverName: '',
  driverPhone: '',
  rateCard: 'Standard',
  baseTowingCharge: 0,
  baseIncludedKm: 10,
  ratePerKm: 25,
  labourTowing: 0,
  labourRecovery: 0,
  labourLoading: 0,
  labourAdditionalHours: 0,
  labourRatePerHour: 150,
  freeWaitingMin: 30,
  actualWaitingMin: 0,
  waitingRatePer30Min: 100,
  nightChargeEnabled: false,
  nightChargeAmount: 200,
  expressChargeEnabled: false,
  expressChargeAmount: 150,
  tollChargeAmount: 0,
  parkingChargeAmount: 0,
  otherChargeAmount: 0,
  eligibleCoverage: 1500,
  alreadyUsedCoverage: 0,
  jobStatus: 'Draft',
  paymentStatus: 'Pending',
  paymentMethod: 'UPI',
  transactionId: '',
  paymentDate: '',
  documents: [
    { id: 'doc-1', name: 'Breakdown Spot Photo.jpg', category: 'Breakdown Photo', status: 'Uploaded', url: '#' },
    { id: 'doc-2', name: 'Front Bumper Condition.jpg', category: 'Vehicle Condition Photo', status: 'Uploaded', url: '#' },
    { id: 'doc-3', name: 'Flatbed Loading Proof.jpg', category: 'Tow Truck Photo', status: 'Uploaded', url: '#' },
    { id: 'doc-4', name: 'Workshop Delivery Acknowledgement.pdf', category: 'Delivery Confirmation', status: 'Pending', url: '#' }
  ]
};

// 6 Structured Tabs Definition
export const TOWING_TABS = [
  { id: 'REQUEST', fullLabel: '1. Request', shortLabel: '1. Req', icon: MapPin },
  { id: 'DETAILS', fullLabel: '2. Towing Details', shortLabel: '2. Details', icon: Truck },
  { id: 'CHARGES', fullLabel: '3. Charges & Rates', shortLabel: '3. Charges', icon: IndianRupee },
  { id: 'DOCS', fullLabel: '4. Documents & Proof', shortLabel: '4. Docs', icon: FileText },
  { id: 'PAYMENT', fullLabel: '5. Payment Details', shortLabel: '5. Payment', icon: Receipt },
  { id: 'BILLING', fullLabel: '6. Billing & Invoice', shortLabel: '6. Invoice', icon: Printer }
];

export function TowingRequestModal({ isOpen, onClose }) {
  const {
    currentUser,
    policies,
    towingJobs,
    addTowingJob,
    updateTowingJob,
    addNotification,
    addAuditLog
  } = useAppData();

  const [activeTab, setActiveTab] = useState('REQUEST');
  const [selectedJobId, setSelectedJobId] = useState(towingJobs?.[0]?.id || 'NEW');

  const activeTabButtonRef = useRef(null);
  const initialSnapshotRef = useRef(null);

  // Filter active motor policies
  const motorPolicies = useMemo(() => {
    return (policies || []).filter((p) => {
      const type = (p.policyType || '').toLowerCase();
      return (
        type.includes('motor') ||
        type.includes('car') ||
        type.includes('vehicle') ||
        type.includes('wheeler') ||
        type.includes('goods')
      );
    });
  }, [policies]);

  // Form State
  const [formData, setFormData] = useState(() => {
    const existing = towingJobs?.[0];
    if (existing) return { ...existing };
    return {
      ...BLANK_JOB_TEMPLATE,
      id: `TOW-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      requestDateTime: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      policyNumber: motorPolicies[0]?.id || 'POL-2024-8891',
      vehicleNumber: motorPolicies[0]?.vehicleNumber || 'TN 09 BX 4512',
      clientName: motorPolicies[0]?.clientName || 'R. Karthikeyan',
      phone: motorPolicies[0]?.phone || '+91 98412 34567'
    };
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  // Sync when selectedJobId changes
  useEffect(() => {
    if (selectedJobId === 'NEW') {
      const year = new Date().getFullYear();
      const blank = {
        ...BLANK_JOB_TEMPLATE,
        id: `TOW-${year}-${Math.floor(10000 + Math.random() * 90000)}`,
        requestDateTime: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        jobStatus: 'Draft',
        billNo: ''
      };
      setFormData(blank);
      setValidationErrors({});
      initialSnapshotRef.current = JSON.stringify(blank);
    } else {
      const found = towingJobs?.find((j) => j.id === selectedJobId);
      if (found) {
        setFormData({ ...found });
        setValidationErrors({});
        initialSnapshotRef.current = JSON.stringify(found);
      }
    }
  }, [selectedJobId, towingJobs]);

  // Scroll active tab into view when active tab changes
  useEffect(() => {
    if (activeTabButtonRef.current) {
      activeTabButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [activeTab]);

  // Role-Based Locking
  const isCompleted = formData.jobStatus === 'Completed';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLocked = isCompleted && !isAdmin;

  // Unsaved changes check
  const isDirty = useMemo(() => {
    if (!initialSnapshotRef.current) return false;
    return JSON.stringify(formData) !== initialSnapshotRef.current;
  }, [formData]);

  const handleCloseRequest = () => {
    if (isDirty) {
      const confirmed = window.confirm('Discard changes? Any unsaved edits made to this towing request will be lost.');
      if (!confirmed) return;
    }
    onClose();
  };

  // Smart Document Scan Notice & Handler
  const [scanNotice, setScanNotice] = useState(null);

  const handleScanComplete = (extractedData, res) => {
    if (isLocked || !extractedData) return;
    const updated = { ...formData };
    const filledKeys = [];

    if (extractedData.clientName || extractedData.customerName) {
      updated.clientName = extractedData.clientName || extractedData.customerName;
      filledKeys.push('Client Name');
    }
    if (extractedData.vehicleNumber || extractedData.vehicleNo) {
      updated.vehicleNumber = extractedData.vehicleNumber || extractedData.vehicleNo;
      filledKeys.push('Vehicle Reg');
    }
    if (extractedData.phone || extractedData.mobile) {
      updated.phone = extractedData.phone || extractedData.mobile;
      filledKeys.push('Phone');
    }
    if (extractedData.policyNumber || extractedData.policyNo) {
      updated.policyNumber = extractedData.policyNumber || extractedData.policyNo;
      filledKeys.push('Policy No');
    }
    if (extractedData.breakdownLocation) {
      updated.breakdownLocation = extractedData.breakdownLocation;
      filledKeys.push('Breakdown Spot');
    }
    if (extractedData.destinationWorkshop) {
      updated.destinationWorkshop = extractedData.destinationWorkshop;
      filledKeys.push('Workshop');
    }
    if (extractedData.actualDistanceKm) {
      updated.actualDistanceKm = Number(extractedData.actualDistanceKm);
      filledKeys.push('Distance KM');
    }
    if (extractedData.towType) {
      updated.towType = extractedData.towType;
    }
    if (extractedData.vehicleCondition) {
      updated.vehicleCondition = extractedData.vehicleCondition;
    }

    setFormData(updated);
    setValidationErrors({});
    setScanNotice(`✨ Scanned ${res?.documentType || 'Document'} successfully! Auto-filled: ${filledKeys.join(', ')}.`);
    if (addNotification) {
      addNotification(`Towing details auto-filled from document scan (${filledKeys.length} fields)`, 'success');
    }
  };

  // Policy Selection Handler
  const handlePolicySelect = (policyId) => {
    if (isLocked) return;
    const selected = motorPolicies.find((p) => p.id === policyId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        policyNumber: selected.id,
        vehicleNumber: selected.vehicleNumber || prev.vehicleNumber,
        clientName: selected.clientName || prev.clientName,
        phone: selected.phone || prev.phone
      }));
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next.vehicleNumber;
        delete next.clientName;
        delete next.phone;
        delete next.draft;
        return next;
      });
    }
  };

  const handleChange = (field, value) => {
    if (isLocked) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field] || validationErrors.draft || validationErrors.charges) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.draft;
        if (field.includes('Charge') || field.includes('labour') || field === 'actualDistanceKm') {
          delete next.charges;
        }
        return next;
      });
    }
  };

  // Calculations for Distance, Labour, Waiting, Gross, and Coverage Limit
  const calc = useMemo(() => {
    const actualKm = Number(formData.actualDistanceKm) || 0;
    const includedKm = Number(formData.baseIncludedKm) || 0;
    const ratePerKm = Number(formData.ratePerKm) || 0;
    const baseTow = Number(formData.baseTowingCharge) || 0;

    const additionalKm = Math.max(0, actualKm - includedKm);
    const distanceCharge = additionalKm * ratePerKm;
    const totalTowingDistance = baseTow + distanceCharge;

    // Labour
    const labourTowing = Number(formData.labourTowing) || 0;
    const labourRecovery = Number(formData.labourRecovery) || 0;
    const labourLoading = Number(formData.labourLoading) || 0;
    const additionalLabourHours = Number(formData.labourAdditionalHours) || 0;
    const labourRatePerHour = Number(formData.labourRatePerHour) || 0;
    const labourHourlyTotal = additionalLabourHours * labourRatePerHour;
    const labourTotal = labourTowing + labourRecovery + labourLoading + labourHourlyTotal;

    // Waiting
    const actualWait = Number(formData.actualWaitingMin) || 0;
    const freeWait = Number(formData.freeWaitingMin) || 0;
    const waitingRate = Number(formData.waitingRatePer30Min) || 0;
    const chargeableWaitMin = Math.max(0, actualWait - freeWait);
    const waitingBlocks = Math.ceil(chargeableWaitMin / 30);
    const waitingCharge = waitingBlocks * waitingRate;

    // Others
    const night = formData.nightChargeEnabled ? Number(formData.nightChargeAmount) || 0 : 0;
    const express = formData.expressChargeEnabled ? Number(formData.expressChargeAmount) || 0 : 0;
    const toll = Number(formData.tollChargeAmount) || 0;
    const parking = Number(formData.parkingChargeAmount) || 0;
    const other = Number(formData.otherChargeAmount) || 0;
    const otherChargesTotal = night + express + toll + parking + other;

    // Gross
    const grossAmount = totalTowingDistance + labourTotal + waitingCharge + otherChargesTotal;
    const gstRate = 0.18; // 18% GST
    const gstAmount = Math.round(grossAmount * gstRate);
    const grandTotal = grossAmount + gstAmount;

    // Assistance Coverage & Limits
    const eligible = Number(formData.eligibleCoverage) || 1500;
    const alreadyUsed = Number(formData.alreadyUsedCoverage) || 0;
    const availableBalance = Math.max(0, eligible - alreadyUsed);

    const insuranceCovered = Math.min(grandTotal, availableBalance);
    const customerPayable = Math.max(0, grandTotal - availableBalance);
    const isCoverageExceeded = grandTotal > availableBalance;
    const exceededAmount = isCoverageExceeded ? grandTotal - availableBalance : 0;

    // Active Itemized Line Items for clean bill & invoice
    const lineItems = [];
    if (baseTow > 0) {
      lineItems.push({
        id: 'item-base',
        description: `Base Towing Flatbed Charge (Includes ${includedKm} KM)`,
        qty: '1 Job',
        amount: baseTow
      });
    }
    if (distanceCharge > 0) {
      lineItems.push({
        id: 'item-dist',
        description: `Additional Transit Distance (${additionalKm.toFixed(1)} KM @ ${formatINR(ratePerKm)}/KM)`,
        qty: `${additionalKm.toFixed(1)} KM`,
        amount: distanceCharge
      });
    }
    if (labourTowing > 0) {
      lineItems.push({
        id: 'item-labour-tow',
        description: 'Towing Hookup & Securing Labour',
        qty: 'Service',
        amount: labourTowing
      });
    }
    if (labourRecovery > 0) {
      lineItems.push({
        id: 'item-winch',
        description: 'Heavy Winching & Ditch Extraction Labour',
        qty: 'Recovery',
        amount: labourRecovery
      });
    }
    if (labourLoading > 0) {
      lineItems.push({
        id: 'item-load',
        description: 'Flatbed Ramp Loading & Unloading',
        qty: 'Assistance',
        amount: labourLoading
      });
    }
    if (labourHourlyTotal > 0) {
      lineItems.push({
        id: 'item-extra-hrs',
        description: `Additional Labour Detention (${additionalLabourHours} hrs @ ${formatINR(labourRatePerHour)}/hr)`,
        qty: `${additionalLabourHours} hrs`,
        amount: labourHourlyTotal
      });
    }
    if (waitingCharge > 0) {
      lineItems.push({
        id: 'item-wait',
        description: `On-Site Waiting Charges (${chargeableWaitMin} min chargeable)`,
        qty: `${chargeableWaitMin} min`,
        amount: waitingCharge
      });
    }
    if (toll > 0) {
      lineItems.push({
        id: 'item-toll',
        description: 'Expressway & National Highway Tolls Paid',
        qty: 'Actuals',
        amount: toll
      });
    }
    if (night > 0) {
      lineItems.push({
        id: 'item-night',
        description: 'Night Emergency Assistance Surcharge (10 PM - 6 AM)',
        qty: 'Surcharge',
        amount: night
      });
    }
    if (express > 0) {
      lineItems.push({
        id: 'item-express',
        description: 'Emergency Rush Dispatch (<20 min SLA)',
        qty: 'Priority',
        amount: express
      });
    }
    if (parking > 0) {
      lineItems.push({
        id: 'item-parking',
        description: 'Overnight Workshop Yard Holding Fee',
        qty: 'Holding',
        amount: parking
      });
    }
    if (other > 0) {
      lineItems.push({
        id: 'item-other',
        description: 'Consumables, Wheel Skates & Hazard Markers',
        qty: 'Other',
        amount: other
      });
    }

    return {
      additionalKm,
      distanceCharge,
      totalTowingDistance,
      labourTotal,
      chargeableWaitMin,
      waitingCharge,
      otherChargesTotal,
      grossAmount,
      gstAmount,
      grandTotal,
      availableBalance,
      insuranceCovered,
      customerPayable,
      isCoverageExceeded,
      exceededAmount,
      lineItems
    };
  }, [formData]);

  // Action 1: "Save" (Draft)
  // Requires ONLY Customer Name OR Vehicle Number. Status remains/becomes "Draft".
  const handleSaveDraft = (e) => {
    if (e) e.preventDefault();
    if (isLocked) return;

    const hasCustomer = Boolean(formData.clientName?.trim());
    const hasVehicle = Boolean(formData.vehicleNumber?.trim());

    if (!hasCustomer && !hasVehicle) {
      setValidationErrors({
        draft: 'Please enter at least a Customer Name or Vehicle Number to save a draft.'
      });
      return;
    }

    setValidationErrors({});
    const isExisting = (towingJobs || []).some((j) => j.id === formData.id);
    const updatedJob = {
      ...formData,
      jobStatus: formData.jobStatus === 'Completed' ? 'Completed' : 'Draft',
      calculatedCharges: calc
    };

    if (isExisting && formData.id) {
      updateTowingJob(formData.id, updatedJob);
    } else {
      const created = addTowingJob(updatedJob);
      setFormData(created);
      setSelectedJobId(created.id);
    }

    initialSnapshotRef.current = JSON.stringify(updatedJob);
    setSaveSuccessMessage('Draft saved successfully! (Status: Draft)');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // Action 2: "Save & Complete Job"
  // Requires all 7 core job details. Allows Payment Status as "Pending / Unpaid".
  // Generates official Bill Number ONCE. Locks completed job for non-admins.
  const handleSaveAndComplete = (e) => {
    if (e) e.preventDefault();
    if (isLocked) return;

    const errors = {};

    // 1. Customer Name
    if (!formData.clientName?.trim()) {
      errors.clientName = 'Customer Name is required.';
    }
    // 2. Phone Number
    if (!formData.phone?.trim()) {
      errors.phone = 'Customer Phone Number is required.';
    }
    // 3. Vehicle Registration Number
    if (!formData.vehicleNumber?.trim()) {
      errors.vehicleNumber = 'Vehicle Registration Number is required.';
    }
    // 4. Pickup Location
    if (!formData.breakdownLocation?.trim()) {
      errors.breakdownLocation = 'Pickup Location / Breakdown Spot is required.';
    }
    // 5. Destination Drop
    if (!formData.destinationWorkshop?.trim()) {
      errors.destinationWorkshop = 'Destination Workshop / Drop Location is required.';
    }
    // 6. Towing Distance (> 0)
    const distance = Number(formData.actualDistanceKm) || 0;
    if (distance <= 0) {
      errors.actualDistanceKm = 'Towing Distance must be greater than 0 KM.';
    }
    // 7. At least one line item / charge
    const hasCharges = calc.grossAmount > 0 || calc.lineItems.length > 0;
    if (!hasCharges) {
      errors.charges = 'At least one charge line item is required in the bill layout.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Auto-switch to tab containing first error
      if (errors.clientName || errors.phone || errors.vehicleNumber || errors.breakdownLocation || errors.destinationWorkshop) {
        setActiveTab('REQUEST');
      } else if (errors.actualDistanceKm) {
        setActiveTab('DETAILS');
      } else if (errors.charges) {
        setActiveTab('CHARGES');
      }
      return;
    }

    setValidationErrors({});

    // Generate Bill Number ONCE if not already generated
    let finalBillNo = formData.billNo;
    if (!finalBillNo) {
      const year = new Date().getFullYear();
      finalBillNo = `TOW-BILL-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const completedJob = {
      ...formData,
      billNo: finalBillNo,
      jobStatus: 'Completed',
      calculatedCharges: calc
    };

    const isExisting = (towingJobs || []).some((j) => j.id === formData.id);
    if (isExisting && formData.id) {
      updateTowingJob(formData.id, completedJob);
    } else {
      const created = addTowingJob(completedJob);
      setSelectedJobId(created.id);
    }

    setFormData(completedJob);
    initialSnapshotRef.current = JSON.stringify(completedJob);
    setSaveSuccessMessage(`Job Completed successfully! Official Bill #${finalBillNo} generated.`);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToCustomer = () => {
    const billRef = formData.billNo || 'PROVISIONAL DRAFT';
    const whatsappText = encodeURIComponent(
      `RAJU VENDOR - Roadside Assistance & Towing Bill\n` +
      `Bill Reference: ${billRef}\n` +
      `Customer: ${formData.clientName}\n` +
      `Vehicle: ${formData.vehicleNumber}\n` +
      `Route: ${formData.breakdownLocation} -> ${formData.destinationWorkshop} (${formData.actualDistanceKm} KM)\n` +
      `Gross Amount: ${formatINR(calc.grossAmount)}\n` +
      `GST (18%): ${formatINR(calc.gstAmount)}\n` +
      `Total Amount: ${formatINR(calc.grandTotal)}\n` +
      `Insurance Covered: ${formatINR(calc.insuranceCovered)}\n` +
      `Net Customer Payable: ${formatINR(calc.customerPayable)}\n` +
      `Payment Status: ${formData.paymentStatus}`
    );

    if (addNotification) {
      addNotification(`Towing invoice dispatched via SMS & WhatsApp to ${formData.phone}`, 'success');
    }
    if (addAuditLog) {
      addAuditLog(`Towing invoice sent to customer`, formData.vehicleNumber);
    }
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
  };

  // Active tab index for Next/Back logic
  const activeTabIndex = TOWING_TABS.findIndex((t) => t.id === activeTab);
  const isLastTab = activeTabIndex === TOWING_TABS.length - 1; // Tab 6: BILLING

  const handleNextTab = () => {
    if (activeTabIndex < TOWING_TABS.length - 1) {
      setActiveTab(TOWING_TABS[activeTabIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    if (activeTabIndex > 0) {
      setActiveTab(TOWING_TABS[activeTabIndex - 1].id);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseRequest}
        title="Roadside Assistance & Towing Request"
        subtitle="24x7 Emergency Dispatch, KM Charging, Labour Breakdown & Official Billing"
        maxWidth="max-w-5xl"
        className="max-h-[92vh]"
        headerAction={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                formData.jobStatus === 'Completed'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : formData.jobStatus === 'Draft'
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300'
              }`}
            >
              {formData.jobStatus === 'Completed' ? (
                <Lock className="w-3 h-3 text-emerald-700" />
              ) : (
                <Clock className="w-3 h-3 text-slate-500" />
              )}
              Status: {formData.jobStatus}
            </span>

            {formData.billNo && (
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Bill #{formData.billNo}
              </span>
            )}
          </div>
        }
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <div>
              {activeTabIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevTab}
                  icon={ChevronLeft}
                  className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isLastTab ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextTab}
                  icon={ChevronRight}
                  iconPosition="right"
                  className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-xs font-bold text-white shadow-xs"
                >
                  Next
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseRequest}
                    className="text-xs"
                  >
                    Close
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={isLocked}
                    className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Save (Draft)
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAndComplete}
                    disabled={isLocked}
                    className={`text-xs font-bold text-white shadow-xs ${
                      isLocked ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    Save & Complete Job
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Top Job Switcher & Status Bar */}
          <div className="p-2.5 bg-slate-100/80 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 -mt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Request:</span>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="text-xs font-bold px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="NEW">+ New Towing Request / Blank Draft</option>
                {(towingJobs || []).map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.id} - {j.vehicleNumber || 'No Reg'} ({j.clientName || 'Draft'}) [{j.jobStatus}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedJobId('NEW')}
                icon={FilePlus2}
                className="text-xs py-1 px-2.5 bg-white font-bold"
              >
                + New Request
              </Button>
            </div>
          </div>

          {/* Locked Notice for Non-Admins */}
          {isLocked && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Job Completed & Locked (Read-Only):</strong> Official Bill <strong>#{formData.billNo}</strong> has been generated. Only Principal Broker / Admin can modify completed towing records.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[10px] uppercase">
                Staff Restricted
              </span>
            </div>
          )}

          {/* Admin Override Badge */}
          {isCompleted && isAdmin && (
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>
                  <strong>Admin Access Active:</strong> As Principal Broker / Admin, you have authority to edit completed records and bill details.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 font-black text-[10px] uppercase">
                Admin Unlocked
              </span>
            </div>
          )}

          {/* Validation Error Summary Banner */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-950">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Validation Incomplete — Please resolve the following before proceeding:</span>
              </div>
              <ul className="list-disc list-inside pl-5 space-y-0.5 text-[11px] text-rose-800">
                {validationErrors.draft && <li>{validationErrors.draft}</li>}
                {validationErrors.clientName && <li>{validationErrors.clientName}</li>}
                {validationErrors.phone && <li>{validationErrors.phone}</li>}
                {validationErrors.vehicleNumber && <li>{validationErrors.vehicleNumber}</li>}
                {validationErrors.breakdownLocation && <li>{validationErrors.breakdownLocation}</li>}
                {validationErrors.destinationWorkshop && <li>{validationErrors.destinationWorkshop}</li>}
                {validationErrors.actualDistanceKm && <li>{validationErrors.actualDistanceKm}</li>}
                {validationErrors.charges && <li>{validationErrors.charges}</li>}
              </ul>
            </div>
          )}

          {/* Save Success Banner */}
          {saveSuccessMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                {saveSuccessMessage}
              </span>
              <button onClick={() => setSaveSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 6 Responsive Tabs Bar */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 -mx-6 -mt-1 px-4 sm:px-6 pt-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {TOWING_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasTabError =
                (tab.id === 'REQUEST' && (validationErrors.clientName || validationErrors.phone || validationErrors.vehicleNumber || validationErrors.breakdownLocation || validationErrors.destinationWorkshop || validationErrors.draft)) ||
                (tab.id === 'DETAILS' && validationErrors.actualDistanceKm) ||
                (tab.id === 'CHARGES' && validationErrors.charges);

              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  ref={isActive ? activeTabButtonRef : null}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#0B1E3D] text-[#0B1E3D] bg-white rounded-t-lg shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${hasTabError ? 'text-rose-500' : isActive ? 'text-[#0B1E3D]' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  {hasTabError && <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />}
                </button>
              );
            })}
          </div>

          {/* TAB 1: REQUEST */}
          {activeTab === 'REQUEST' && (
            <div className="space-y-3 pt-1">
              {/* Smart Document Scan & Auto-Fill */}
              <DocumentScanDropzone
                title="Scan RC / Policy / Spot Photo"
                subtitle="Upload document photo to auto-fill vehicle, customer & breakdown details"
                allowedPresets={['sample-rc-1', 'sample-towing-spot', 'sample-policy-1']}
                onScanComplete={handleScanComplete}
              />

              {scanNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
                  <span className="font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    {scanNotice}
                  </span>
                  <button
                    type="button"
                    onClick={() => setScanNotice(null)}
                    className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Linked Policy Auto-fill */}
              <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">Link Active Motor Policy</span>
                    <span className="text-[10px] text-blue-700">Auto-populates vehicle, client, and assistance coverage</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    disabled={isLocked}
                    value={formData.policyNumber}
                    onChange={(e) => handlePolicySelect(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="">Select Motor Policy...</option>
                    {motorPolicies.map((pol) => (
                      <option key={pol.id} value={pol.id}>
                        {pol.id} - {pol.vehicleNumber || 'No Reg'} ({pol.clientName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer & Breakdown Core Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Customer / Insured Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 border rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 ${
                        validationErrors.clientName || validationErrors.draft ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                      placeholder="e.g. R. Karthikeyan"
                    />
                  </div>
                  {validationErrors.clientName && (
                    <p className="text-[11px] text-rose-600 mt-0.5 font-semibold">{validationErrors.clientName}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Emergency Contact Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 border rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 ${
                        validationErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                      placeholder="+91 98412 34567"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-0.5 font-semibold">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vehicle Registration Number *
                  </label>
                  <div className="relative">
                    <Car className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.vehicleNumber}
                      onChange={(e) => handleChange('vehicleNumber', e.target.value.toUpperCase())}
                      className={`w-full pl-8 pr-3 py-1.5 border rounded-lg font-mono font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 ${
                        validationErrors.vehicleNumber || validationErrors.draft ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                      placeholder="TN 09 BX 4512"
                    />
                  </div>
                  {validationErrors.vehicleNumber && (
                    <p className="text-[11px] text-rose-600 mt-0.5 font-semibold">{validationErrors.vehicleNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Breakdown Reason / Condition
                  </label>
                  <select
                    value={formData.breakdownReason}
                    disabled={isLocked}
                    onChange={(e) => handleChange('breakdownReason', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="Accident Collision / Non-Driveable">Accident Collision / Non-Driveable</option>
                    <option value="Mechanical Breakdown / Engine Failure">Mechanical Breakdown / Engine Failure</option>
                    <option value="Battery Dead / Alternator Failure">Battery Dead / Alternator Failure</option>
                    <option value="Flat Tyre / Wheel Axle Damage">Flat Tyre / Wheel Axle Damage</option>
                    <option value="Gearbox / Transmission Jam">Gearbox / Transmission Jam</option>
                    <option value="Off-road Ditch / Winching Needed">Off-road Ditch / Winching Needed</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Pickup Location / Exact Breakdown Spot *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.breakdownLocation}
                      onChange={(e) => handleChange('breakdownLocation', e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 border rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 ${
                        validationErrors.breakdownLocation ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                      placeholder="e.g. GST Road, Near Kathipara Flyover, Guindy, Chennai"
                    />
                  </div>
                  {validationErrors.breakdownLocation && (
                    <p className="text-[11px] text-rose-600 mt-0.5 font-semibold">{validationErrors.breakdownLocation}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Towing Destination (Workshop / Drop Location) *
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.destinationWorkshop}
                      onChange={(e) => handleChange('destinationWorkshop', e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 border rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 ${
                        validationErrors.destinationWorkshop ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                      placeholder="e.g. Authorized Maruti Service Center, Guindy Industrial Estate"
                    />
                  </div>
                  {validationErrors.destinationWorkshop && (
                    <p className="text-[11px] text-rose-600 mt-0.5 font-semibold">{validationErrors.destinationWorkshop}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tow Truck Type</label>
                  <select
                    value={formData.towType}
                    disabled={isLocked}
                    onChange={(e) => handleChange('towType', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="Flatbed Tow Truck">Flatbed Tow Truck (Hydraulic)</option>
                    <option value="Wheel Lift Tow Truck">Wheel Lift Tow Truck</option>
                    <option value="Integrated Heavy Duty">Integrated Heavy Duty</option>
                    <option value="Underlift Boom Crane">Underlift Boom Crane</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Mobility Condition</label>
                  <select
                    value={formData.vehicleCondition}
                    disabled={isLocked}
                    onChange={(e) => handleChange('vehicleCondition', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="Non-Driveable">Non-Driveable (Accident / Jammed)</option>
                    <option value="Rolling (Driveable)">Rolling (Steering OK, Engine Fault)</option>
                    <option value="Off-Road (Rollover / Trench)">Off-Road (Rollover / Trench)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Actual Distance (KM) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    disabled={isLocked}
                    value={formData.actualDistanceKm}
                    onChange={(e) => handleChange('actualDistanceKm', Number(e.target.value))}
                    className={`w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 ${
                      validationErrors.actualDistanceKm ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                    placeholder="e.g. 18.5"
                  />
                  {validationErrors.actualDistanceKm && (
                    <p className="text-[11px] text-rose-600 mt-0.5 font-semibold">{validationErrors.actualDistanceKm}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Distance (KM)</label>
                  <input
                    type="number"
                    disabled={isLocked}
                    value={formData.estimatedDistanceKm}
                    onChange={(e) => handleChange('estimatedDistanceKm', Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Towing RSA Partner</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.partnerName}
                    onChange={(e) => handleChange('partnerName', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Partner Emergency Phone</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.partnerPhone}
                    onChange={(e) => handleChange('partnerPhone', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tow Truck Reg No</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.towTruckNo}
                    onChange={(e) => handleChange('towTruckNo', e.target.value.toUpperCase())}
                    placeholder="TN 02 AA 9812"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold uppercase disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Driver Name</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.driverName}
                    onChange={(e) => handleChange('driverName', e.target.value)}
                    placeholder="S. Murugan"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.driverPhone}
                    onChange={(e) => handleChange('driverPhone', e.target.value)}
                    placeholder="+91 94441 55667"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHARGES & RATES */}
          {activeTab === 'CHARGES' && (
            <div className="space-y-3 pt-1 text-xs">
              {validationErrors.charges && (
                <div className="p-2 rounded bg-rose-50 border border-rose-300 text-rose-800 font-bold text-xs">
                  ⚠️ {validationErrors.charges}
                </div>
              )}

              {/* 1. Base & Distance Rates */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Distance Rates & Base Package
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono font-bold">
                    Total Distance Fee: {formatINR(calc.totalTowingDistance)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Rate Card</label>
                    <select
                      value={formData.rateCard}
                      disabled={isLocked}
                      onChange={(e) => handleChange('rateCard', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs font-semibold text-slate-900 bg-white disabled:bg-slate-100"
                    >
                      <option value="Standard">Standard City RSA</option>
                      <option value="Highway">NH Highway Premium</option>
                      <option value="Heavy Commercial">Heavy Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Base Fee</label>
                    <div className="relative">
                      <IndianRupee className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={formData.baseTowingCharge}
                        onChange={(e) => handleChange('baseTowingCharge', Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1 border rounded font-mono font-bold text-slate-900 disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Base Included KM</label>
                    <input
                      type="number"
                      min="0"
                      disabled={isLocked}
                      value={formData.baseIncludedKm}
                      onChange={(e) => handleChange('baseIncludedKm', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded font-mono text-slate-900 disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Rate / KM</label>
                    <div className="relative">
                      <IndianRupee className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={formData.ratePerKm}
                        onChange={(e) => handleChange('ratePerKm', Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1 border rounded font-mono font-bold text-slate-900 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200 flex justify-between">
                  <span>
                    Additional Distance: <strong>{calc.additionalKm.toFixed(1)} KM</strong> (Actual {formData.actualDistanceKm} KM - Base {formData.baseIncludedKm} KM)
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    Distance Charge: {formatINR(calc.distanceCharge)}
                  </span>
                </div>
              </div>

              {/* 2. Labour & Recovery */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Labour, Recovery & Winching Breakdown
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-800">
                    Labour Total: {formatINR(calc.labourTotal)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Towing Hookup Labour</label>
                    <div className="relative">
                      <IndianRupee className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={formData.labourTowing}
                        onChange={(e) => handleChange('labourTowing', Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Recovery / Winch Labour</label>
                    <div className="relative">
                      <IndianRupee className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={formData.labourRecovery}
                        onChange={(e) => handleChange('labourRecovery', Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Ramp Loading / Securing</label>
                    <div className="relative">
                      <IndianRupee className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={formData.labourLoading}
                        onChange={(e) => handleChange('labourLoading', Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Waiting & Toll Surcharges */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Waiting Time, Tolls & Surcharges
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-800">
                    Surcharges: {formatINR(calc.waitingCharge + calc.otherChargesTotal)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Actual Waiting (Min)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={isLocked}
                      value={formData.actualWaitingMin}
                      onChange={(e) => handleChange('actualWaitingMin', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded font-mono disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Toll Charges</label>
                    <div className="relative">
                      <IndianRupee className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        disabled={isLocked}
                        value={formData.tollChargeAmount}
                        onChange={(e) => handleChange('tollChargeAmount', Number(e.target.value))}
                        className="w-full pl-6 pr-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3">
                    <input
                      type="checkbox"
                      id="nightCharge"
                      disabled={isLocked}
                      checked={formData.nightChargeEnabled}
                      onChange={(e) => handleChange('nightChargeEnabled', e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="nightCharge" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                      Night Fee (+{formatINR(200)})
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-3">
                    <input
                      type="checkbox"
                      id="expressCharge"
                      disabled={isLocked}
                      checked={formData.expressChargeEnabled}
                      onChange={(e) => handleChange('expressChargeEnabled', e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="expressCharge" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                      Express SLA (+{formatINR(150)})
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Real-time Calculation Summary Card */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 block tracking-wider">
                    Total Estimated Bill
                  </span>
                  <span className="text-xs text-slate-600 font-mono">
                    Gross: {formatINR(calc.grossAmount)} + GST (18%): {formatINR(calc.gstAmount)} = {formatINR(calc.grandTotal)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer Net Payable</span>
                  <span className="text-sm font-mono font-black text-blue-900">{formatINR(calc.customerPayable)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCS */}
          {activeTab === 'DOCS' && (
            <div className="space-y-3 pt-1 text-xs">
              <DocumentScanDropzone
                title="Scan & Upload Breakdown Proof"
                subtitle="Upload spot photo, loading proof, or workshop delivery receipt"
                allowedPresets={['sample-towing-spot', 'sample-rc-1']}
                onScanComplete={handleScanComplete}
              />
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 block">Proof of Breakdown & Towing Deliverables</span>
                  <span className="text-[10px] text-slate-500">Required for insurance cashless reimbursement & audit compliance</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  disabled={isLocked}
                  onClick={() => alert('Document upload modal activated')}
                  className="text-xs bg-white"
                >
                  Upload Proof
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(formData.documents || []).map((doc) => (
                  <div key={doc.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-500 block">{doc.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === 'Uploaded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => alert(`Previewing ${doc.name}`)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT DETAILS */}
          {activeTab === 'PAYMENT' && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                    Payment Information & Settlement Mode
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    (Note: Completing with Payment Status as "Pending" is permitted)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      disabled={isLocked}
                      onChange={(e) => handleChange('paymentStatus', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                    >
                      <option value="Pending">Pending / Unpaid</option>
                      <option value="Paid by Customer">Paid by Customer</option>
                      <option value="Paid by Insurance">Paid by Insurance</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Waived">Waived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      disabled={isLocked}
                      onChange={(e) => handleChange('paymentMethod', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold text-slate-900 bg-white disabled:bg-slate-100"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="Cash">Cash to Driver</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Transaction ID / Reference</label>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.transactionId}
                      onChange={(e) => handleChange('transactionId', e.target.value)}
                      placeholder="e.g. UPI-REF-99881234"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Date</label>
                    <input
                      type="date"
                      disabled={isLocked}
                      value={formData.paymentDate}
                      onChange={(e) => handleChange('paymentDate', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Job Operational Status</label>
                    <select
                      value={formData.jobStatus}
                      disabled={isLocked}
                      onChange={(e) => handleChange('jobStatus', e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Requested">Requested</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Settlement Summary Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Insurance Cashless Settlement
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs text-slate-600">Covered under policy:</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm">{formatINR(calc.insuranceCovered)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Directly settled with insurer. Deducted from customer bill.
                  </p>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                    Customer Balance Payable
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs text-slate-600">Net due from customer:</span>
                    <span className="font-mono font-black text-blue-900 text-base">{formatINR(calc.customerPayable)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Payable via selected method ({formData.paymentMethod}).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BILLING & INVOICE */}
          {activeTab === 'BILLING' && (
            <div className="space-y-3 pt-1 text-xs">
              {/* Action Bar for Invoice */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">Official Billing Preview:</span>
                  <span className="font-mono text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                    {formData.billNo || 'PROVISIONAL DRAFT'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={handlePrint}
                    className="text-xs font-bold cursor-pointer bg-white"
                  >
                    Print / PDF
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Send}
                    onClick={handleSendToCustomer}
                    className="text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer bg-white"
                  >
                    WhatsApp Bill
                  </Button>
                </div>
              </div>

              {/* On-Screen Clean Preview of the Bill */}
              <div className="p-4 bg-white rounded-xl border-2 border-slate-300 space-y-3 shadow-xs">
                <div className="flex justify-between items-start border-b pb-2 border-slate-200">
                  <div>
                    <h3 className="font-black text-sm text-[#0B1E3D] tracking-tight">
                      RAJU VENDOR - ROADSIDE ASSISTANCE & TOWING BILL
                    </h3>
                    <p className="text-[11px] text-slate-500">24x7 Emergency Broker Support & Assistance Operations</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-blue-900 block">
                      {formData.billNo || 'PROVISIONAL DRAFT'}
                    </span>
                    <span className="text-[10px] text-slate-400">Request: {formData.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                    <span className="font-bold text-slate-900">{formData.clientName || 'N/A'}</span>
                    <span className="text-[10px] text-slate-500 block">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle Reg</span>
                    <span className="font-mono font-bold text-slate-900">{formData.vehicleNumber || 'N/A'}</span>
                    <span className="text-[10px] text-slate-500 block">{formData.towType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Transit Route</span>
                    <span className="font-semibold text-slate-800 block truncate">{formData.breakdownLocation || 'Pickup Pending'}</span>
                    <span className="text-[10px] text-slate-500 block truncate">➔ {formData.destinationWorkshop || 'Drop Pending'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Distance & Driver</span>
                    <span className="font-bold text-blue-900 block">{formData.actualDistanceKm} KM</span>
                    <span className="text-[10px] text-slate-500 block">{formData.driverName || 'Velu'} ({formData.towTruckNo})</span>
                  </div>
                </div>

                {/* Itemized Line Items Table */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                      <th className="py-1 text-left">Description</th>
                      <th className="py-1 text-center">Qty / Rate</th>
                      <th className="py-1 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {calc.lineItems.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-3 text-center text-slate-400 italic">
                          No line items configured. Adjust distance or charges in Tab 3.
                        </td>
                      </tr>
                    ) : (
                      calc.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-1 font-semibold text-slate-800">{item.description}</td>
                          <td className="py-1 text-center text-slate-500 font-mono">{item.qty}</td>
                          <td className="py-1 text-right font-mono font-semibold">{formatINR(item.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-300 font-bold">
                    <tr>
                      <td colSpan={2} className="py-1 text-slate-700">Subtotal (Gross)</td>
                      <td className="py-1 text-right font-mono">{formatINR(calc.grossAmount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-1 text-slate-600">GST (18%)</td>
                      <td className="py-1 text-right font-mono text-slate-700">{formatINR(calc.gstAmount)}</td>
                    </tr>
                    <tr className="text-sm border-t border-slate-200">
                      <td colSpan={2} className="py-1 text-[#0B1E3D] font-black">Grand Total</td>
                      <td className="py-1 text-right font-mono font-black text-[#0B1E3D]">{formatINR(calc.grandTotal)}</td>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-900">
                      <td colSpan={2} className="py-1 px-2">Covered by Insurance RSA Endorsement</td>
                      <td className="py-1 px-2 text-right font-mono font-bold">- {formatINR(calc.insuranceCovered)}</td>
                    </tr>
                    <tr className="bg-blue-50 text-blue-900 text-sm">
                      <td colSpan={2} className="py-1.5 px-2 font-black">Net Customer Payable</td>
                      <td className="py-1.5 px-2 text-right font-mono font-black">{formatINR(calc.customerPayable)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* DEDICATED PRINT CONTAINER: Portaled directly to document.body to bypass all modal fixed/overflow wrappers */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div id="towing-printable-bill" className="hidden print:block font-sans text-slate-900 bg-white">
            {/* 1. Header */}
            <div className="border-b-2 border-slate-900 pb-3 mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                    RAJU VENDOR - 24x7 ROADSIDE ASSISTANCE & TOWING
                  </h1>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                    Licensed General Insurance Broker & Assistance Operations • 24x7 Emergency Dispatch
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    GSTIN: 33AAAAA0000A1Z5 • 14/2 Anna Salai, Chennai 600032 • Helpline: 1800-425-8899
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                    TAX INVOICE / TOWING BILL
                  </span>
                  <span className="text-sm font-mono font-black text-slate-900 block">
                    {formData.billNo || 'PROVISIONAL DRAFT'}
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Structured Metadata Grid */}
            <div className="grid grid-cols-4 gap-2 pb-2 mb-2 border-b border-slate-300 text-[10px] print-avoid-break">
              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 uppercase font-bold text-[9px] block">Customer Details</span>
                <span className="font-bold text-slate-900 block">{formData.clientName || 'N/A'}</span>
                <span className="text-slate-600 font-mono block">{formData.phone}</span>
                <span className="text-slate-500 text-[9px] block">Policy: {formData.policyNumber || 'Direct'}</span>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 uppercase font-bold text-[9px] block">Vehicle Details</span>
                <span className="font-mono font-bold text-slate-900 block">{formData.vehicleNumber || 'N/A'}</span>
                <span className="text-slate-600 block">{formData.towType}</span>
                <span className="text-slate-500 text-[9px] block">Cond: {formData.vehicleCondition}</span>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 uppercase font-bold text-[9px] block">Transit Route</span>
                <span className="font-semibold text-slate-900 block truncate">From: {formData.breakdownLocation || 'Spot'}</span>
                <span className="font-semibold text-slate-900 block truncate">To: {formData.destinationWorkshop || 'Workshop'}</span>
                <span className="text-blue-900 font-bold block">{formData.actualDistanceKm} KM Billeted</span>
              </div>

              <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 uppercase font-bold text-[9px] block">Assistance Unit</span>
                <span className="font-bold text-slate-900 block">{formData.partnerName}</span>
                <span className="text-slate-600 block">Truck: {formData.towTruckNo || 'TN 02 AA 9812'}</span>
                <span className="text-slate-500 text-[9px] block">Driver: {formData.driverName || 'Velu'} ({formData.driverPhone})</span>
              </div>
            </div>

            {/* 3. Itemized Bill Table */}
            <div className="mb-2 print-avoid-break">
              <table className="w-full text-[10px] border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px]">
                    <th className="py-1.5 px-2 text-left w-8">#</th>
                    <th className="py-1.5 px-2 text-left">Description of Towing Service / Charge Item</th>
                    <th className="py-1.5 px-2 text-center w-24">Basis / Quantity</th>
                    <th className="py-1.5 px-2 text-right w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calc.lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-2 text-center text-slate-400 italic">
                        No charges entered
                      </td>
                    </tr>
                  ) : (
                    calc.lineItems.map((item, idx) => (
                      <tr key={item.id} className="break-inside-avoid">
                        <td className="py-1 px-2 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="py-1 px-2 font-semibold text-slate-900">{item.description}</td>
                        <td className="py-1 px-2 text-center text-slate-600 font-mono">{item.qty}</td>
                        <td className="py-1 px-2 text-right font-mono font-bold">{formatINR(item.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Financial Summary Block */}
            <div className="flex justify-between items-start gap-4 mb-3 print-avoid-break">
              {/* Payment Status & Instructions */}
              <div className="flex-1 p-2 bg-slate-50 rounded border border-slate-200 text-[9px] space-y-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Payment Status:</span>
                  <span className={`px-2 py-0.5 rounded font-black uppercase text-[9px] ${
                    formData.paymentStatus === 'Paid by Customer' || formData.paymentStatus === 'Paid by Insurance'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {formData.paymentStatus || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mode:</span>
                  <span className="font-semibold text-slate-900">{formData.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transaction Ref:</span>
                  <span className="font-mono text-slate-900">{formData.transactionId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Docket Status:</span>
                  <span className="font-bold text-slate-900">{formData.jobStatus}</span>
                </div>
              </div>

              {/* Totals Table */}
              <div className="w-64 border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-[10px]">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 text-slate-600 font-medium">Subtotal (Gross):</td>
                      <td className="py-1 px-2 text-right font-mono font-semibold">{formatINR(calc.grossAmount)}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 text-slate-600 font-medium">GST (18% Output):</td>
                      <td className="py-1 px-2 text-right font-mono font-semibold">{formatINR(calc.gstAmount)}</td>
                    </tr>
                    <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                      <td className="py-1 px-2 text-slate-900">Grand Total:</td>
                      <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">{formatINR(calc.grandTotal)}</td>
                    </tr>
                    <tr className="border-b border-slate-200 text-emerald-800">
                      <td className="py-1 px-2 font-medium">Less: Insurance Coverage:</td>
                      <td className="py-1 px-2 text-right font-mono font-bold">- {formatINR(calc.insuranceCovered)}</td>
                    </tr>
                    <tr className="bg-slate-900 text-white font-black text-[11px]">
                      <td className="py-1.5 px-2">Net Customer Payable:</td>
                      <td className="py-1.5 px-2 text-right font-mono text-sm">{formatINR(calc.customerPayable)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Declarations & Dual Signatures */}
            <div className="border-t border-slate-300 pt-3 text-[10px] print-avoid-break">
              <div className="flex justify-between items-end pt-5">
                <div className="text-center w-48 border-t border-slate-400 pt-1">
                  <span className="font-bold text-slate-900 block">{formData.clientName || 'Customer Signature'}</span>
                  <span className="text-[9px] text-slate-500">(Received in good order)</span>
                </div>

                <div className="text-center w-48 border-t border-slate-400 pt-1">
                  <span className="font-bold text-slate-900 block">For RAJU VENDOR</span>
                  <span className="text-[9px] text-slate-500">(Authorized Operations Signatory)</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default TowingRequestModal;
