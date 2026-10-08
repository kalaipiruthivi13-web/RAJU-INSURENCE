import React, { useState, useMemo, useEffect } from 'react';
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
  X
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAppData } from '../../context/AppDataContext';

export function TowingRequestModal({ isOpen, onClose }) {
  const {
    policies,
    towingJobs,
    addTowingJob,
    updateTowingJob,
    addNotification,
    addAuditLog
  } = useAppData();

  const [activeTab, setActiveTab] = useState('REQUEST'); // 'REQUEST' | 'DETAILS' | 'CHARGES' | 'DOCS' | 'BILLING'

  // Filter active motor policies
  const motorPolicies = useMemo(() => {
    return policies.filter((p) => {
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

  const activeJob = towingJobs?.[0];

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    id: activeJob?.id || 'TOW-2026-00125',
    billNo: activeJob?.billNo || 'TOW-BILL-2026-00125',
    requestDateTime: '08/10/2026 07:10 PM',
    pickupDateTime: '08/10/2026 07:20 PM',
    policyNumber: motorPolicies[0]?.id || 'POL-2024-8891',
    vehicleNumber: motorPolicies[0]?.vehicleNumber || 'TN 09 BX 4512',
    clientName: motorPolicies[0]?.clientName || 'R. Karthikeyan',
    phone: motorPolicies[0]?.phone || '+91 98412 34567',
    breakdownLocation: 'GST Road, Near Kathipara Flyover, Chennai',
    destinationWorkshop: 'Authorized Maruti Service Center, Guindy',
    breakdownReason: 'Accident Collision / Non-Driveable',
    towType: 'Flatbed Tow Truck',
    vehicleCondition: 'Non-Driveable',
    estimatedDistanceKm: 18.5,
    actualDistanceKm: 18.5,

    // Towing Partner Details
    partnerName: 'TVS Auto Assist 24x7',
    partnerPhone: '+91 98409 11223',
    towTruckNo: 'TN 09 TC 4488',
    driverName: 'S. Velu',
    driverPhone: '+91 94441 66778',
    rateCard: 'Standard',

    // Rate Card & Distance Charges
    baseTowingCharge: 450,
    baseIncludedKm: 10,
    ratePerKm: 25,

    // Labour / Service Charges
    labourTowing: 200,
    labourRecovery: 100,
    labourLoading: 0,
    labourAdditionalHours: 0,
    labourRatePerHour: 150,

    // Waiting Charges
    freeWaitingMin: 30,
    actualWaitingMin: 55,
    waitingRatePer30Min: 100,

    // Other Charges
    nightChargeEnabled: false,
    nightChargeAmount: 200,
    expressChargeEnabled: false,
    expressChargeAmount: 150,
    tollChargeAmount: 150,
    parkingChargeAmount: 0,
    otherChargeAmount: 0,

    // Assistance Coverage & Limits
    eligibleCoverage: 1500,
    alreadyUsedCoverage: 500,

    // Job Lifecycle & Payment
    jobStatus: 'Dispatched',
    paymentStatus: 'Pending',
    paymentMethod: 'UPI',
    transactionId: '',
    paymentDate: '',

    // Proof Documents
    documents: [
      { id: 'doc-1', name: 'Breakdown Spot Photo.jpg', category: 'Breakdown Photo', status: 'Uploaded', url: '#' },
      { id: 'doc-2', name: 'Front Bumper Condition.jpg', category: 'Vehicle Condition Photo', status: 'Uploaded', url: '#' },
      { id: 'doc-3', name: 'Flatbed Loading Proof.jpg', category: 'Tow Truck Photo', status: 'Uploaded', url: '#' },
      { id: 'doc-4', name: 'Workshop Delivery Acknowledgement.pdf', category: 'Delivery Confirmation', status: 'Pending', url: '#' }
    ]
  });

  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  // Sync if activeJob changes
  useEffect(() => {
    if (activeJob) {
      setFormData((prev) => ({
        ...prev,
        ...activeJob
      }));
    }
  }, [activeJob]);

  // Policy Selection Handler
  const handlePolicySelect = (policyId) => {
    const selected = motorPolicies.find((p) => p.id === policyId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        policyNumber: selected.id,
        vehicleNumber: selected.vehicleNumber || prev.vehicleNumber,
        clientName: selected.clientName || prev.clientName,
        phone: selected.phone || prev.phone
      }));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      exceededAmount
    };
  }, [formData]);

  const handleSaveJob = (e) => {
    if (e) e.preventDefault();
    if (updateTowingJob) {
      updateTowingJob(formData.id, {
        ...formData,
        calculatedCharges: calc
      });
    }
    setSaveSuccessMessage('Towing job & bill details saved successfully!');
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

  const handleSendToPartner = () => {
    if (addNotification) {
      addNotification(`Towing job work-order dispatched to ${formData.partnerName}`, 'info');
    }
    alert(`Towing work-order dispatched to partner (${formData.partnerName})`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Roadside Assistance & Towing Request"
      subtitle="Complete 24x7 emergency dispatch, KM-based charging, labour, coverage limits & billing"
      size="xl"
    >
      <div className="space-y-3.5">
        {/* Save feedback banner */}
        {saveSuccessMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              {saveSuccessMessage}
            </span>
            <button onClick={() => setSaveSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 5 Operational Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/60 -mx-6 -mt-2 px-6 pt-2 overflow-x-auto">
          {[
            { id: 'REQUEST', label: '1. Request', icon: MapPin },
            { id: 'DETAILS', label: '2. Towing Details', icon: Truck },
            { id: 'CHARGES', label: '3. Charges & Rates', icon: DollarSign },
            { id: 'DOCS', label: '4. Documents & Proof', icon: FileText },
            { id: 'BILLING', label: '5. Billing & Invoice', icon: Receipt }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#0B1E3D] text-[#0B1E3D] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0B1E3D]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
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
                  <span className="text-[10px] text-blue-700">Auto-fill customer, asset ID & assistance limits</span>
                </div>
              </div>
              <select
                value={formData.policyNumber}
                onChange={(e) => handlePolicySelect(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-blue-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
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
                  Vehicle Registration Number *
                </label>
                <div className="relative">
                  <Car className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.vehicleNumber}
                    onChange={(e) => handleChange('vehicleNumber', e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold uppercase text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="TN 09 BX 4512"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Driver / Customer Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="R. Karthikeyan"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Emergency Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98412 34567"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Breakdown Condition
                </label>
                <select
                  value={formData.breakdownReason}
                  onChange={(e) => handleChange('breakdownReason', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
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
                  Breakdown Spot / Exact Landmark *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.breakdownLocation}
                    onChange={(e) => handleChange('breakdownLocation', e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="GST Road, Near Kathipara Flyover, Guindy, Chennai"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Towing Destination (Workshop / Garage) *
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.destinationWorkshop}
                    onChange={(e) => handleChange('destinationWorkshop', e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="Authorized Maruti Service Center, Guindy Industrial Estate"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('DETAILS')}
                className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-xs font-bold cursor-pointer"
              >
                Proceed to Towing Details →
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: TOWING DETAILS */}
        {activeTab === 'DETAILS' && (
          <div className="space-y-3 pt-1 text-xs">
            {/* Header Docket Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tow Request ID</span>
                <span className="font-mono font-bold text-blue-900">{formData.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Request Date & Time</span>
                <span className="font-semibold text-slate-800">{formData.requestDateTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Pickup Date & Time</span>
                <span className="font-semibold text-slate-800">{formData.pickupDateTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Job Status</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {formData.jobStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tow Type
                </label>
                <select
                  value={formData.towType}
                  onChange={(e) => handleChange('towType', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="Flatbed Tow Truck">Flatbed Tow Truck</option>
                  <option value="Wheel Lift">Wheel Lift</option>
                  <option value="Hydraulic Tow">Hydraulic Tow</option>
                  <option value="Bike Carrier">Bike Carrier</option>
                  <option value="Other">Other Heavy Duty</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vehicle Driveability Condition
                </label>
                <select
                  value={formData.vehicleCondition}
                  onChange={(e) => handleChange('vehicleCondition', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="Non-Driveable">Non-Driveable (Severe)</option>
                  <option value="Driveable">Driveable (Minor)</option>
                  <option value="Locked / Jammed">Locked / Jammed Steering</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Distance (KM)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.estimatedDistanceKm}
                  onChange={(e) => handleChange('estimatedDistanceKm', Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Actual Distance Covered (KM) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.actualDistanceKm}
                  onChange={(e) => handleChange('actualDistanceKm', Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 bg-blue-50/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Towing Partner
                </label>
                <select
                  value={formData.partnerName}
                  onChange={(e) => handleChange('partnerName', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="TVS Auto Assist 24x7">TVS Auto Assist 24x7</option>
                  <option value="All India Roadside Assistance">All India Roadside Assistance</option>
                  <option value="Crossroads India RSA">Crossroads India RSA</option>
                  <option value="Chennai Heavy Lift Tows">Chennai Heavy Lift Tows</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Partner Rate Card
                </label>
                <select
                  value={formData.rateCard}
                  onChange={(e) => handleChange('rateCard', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                >
                  <option value="Standard">Standard Tier (₹25/KM)</option>
                  <option value="Premium">Premium Flatbed (₹35/KM)</option>
                  <option value="Emergency">Emergency Night Out (₹45/KM)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tow Truck Vehicle No
                </label>
                <input
                  type="text"
                  value={formData.towTruckNo}
                  onChange={(e) => handleChange('towTruckNo', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold text-slate-900"
                  placeholder="TN 09 TC 4488"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => handleChange('driverName', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-900"
                  placeholder="S. Velu"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Driver Phone Number
                </label>
                <input
                  type="text"
                  value={formData.driverPhone}
                  onChange={(e) => handleChange('driverPhone', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold text-slate-900"
                  placeholder="+91 94441 66778"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab('REQUEST')}>
                ← Back to Request
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
        )}

        {/* TAB 3: CHARGES & RATES (KM, Labour, Waiting, Limits) */}
        {activeTab === 'CHARGES' && (
          <div className="space-y-3 pt-1 text-xs">
            {/* 1. Distance Charges Card */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  KM-Wise Distance Charges (Rate Card Model)
                </span>
                <span className="font-mono font-bold text-blue-900">
                  Total: ₹{calc.totalTowingDistance.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Base Tow Fee</label>
                  <input
                    type="number"
                    value={formData.baseTowingCharge}
                    onChange={(e) => handleChange('baseTowingCharge', Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Included KM</label>
                  <input
                    type="number"
                    value={formData.baseIncludedKm}
                    onChange={(e) => handleChange('baseIncludedKm', Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Actual KM</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.actualDistanceKm}
                    onChange={(e) => handleChange('actualDistanceKm', Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs font-mono font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Rate / KM (₹)</label>
                  <input
                    type="number"
                    value={formData.ratePerKm}
                    onChange={(e) => handleChange('ratePerKm', Number(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Additional KM Fee</label>
                  <div className="px-2 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800">
                    {calc.additionalKm.toFixed(1)} km × ₹{formData.ratePerKm} = ₹{calc.distanceCharge.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Labour & Waiting Charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Labour */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Labour & Winching Charges</span>
                  <span className="font-mono font-bold text-emerald-800">₹{calc.labourTotal}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block font-semibold text-slate-600">Towing Labour</label>
                    <input
                      type="number"
                      value={formData.labourTowing}
                      onChange={(e) => handleChange('labourTowing', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600">Winching / Recovery</label>
                    <input
                      type="number"
                      value={formData.labourRecovery}
                      onChange={(e) => handleChange('labourRecovery', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600">Loading / Unloading</label>
                    <input
                      type="number"
                      value={formData.labourLoading}
                      onChange={(e) => handleChange('labourLoading', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600">Extra Hrs (× ₹150)</label>
                    <input
                      type="number"
                      value={formData.labourAdditionalHours}
                      onChange={(e) => handleChange('labourAdditionalHours', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Waiting & Other */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Waiting & Tolls</span>
                  <span className="font-mono font-bold text-amber-800">
                    ₹{calc.waitingCharge + calc.otherChargesTotal}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block font-semibold text-slate-600">Actual Waiting (min)</label>
                    <input
                      type="number"
                      value={formData.actualWaitingMin}
                      onChange={(e) => handleChange('actualWaitingMin', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600">Chargeable Waiting</label>
                    <div className="px-2 py-1 bg-slate-100 rounded font-mono font-bold">
                      {calc.chargeableWaitMin} min (₹{calc.waitingCharge})
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600">Toll Charges</label>
                    <input
                      type="number"
                      value={formData.tollChargeAmount}
                      onChange={(e) => handleChange('tollChargeAmount', Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded font-mono"
                    />
                  </div>
                  <div className="flex items-center pt-3 gap-2">
                    <input
                      type="checkbox"
                      id="nightCharge"
                      checked={formData.nightChargeEnabled}
                      onChange={(e) => handleChange('nightChargeEnabled', e.target.checked)}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                    <label htmlFor="nightCharge" className="font-semibold text-slate-700 cursor-pointer">
                      Night Fee (+₹200)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Insurance Coverage vs Customer Payable with Limit Exceeded Warning */}
            <div className={`p-3 rounded-xl border space-y-2 ${
              calc.isCoverageExceeded ? 'bg-amber-50/70 border-amber-300' : 'bg-emerald-50/60 border-emerald-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-200/60">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Assistance Coverage vs Customer Payable
                </span>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="text-slate-600">Policy Limit: ₹{formData.eligibleCoverage}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">Used: ₹{formData.alreadyUsedCoverage}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-800">Available: ₹{calc.availableBalance}</span>
                </div>
              </div>

              {calc.isCoverageExceeded && (
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-[11px] font-bold">
                    Coverage limit exceeded! Customer payable balance is ₹{calc.customerPayable.toFixed(2)}.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Gross Amount</span>
                  <span className="text-sm font-mono font-bold text-slate-900">₹{calc.grossAmount.toFixed(2)}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">GST (18%)</span>
                  <span className="text-sm font-mono font-bold text-slate-700">₹{calc.gstAmount.toFixed(2)}</span>
                </div>
                <div className="p-2 bg-emerald-100/60 rounded-lg border border-emerald-300">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Insurance Covered</span>
                  <span className="text-sm font-mono font-black text-emerald-900">₹{calc.insuranceCovered.toFixed(2)}</span>
                </div>
                <div className="p-2 bg-blue-100/60 rounded-lg border border-blue-300">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Customer Payable</span>
                  <span className="text-sm font-mono font-black text-blue-900">₹{calc.customerPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab('DETAILS')}>
                ← Back to Details
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
        )}

        {/* TAB 4: DOCUMENTS & PROOF */}
        {activeTab === 'DOCS' && (
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <span className="font-bold text-slate-900 block">Job Evidence & Documents Checklist</span>
                <span className="text-[11px] text-slate-500">Attach photos, workshop receipt, and customer sign-off</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Upload}
                onClick={() => {
                  alert('Document uploaded successfully to Job Evidence repository!');
                }}
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

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab('CHARGES')}>
                ← Back to Charges
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('BILLING')}
                className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-xs font-bold"
              >
                Proceed to Towing Bill & Invoice →
              </Button>
            </div>
          </div>
        )}

        {/* TAB 5: BILLING & INVOICE */}
        {activeTab === 'BILLING' && (
          <div className="space-y-3.5 pt-1 text-xs">
            {/* Action Bar for Invoice */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-100/70 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">Job Lifecycle:</span>
                <select
                  value={formData.jobStatus}
                  onChange={(e) => handleChange('jobStatus', e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-blue-900 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Requested">1. Requested</option>
                  <option value="Assigned">2. Assigned</option>
                  <option value="Dispatched">3. Dispatched</option>
                  <option value="Driver En Route">4. Driver En Route</option>
                  <option value="Vehicle Picked Up">5. Vehicle Picked Up</option>
                  <option value="Vehicle Delivered">6. Vehicle Delivered</option>
                  <option value="Bill Generated">7. Bill Generated</option>
                  <option value="Payment Completed">8. Payment Completed</option>
                  <option value="Closed">9. Closed</option>
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
                  variant="primary"
                  size="sm"
                  onClick={handleSaveJob}
                  className="bg-[#0B1E3D] hover:bg-[#1E4E8C] text-xs font-bold cursor-pointer"
                >
                  Save Bill
                </Button>
              </div>
            </div>

            {/* Printable Formatted Towing Service Bill */}
            <div className="p-4 bg-white rounded-xl border-2 border-slate-300 space-y-3 shadow-xs">
              <div className="flex justify-between items-start border-b pb-2 border-slate-200">
                <div>
                  <h3 className="font-black text-sm text-[#0B1E3D] tracking-tight">
                    RAJU VENDOR - ROADSIDE ASSISTANCE & TOWING BILL
                  </h3>
                  <p className="text-[11px] text-slate-500">24x7 Emergency Broker Support & Assistance Operations</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-blue-900 block">{formData.billNo}</span>
                  <span className="text-[10px] text-slate-400">Request: {formData.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pb-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-900">{formData.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle</span>
                  <span className="font-mono font-bold text-slate-900">{formData.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Route / Distance</span>
                  <span className="font-semibold text-slate-800">{formData.actualDistanceKm} KM ({formData.towType})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Partner</span>
                  <span className="font-semibold text-slate-800">{formData.partnerName}</span>
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
                  <tr>
                    <td className="py-1 font-semibold text-slate-800">Base Towing Charge (Incl. {formData.baseIncludedKm} KM)</td>
                    <td className="py-1 text-center text-slate-500 font-mono">1 Job</td>
                    <td className="py-1 text-right font-mono font-semibold">₹{formData.baseTowingCharge.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-800">Additional Distance Charge ({calc.additionalKm.toFixed(1)} KM @ ₹{formData.ratePerKm}/KM)</td>
                    <td className="py-1 text-center text-slate-500 font-mono">{calc.additionalKm.toFixed(1)} KM</td>
                    <td className="py-1 text-right font-mono font-semibold">₹{calc.distanceCharge.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-800">Labour & Winching / Recovery</td>
                    <td className="py-1 text-center text-slate-500 font-mono">Assistance</td>
                    <td className="py-1 text-right font-mono font-semibold">₹{calc.labourTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-800">Waiting Charges ({calc.chargeableWaitMin} min chargeable)</td>
                    <td className="py-1 text-center text-slate-500 font-mono">{calc.chargeableWaitMin} min</td>
                    <td className="py-1 text-right font-mono font-semibold">₹{calc.waitingCharge.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 font-semibold text-slate-800">Tolls, Night & Parking Surcharges</td>
                    <td className="py-1 text-center text-slate-500 font-mono">Tolls</td>
                    <td className="py-1 text-right font-mono font-semibold">₹{calc.otherChargesTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot className="border-t-2 border-slate-300 font-bold">
                  <tr>
                    <td colSpan={2} className="py-1 text-slate-700">Subtotal</td>
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
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleChange('paymentStatus', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid by Insurance">Paid by Insurance</option>
                  <option value="Paid by Customer">Paid by Customer</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Waived">Waived</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Cash">Cash to Driver</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Transaction ID / UTR</label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => handleChange('transactionId', e.target.value)}
                  placeholder="UPI-REF-99881234"
                  className="w-full px-2 py-1 border rounded text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab('DOCS')}>
                ← Back to Documents
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveJob}
                className="bg-[#0B1E3D] hover:bg-[#1E4E8C] text-xs font-bold"
              >
                Save & Complete Job
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TowingRequestModal;
