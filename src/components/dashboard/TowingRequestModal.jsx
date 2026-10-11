import React, { useState, useMemo, useEffect } from 'react';
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
  DollarSign,
  FileText,
  Receipt,
  Download,
  Printer,
  Send,
  Upload,
  Check,
  ChevronRight,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  X,
  Lock,
  Unlock,
  FilePlus2,
  Sparkles
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAppData } from '../../context/AppDataContext';

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

  const [activeTab, setActiveTab] = useState('REQUEST'); // 'REQUEST' | 'DETAILS' | 'CHARGES' | 'DOCS' | 'BILLING'
  const [selectedJobId, setSelectedJobId] = useState(towingJobs?.[0]?.id || 'NEW');

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

  // Comprehensive Form State
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
      setFormData({
        ...BLANK_JOB_TEMPLATE,
        id: `TOW-${year}-${Math.floor(10000 + Math.random() * 90000)}`,
        requestDateTime: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
        jobStatus: 'Draft',
        billNo: ''
      });
      setValidationErrors({});
    } else {
      const found = towingJobs?.find((j) => j.id === selectedJobId);
      if (found) {
        setFormData({ ...found });
        setValidationErrors({});
      }
    }
  }, [selectedJobId, towingJobs]);

  // Role-Based Locking
  const isCompleted = formData.jobStatus === 'Completed';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isLocked = isCompleted && !isAdmin;

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
      // Clear relevant errors
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

    // Active Itemized Line Items for clean printing
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
        description: `Additional Transit Distance (${additionalKm.toFixed(1)} KM @ ₹${ratePerKm}/KM)`,
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
        description: `Additional Labour Detention (${additionalLabourHours} hrs @ ₹${labourRatePerHour}/hr)`,
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

    setSaveSuccessMessage('Draft saved successfully! (Status: Draft)');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // Action 2: "Save & Complete Job"
  // Requires all 7 core job details. Allows Payment Status as "Pending / Unpaid".
  // Generates official Bill Number ONCE. Locks completed job.
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
    setSaveSuccessMessage(`Job Completed successfully! Official Bill #${finalBillNo} generated.`);
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Test Preset: Short Bill (1-2 charge lines, fits on 1 page)
  const handleLoadShortBillPreset = () => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      actualDistanceKm: 15,
      baseTowingCharge: 450,
      baseIncludedKm: 10,
      ratePerKm: 25,
      labourTowing: 0,
      labourRecovery: 0,
      labourLoading: 0,
      labourAdditionalHours: 0,
      actualWaitingMin: 0,
      tollChargeAmount: 0,
      parkingChargeAmount: 0,
      otherChargeAmount: 0,
      nightChargeEnabled: false,
      expressChargeEnabled: false
    }));
    setSaveSuccessMessage('Loaded Short Bill Preset (2 charge lines: Base Tow + Distance). Prints on 1 page!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Test Preset: Long Bill (many charge lines, multi-page break)
  const handleLoadLongBillPreset = () => {
    if (isLocked) return;
    setFormData((prev) => ({
      ...prev,
      actualDistanceKm: 32,
      baseTowingCharge: 450,
      baseIncludedKm: 10,
      ratePerKm: 25,
      labourTowing: 200,
      labourRecovery: 150,
      labourLoading: 100,
      labourAdditionalHours: 2,
      labourRatePerHour: 150,
      actualWaitingMin: 75,
      waitingRatePer30Min: 100,
      tollChargeAmount: 150,
      parkingChargeAmount: 100,
      otherChargeAmount: 80,
      nightChargeEnabled: true,
      nightChargeAmount: 200,
      expressChargeEnabled: true,
      expressChargeAmount: 150
    }));
    setSaveSuccessMessage('Loaded Long Bill Preset (12 line items). Paginates cleanly without trailing blank pages!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToCustomer = () => {
    if (addNotification) {
      addNotification(`Towing invoice dispatched via SMS & WhatsApp to ${formData.phone}`, 'success');
    }
    if (addAuditLog) {
      addAuditLog(`Towing invoice sent to customer`, formData.vehicleNumber);
    }
    alert(`Towing bill summary sent via WhatsApp & SMS to ${formData.phone}`);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Roadside Assistance & Towing Request"
        subtitle="24x7 Emergency Dispatch, KM Charging, Labour Breakdown & Official Billing"
        size="xl"
        footer={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                formData.jobStatus === 'Completed'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : formData.jobStatus === 'Draft'
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-blue-50 text-blue-800 border-blue-300'
              }`}>
                {formData.jobStatus === 'Completed' ? <Lock className="w-3 h-3 text-emerald-700" /> : <Clock className="w-3 h-3 text-slate-500" />}
                Status: {formData.jobStatus}
              </span>

              {formData.billNo && (
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Bill #{formData.billNo}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
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

          {/* 5 Operational Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/60 -mx-6 -mt-1 px-6 pt-1.5 overflow-x-auto">
            {[
              { id: 'REQUEST', label: '1. Request', icon: MapPin },
              { id: 'DETAILS', label: '2. Towing Details', icon: Truck },
              { id: 'CHARGES', label: '3. Charges & Rates', icon: DollarSign },
              { id: 'DOCS', label: '4. Documents & Proof', icon: FileText },
              { id: 'BILLING', label: '5. Billing & Invoice', icon: Receipt }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasTabError =
                (tab.id === 'REQUEST' && (validationErrors.clientName || validationErrors.phone || validationErrors.vehicleNumber || validationErrors.breakdownLocation || validationErrors.destinationWorkshop || validationErrors.draft)) ||
                (tab.id === 'DETAILS' && validationErrors.actualDistanceKm) ||
                (tab.id === 'CHARGES' && validationErrors.charges);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-[#0B1E3D] text-[#0B1E3D] bg-white rounded-t-lg shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${hasTabError ? 'text-rose-500' : isActive ? 'text-[#0B1E3D]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {hasTabError && <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />}
                </button>
              );
            })}
          </div>

          {/* TAB 1: REQUEST */}
          {activeTab === 'REQUEST' && (
            <div className="space-y-3 pt-1">
              {/* Linked Policy Auto-fill */}
              <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-blue-900 block">Link Active Motor Policy</span>
                    <span className="text-[10px] text-blue-700">Auto-fill customer, vehicle ID & assistance limits</span>
                  </div>
                </div>
                <select
                  value={formData.policyNumber}
                  disabled={isLocked}
                  onChange={(e) => handlePolicySelect(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-blue-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100"
                >
                  <option value="">Select Motor Policy...</option>
                  {motorPolicies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.vehicleNumber} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Customer / Driver Name *
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

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isLocked}>
                  Save (Draft)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('DETAILS')}
                  className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-xs font-bold"
                >
                  Proceed to Towing Details →
                </Button>
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
              </div>

              {/* Towing Partner & Fleet Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Assigned Towing Partner & Driver</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Partner Fleet</label>
                    <select
                      value={formData.partnerName}
                      disabled={isLocked}
                      onChange={(e) => handleChange('partnerName', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-semibold bg-white disabled:bg-slate-100"
                    >
                      <option value="TVS Auto Assist 24x7">TVS Auto Assist 24x7</option>
                      <option value="All India Roadside Assistance">All India Roadside Assistance</option>
                      <option value="Crossroads India RSA">Crossroads India RSA</option>
                      <option value="Chennai Heavy Lift Tows">Chennai Heavy Lift Tows</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tow Truck Reg No</label>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.towTruckNo}
                      onChange={(e) => handleChange('towTruckNo', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono font-semibold disabled:bg-slate-100"
                      placeholder="TN 09 TC 4488"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Driver Name</label>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.driverName}
                      onChange={(e) => handleChange('driverName', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-semibold disabled:bg-slate-100"
                      placeholder="S. Velu"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Driver Contact</label>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.driverPhone}
                      onChange={(e) => handleChange('driverPhone', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono font-semibold disabled:bg-slate-100"
                      placeholder="+91 94441 66778"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('REQUEST')}>
                  ← Back to Request
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isLocked}>
                    Save (Draft)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('CHARGES')}
                    className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-xs font-bold"
                  >
                    Proceed to Charges & Rates →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHARGES & RATES */}
          {activeTab === 'CHARGES' && (
            <div className="space-y-3 pt-1 text-xs">
              {/* Presets Toolbar */}
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Quick Bill Presets:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={handleLoadShortBillPreset}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    📄 Load Short Bill (1-2 Lines • Single Page A4)
                  </button>
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={handleLoadLongBillPreset}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-indigo-300 text-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    📑 Load Long Bill (12 Lines • Clean Multi-Page)
                  </button>
                </div>
              </div>

              {validationErrors.charges && (
                <div className="p-2 rounded bg-rose-50 border border-rose-300 text-rose-800 font-bold text-xs">
                  ⚠️ {validationErrors.charges}
                </div>
              )}

              {/* Distance Charges */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Distance Charges (KM Rate Card)
                  </span>
                  <span className="font-mono font-bold text-blue-900">
                    Total Distance Fee: ₹{calc.totalTowingDistance.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Base Fee (₹)</label>
                    <input
                      type="number"
                      disabled={isLocked}
                      value={formData.baseTowingCharge}
                      onChange={(e) => handleChange('baseTowingCharge', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-xs font-mono font-bold disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Included KM</label>
                    <input
                      type="number"
                      disabled={isLocked}
                      value={formData.baseIncludedKm}
                      onChange={(e) => handleChange('baseIncludedKm', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-xs font-mono disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Actual KM</label>
                    <input
                      type="number"
                      step="0.1"
                      disabled={isLocked}
                      value={formData.actualDistanceKm}
                      onChange={(e) => handleChange('actualDistanceKm', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-xs font-mono font-bold text-blue-700 disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Rate / KM (₹)</label>
                    <input
                      type="number"
                      disabled={isLocked}
                      value={formData.ratePerKm}
                      onChange={(e) => handleChange('ratePerKm', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-xs font-mono font-bold disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Additional KM Fee</label>
                    <div className="px-2 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800">
                      ₹{calc.distanceCharge.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Labour & Waiting Charges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Labour */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-bold text-slate-900">Labour & Winching</span>
                    <span className="font-mono font-bold text-emerald-800">₹{calc.labourTotal}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="block font-semibold text-slate-600">Towing Labour (₹)</label>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={formData.labourTowing}
                        onChange={(e) => handleChange('labourTowing', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600">Recovery / Winch (₹)</label>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={formData.labourRecovery}
                        onChange={(e) => handleChange('labourRecovery', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600">Loading / Ramp (₹)</label>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={formData.labourLoading}
                        onChange={(e) => handleChange('labourLoading', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600">Extra Hours (hrs)</label>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={formData.labourAdditionalHours}
                        onChange={(e) => handleChange('labourAdditionalHours', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Waiting & Surcharges */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-bold text-slate-900">Waiting & Toll Surcharges</span>
                    <span className="font-mono font-bold text-amber-800">₹{calc.waitingCharge + calc.otherChargesTotal}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="block font-semibold text-slate-600">Waiting Time (min)</label>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={formData.actualWaitingMin}
                        onChange={(e) => handleChange('actualWaitingMin', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600">Toll Charges (₹)</label>
                      <input
                        type="number"
                        disabled={isLocked}
                        value={formData.tollChargeAmount}
                        onChange={(e) => handleChange('tollChargeAmount', Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded font-mono disabled:bg-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-2">
                      <input
                        type="checkbox"
                        id="nightChargeToggle"
                        disabled={isLocked}
                        checked={formData.nightChargeEnabled}
                        onChange={(e) => handleChange('nightChargeEnabled', e.target.checked)}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                      <label htmlFor="nightChargeToggle" className="font-semibold text-slate-700 cursor-pointer">
                        Night Fee (+₹200)
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2">
                      <input
                        type="checkbox"
                        id="expressChargeToggle"
                        disabled={isLocked}
                        checked={formData.expressChargeEnabled}
                        onChange={(e) => handleChange('expressChargeEnabled', e.target.checked)}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                      <label htmlFor="expressChargeToggle" className="font-semibold text-slate-700 cursor-pointer">
                        Express SLA (+₹150)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistance Coverage vs Customer Payable */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Summary Breakdown</span>
                  <span className="text-[11px] text-slate-500">
                    Gross: ₹{calc.grossAmount} + GST (18%): ₹{calc.gstAmount} = ₹{calc.grandTotal}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer Net Payable</span>
                  <span className="text-sm font-mono font-black text-blue-900">₹{calc.customerPayable.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('DETAILS')}>
                  ← Back to Details
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isLocked}>
                    Save (Draft)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('DOCS')}
                    className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-xs font-bold"
                  >
                    Proceed to Documents & Proof →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS & PROOF */}
          {activeTab === 'DOCS' && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 block">Job Evidence & Documents Checklist</span>
                  <span className="text-[11px] text-slate-500">Incident photos, workshop sign-off, and customer receipts</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Upload}
                  disabled={isLocked}
                  onClick={() => alert('Document proof uploaded successfully!')}
                  className="text-xs font-bold"
                >
                  + Upload Proof
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{doc.category}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{doc.name}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            doc.status === 'Uploaded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => alert(`Previewing ${doc.name}`)}
                            className="text-blue-700 font-bold hover:underline cursor-pointer"
                          >
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('CHARGES')}>
                  ← Back to Charges
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isLocked}>
                    Save (Draft)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('BILLING')}
                    className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-xs font-bold"
                  >
                    Proceed to Billing & Invoice →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BILLING & INVOICE */}
          {activeTab === 'BILLING' && (
            <div className="space-y-3 pt-1 text-xs">
              {/* Action Bar for Invoice */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">Job Status:</span>
                  <select
                    value={formData.jobStatus}
                    disabled={isLocked}
                    onChange={(e) => handleChange('jobStatus', e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-blue-900 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Requested">Requested</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={handlePrint}
                    className="text-xs font-bold cursor-pointer"
                  >
                    Print / PDF
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Send}
                    onClick={handleSendToCustomer}
                    className="text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                  >
                    WhatsApp Bill
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={isLocked}
                    className="text-xs font-bold"
                  >
                    Save (Draft)
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAndComplete}
                    disabled={isLocked}
                    className="bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white shadow-xs"
                  >
                    Save & Complete Job
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
                          <td className="py-1 text-right font-mono font-semibold">₹{item.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-300 font-bold">
                    <tr>
                      <td colSpan={2} className="py-1 text-slate-700">Subtotal (Gross)</td>
                      <td className="py-1 text-right font-mono">₹{calc.grossAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-1 text-slate-600">GST (18%)</td>
                      <td className="py-1 text-right font-mono text-slate-700">₹{calc.gstAmount.toFixed(2)}</td>
                    </tr>
                    <tr className="text-sm border-t border-slate-200">
                      <td colSpan={2} className="py-1 text-[#0B1E3D] font-black">Grand Total</td>
                      <td className="py-1 text-right font-mono font-black text-[#0B1E3D]">₹{calc.grandTotal.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-900">
                      <td colSpan={2} className="py-1 px-2">Covered by Insurance RSA Endorsement</td>
                      <td className="py-1 px-2 text-right font-mono font-bold">- ₹{calc.insuranceCovered.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50 text-blue-900 text-sm">
                      <td colSpan={2} className="py-1.5 px-2 font-black">Net Customer Payable</td>
                      <td className="py-1.5 px-2 text-right font-mono font-black">₹{calc.customerPayable.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Details Section */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Payment Information</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    (Note: Completing with Payment Status as "Pending" is allowed)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      disabled={isLocked}
                      onChange={(e) => handleChange('paymentStatus', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                    >
                      <option value="Pending">Pending / Unpaid</option>
                      <option value="Paid by Customer">Paid by Customer</option>
                      <option value="Paid by Insurance">Paid by Insurance</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Waived">Waived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      disabled={isLocked}
                      onChange={(e) => handleChange('paymentMethod', e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs font-semibold text-slate-900 bg-white disabled:bg-slate-100"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Card">Debit / Credit Card</option>
                      <option value="Cash">Cash to Driver</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Transaction ID / Reference</label>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={formData.transactionId}
                      onChange={(e) => handleChange('transactionId', e.target.value)}
                      placeholder="e.g. UPI-REF-99881234"
                      className="w-full px-2 py-1 border rounded text-xs font-mono disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab('DOCS')}>
                  ← Back to Documents
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isLocked}>
                    Save (Draft)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAndComplete}
                    disabled={isLocked}
                    className="bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white shadow-xs"
                  >
                    Save & Complete Job
                  </Button>
                </div>
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
                    Date: {formData.requestDateTime || new Date().toLocaleDateString('en-IN')}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    Request ID: {formData.id}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Customer & Vehicle Dossier */}
            <div className="print-avoid-break mb-3 p-2.5 rounded border border-slate-300 bg-slate-50/50">
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Customer Name</span>
                  <span className="font-bold text-slate-900 block">{formData.clientName || 'N/A'}</span>
                  <span className="text-slate-600 block">{formData.phone}</span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Vehicle Number</span>
                  <span className="font-mono font-bold text-slate-900 block">{formData.vehicleNumber || 'N/A'}</span>
                  <span className="text-slate-600 block">{formData.towType}</span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Pickup Location</span>
                  <span className="font-semibold text-slate-800 block line-clamp-2">{formData.breakdownLocation || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Destination Workshop</span>
                  <span className="font-semibold text-slate-800 block line-clamp-2">{formData.destinationWorkshop || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[10px] pt-2 mt-2 border-t border-slate-200">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Towing Distance</span>
                  <span className="font-mono font-bold text-slate-900 block">{formData.actualDistanceKm} KM</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Tow Partner</span>
                  <span className="font-semibold text-slate-800 block">{formData.partnerName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Tow Truck Reg</span>
                  <span className="font-mono font-semibold text-slate-800 block">{formData.towTruckNo || 'TN 09 TC 4488'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold block">Driver Name</span>
                  <span className="font-semibold text-slate-800 block">{formData.driverName || 'S. Velu'}</span>
                </div>
              </div>
            </div>

            {/* 3. Line Items Table */}
            <div className="mb-3">
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-700 font-bold uppercase text-[9px]">
                    <th className="py-1.5 text-left w-12">Sr.</th>
                    <th className="py-1.5 text-left">Description of Towing Service / Charge</th>
                    <th className="py-1.5 text-center w-28">Basis / Qty</th>
                    <th className="py-1.5 text-right w-28">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calc.lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-2 text-center text-slate-500 italic">
                        Standard Towing Dispatch Service (Base Charge Included)
                      </td>
                    </tr>
                  ) : (
                    calc.lineItems.map((item, idx) => (
                      <tr key={item.id} className="break-inside-avoid">
                        <td className="py-1 text-slate-500 font-mono">{idx + 1}.</td>
                        <td className="py-1 font-semibold text-slate-900">{item.description}</td>
                        <td className="py-1 text-center font-mono text-slate-600">{item.qty}</td>
                        <td className="py-1 text-right font-mono font-bold text-slate-900">
                          ₹{item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Financial Totals & Signatures Block */}
            <div className="print-avoid-break break-inside-avoid border-t-2 border-slate-900 pt-2 space-y-3">
              <div className="flex justify-between items-start gap-4">
                {/* Left: Payment Status & Authorization */}
                <div className="w-1/2 text-[10px] space-y-1.5">
                  <div className="p-2 border border-slate-200 rounded bg-slate-50">
                    <span className="text-[9px] font-bold uppercase text-slate-500 block mb-0.5">
                      Settlement & Payment Details
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-slate-500">Payment Status:</span>{' '}
                        <strong className="text-slate-900">{formData.paymentStatus}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Mode:</span>{' '}
                        <strong className="text-slate-900">{formData.paymentMethod}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Ref / UTR:</span>{' '}
                        <span className="font-mono text-slate-900">{formData.transactionId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-500 leading-tight">
                    Statutory Notice: Computer generated invoice for roadside emergency assistance rendered under broker facilitation. Subject to Chennai jurisdiction.
                  </p>
                </div>

                {/* Right: Itemized Summary Totals */}
                <div className="w-1/2 text-[10px]">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-0.5 text-slate-600">Subtotal (Gross Towing & Labour):</td>
                        <td className="py-0.5 text-right font-mono font-semibold">₹{calc.grossAmount.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-slate-600">GST on Assistance (18%):</td>
                        <td className="py-0.5 text-right font-mono font-semibold">₹{calc.gstAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-slate-300">
                        <td className="py-1 font-bold text-slate-900">Grand Total Invoice Value:</td>
                        <td className="py-1 text-right font-mono font-bold text-slate-900">₹{calc.grandTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-slate-600">Covered by Insurance RSA Limit:</td>
                        <td className="py-0.5 text-right font-mono font-bold text-emerald-800">- ₹{calc.insuranceCovered.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-slate-900 bg-slate-100/80">
                        <td className="py-1.5 px-2 font-black text-slate-900 text-[11px]">NET CUSTOMER PAYABLE:</td>
                        <td className="py-1.5 px-2 text-right font-mono font-black text-slate-900 text-[12px]">
                          ₹{calc.customerPayable.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Signatures Block */}
              <div className="print-avoid-break break-inside-avoid pt-6 mt-4 flex justify-between items-end text-[10px]">
                <div className="text-center w-48 border-t border-slate-400 pt-1">
                  <span className="font-bold text-slate-900 block">Customer Signature</span>
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
