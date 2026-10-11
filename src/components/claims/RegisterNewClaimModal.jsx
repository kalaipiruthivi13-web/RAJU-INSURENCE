import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  User,
  Upload,
  X,
  FileText,
  Eye,
  Check,
  AlertTriangle,
  Trash2,
  Plus
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAppData } from '../../context/AppDataContext';
import { claimsService, DYNAMIC_CHECKLIST_CONFIG, normalizeClaimType } from '../../services/claimsService';
import { storeFileBlob } from '../../services/indexedDbStorage';

export function RegisterNewClaimModal({ isOpen, onClose }) {
  const {
    partners,
    policies,
    addNotification,
    setSelectedClaimId,
    setActiveTab
  } = useAppData();

  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: 'S. Rajasekaran',
    mobile: '9840933221',
    insuranceCompany: 'HDFC ERGO',
    companyId: 'hdfc_ergo',
    policyType: 'Motor',
    policyNo: 'POL-2024-8842',
    vehicleNo: 'TN 10 AP 5432',
    incidentDate: new Date().toISOString().split('T')[0],
    claimType: 'motor-accident',
    estimatedLoss: '35000',
    incidentDescription: 'Front collision with divider. Bumper, radiator and left fender damaged.'
  });

  // Attached files state (Section 3a)
  // Each file: { id, file, name, size, type, docType, previewUrl }
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Confirmation State (Section 3c)
  const [submittedClaim, setSubmittedClaim] = useState(null);

  // Reset form when modal closes or opens fresh
  useEffect(() => {
    if (!isOpen) {
      setSubmittedClaim(null);
      setErrors({});
      setFileErrors([]);
    }
  }, [isOpen]);

  // Dynamic document options based on Policy Type & Claim Type
  const docTypeOptions = React.useMemo(() => {
    const key = normalizeClaimType(formData.claimType, formData.policyType);
    const list = DYNAMIC_CHECKLIST_CONFIG[key] || DYNAMIC_CHECKLIST_CONFIG['motor-accident'];
    return [...list.map((item) => item.name), 'Other'];
  }, [formData.claimType, formData.policyType]);

  // Auto-suggest document type based on file name
  const autoSuggestDocType = (fileName, availableOptions) => {
    const fn = (fileName || '').toLowerCase();
    if (fn.includes('rc') || fn.includes('registration')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('rc'));
      if (match) return match;
    }
    if (fn.includes('license') || fn.includes('licence') || fn.includes('dl')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('licence') || o.toLowerCase().includes('license'));
      if (match) return match;
    }
    if (fn.includes('photo') || fn.includes('damage') || fn.includes('spot')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('photo'));
      if (match) return match;
    }
    if (fn.includes('estimate') || fn.includes('quote')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('estimate'));
      if (match) return match;
    }
    if (fn.includes('fir') || fn.includes('police')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('fir'));
      if (match) return match;
    }
    if (fn.includes('discharge') || fn.includes('summary')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('discharge'));
      if (match) return match;
    }
    if (fn.includes('bill') || fn.includes('invoice')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('bill') || o.toLowerCase().includes('invoice'));
      if (match) return match;
    }
    if (fn.includes('card') || fn.includes('health')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('health card'));
      if (match) return match;
    }
    if (fn.includes('claim') || fn.includes('form')) {
      const match = availableOptions.find((o) => o.toLowerCase().includes('claim form'));
      if (match) return match;
    }
    return availableOptions[0] || 'Other';
  };

  const handleSelectPolicy = (polId) => {
    if (!polId) return;
    const pol = (policies || []).find((p) => p.id === polId);
    if (pol) {
      const isHealth = (pol.policyType || '').toLowerCase().includes('health') || (pol.policyType || '').toLowerCase().includes('care');
      setFormData((prev) => ({
        ...prev,
        customerName: pol.clientName || prev.customerName,
        mobile: (pol.phone || prev.mobile).replace(/[^0-9]/g, '').slice(-10),
        policyNo: pol.id,
        policyType: isHealth ? 'Health' : 'Motor',
        claimType: isHealth ? 'health-reimbursement' : 'motor-accident',
        insuranceCompany: pol.preferredInsurer || pol.companyName || prev.insuranceCompany,
        vehicleNo: pol.vehicleNumber || ''
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Switch claimType default when policyType changes
      if (field === 'policyType') {
        if (value === 'Health') {
          updated.claimType = 'health-cashless';
          updated.vehicleNo = '';
        } else {
          updated.claimType = 'motor-accident';
        }
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Handle file additions (Section 3a)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    const maxFiles = 10;

    const newErrors = [];
    const validAdditions = [];

    let currentTotal = attachedFiles.length;

    files.forEach((file) => {
      if (currentTotal >= maxFiles) {
        newErrors.push(`Limit reached: maximum ${maxFiles} files allowed.`);
        return;
      }

      // Check file extension / mime type
      const ext = file.name.split('.').pop().toLowerCase();
      const validExt = ['pdf', 'jpg', 'jpeg', 'png'].includes(ext);
      const validType = allowedTypes.includes(file.type) || validExt;

      if (!validType) {
        newErrors.push(`"${file.name}" rejected: only PDF, JPG, JPEG, and PNG files are accepted.`);
        return;
      }

      // Check size
      if (file.size > maxSizeBytes) {
        newErrors.push(`"${file.name}" rejected: file size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB limit.`);
        return;
      }

      // Create object URL for preview if browser supports
      let previewUrl = null;
      if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
        try {
          previewUrl = window.URL.createObjectURL(file);
        } catch (err) {
          // ignore
        }
      }

      const suggestedType = autoSuggestDocType(file.name, docTypeOptions);

      validAdditions.push({
        id: `reg-file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type || `application/${ext}`,
        docType: suggestedType,
        previewUrl
      });

      currentTotal++;
    });

    setFileErrors(newErrors);
    if (validAdditions.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validAdditions]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles((prev) => {
      const item = prev.find((f) => f.id === fileId);
      if (item?.previewUrl && typeof window !== 'undefined' && window.URL) {
        window.URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleUpdateDocType = (fileId, newType) => {
    setAttachedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, docType: newType } : f))
    );
  };

  // Validate form
  const validateForm = () => {
    const errs = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Customer Name is required.';
    }

    const cleanMobile = formData.mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      errs.mobile = 'Mobile Number must be exactly 10 digits.';
    }

    if (!formData.insuranceCompany.trim()) {
      errs.insuranceCompany = 'Insurance Company is required.';
    }

    if (!formData.policyNo.trim()) {
      errs.policyNo = 'Policy Number is required.';
    }

    if (formData.policyType === 'Motor' && !formData.vehicleNo.trim()) {
      errs.vehicleNo = 'Vehicle Number is mandatory for Motor claims.';
    }

    if (!formData.incidentDate) {
      errs.incidentDate = 'Incident Date is required.';
    } else {
      const incDate = new Date(formData.incidentDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (incDate > today) {
        errs.incidentDate = 'Incident Date cannot be in the future.';
      }
    }

    const lossVal = Number(formData.estimatedLoss);
    if (!formData.estimatedLoss || isNaN(lossVal) || lossVal <= 0) {
      errs.estimatedLoss = 'Please specify a valid amount greater than 0.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Claim (Section 3 & 3a Atomic Save)
  const handleSubmitClaim = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Store file blobs in IndexedDB
      const processedFiles = [];
      for (const item of attachedFiles) {
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        if (item.file) {
          await storeFileBlob(fileId, item.file, {
            name: item.name,
            type: item.type,
            size: item.size
          });
        }
        processedFiles.push({
          fileId,
          name: item.name,
          size: item.size,
          type: item.type,
          docType: item.docType
        });
      }

      // 2. Atomic save to claimsService
      const newClaim = claimsService.createClaim(
        {
          customerName: formData.customerName,
          mobile: formData.mobile,
          insuranceCompany: formData.insuranceCompany,
          policyNo: formData.policyNo,
          policyType: formData.policyType,
          vehicleNo: formData.vehicleNo,
          incidentDate: formData.incidentDate,
          claimType: formData.claimType,
          estimatedLoss: Number(formData.estimatedLoss),
          incidentDescription: formData.incidentDescription,
          settlementTargetDays: 7
        },
        processedFiles
      );

      // Trigger app notifications
      if (addNotification) {
        addNotification(`Claim ${newClaim.claimNo} submitted successfully.`, 'success');
      }

      setSubmittedClaim(newClaim);
    } catch (err) {
      console.error('Failed to submit claim:', err);
      alert(`Submission failed: ${err.message}. Please retry.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedClaim(null);
    setAttachedFiles([]);
    setFileErrors([]);
    setFormData({
      customerName: '',
      mobile: '',
      insuranceCompany: 'HDFC ERGO',
      companyId: 'hdfc_ergo',
      policyType: 'Motor',
      policyNo: '',
      vehicleNo: '',
      incidentDate: new Date().toISOString().split('T')[0],
      claimType: 'motor-accident',
      estimatedLoss: '',
      incidentDescription: ''
    });
  };

  const handleViewClaim = () => {
    if (submittedClaim) {
      if (setSelectedClaimId) setSelectedClaimId(submittedClaim.claimNo);
      if (setActiveTab) setActiveTab('claims');
      onClose();
    }
  };

  // Section 3c: Success Confirmation Screen
  if (submittedClaim) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Claim Registered Successfully"
        subtitle="Operational Docket Created"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-black text-slate-900">
              Claim submitted successfully!
            </h3>
            <p className="text-xs text-slate-600">
              Claim <span className="font-mono font-bold text-blue-700">{submittedClaim.claimNo}</span> has been registered into the 4-Stage settlement pipeline.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-xs space-y-1.5 max-w-sm mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{submittedClaim.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Policy:</span>
              <span className="font-mono font-bold text-slate-900">{submittedClaim.policyNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Internal Settlement Target:</span>
              <span className="font-mono font-bold text-emerald-700">{submittedClaim.settlementTargetDate} (7 Days)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Attached Documents:</span>
              <span className="font-bold text-slate-800">{attachedFiles.length} file(s) uploaded</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              className="w-full sm:w-auto cursor-pointer"
            >
              Register Another Claim
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleViewClaim}
              className="w-full sm:w-auto bg-[#1E4E8C] hover:bg-[#0B1E3D] text-white font-bold cursor-pointer"
            >
              View Claim Docket →
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Claim"
      subtitle="4-Stage Fast-Track Settlement Docket Registration"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            onClick={handleSubmitClaim}
            disabled={isSubmitting}
            className="bg-[#1E4E8C] hover:bg-[#0B1E3D] text-white font-bold cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Saving Claim...' : 'Submit Claim'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
        {/* Optional Policy Quick Select */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Autofill from Existing Policy (Optional)
          </label>
          <select
            defaultValue=""
            onChange={(e) => handleSelectPolicy(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose active policy to auto-populate customer details --</option>
            {(policies || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} - {p.clientName} ({p.policyType})
              </option>
            ))}
          </select>
        </div>

        {/* 1. Customer Details */}
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            Customer Particulars
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="e.g. S. Rajasekaran"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                  errors.customerName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.customerName && (
                <p className="text-[10px] text-rose-600 mt-0.5">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Number (10 digits) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="9840933221"
                maxLength={10}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                  errors.mobile ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.mobile && (
                <p className="text-[10px] text-rose-600 mt-0.5">{errors.mobile}</p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Policy & Incident Details */}
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            Policy & Coverage Particulars
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Policy Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.policyType}
                onChange={(e) => handleInputChange('policyType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Motor">Motor Insurance</option>
                <option value="Health">Health Insurance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Insurance Carrier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.insuranceCompany}
                onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                placeholder="e.g. HDFC ERGO, Star Health, ICICI Lombard"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                  errors.insuranceCompany ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.insuranceCompany && (
                <p className="text-[10px] text-rose-600 mt-0.5">{errors.insuranceCompany}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Policy Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.policyNo}
                onChange={(e) => handleInputChange('policyNo', e.target.value)}
                placeholder="e.g. POL-2024-8842"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                  errors.policyNo ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.policyNo && (
                <p className="text-[10px] text-rose-600 mt-0.5">{errors.policyNo}</p>
              )}
            </div>

            {formData.policyType === 'Motor' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vehicle Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.vehicleNo}
                  onChange={(e) => handleInputChange('vehicleNo', e.target.value.toUpperCase())}
                  placeholder="e.g. TN 10 AP 5432"
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-mono font-semibold text-slate-900 uppercase focus:ring-2 focus:ring-blue-500 ${
                    errors.vehicleNo ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.vehicleNo && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{errors.vehicleNo}</p>
                )}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Incident Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.incidentDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                  errors.incidentDate ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.incidentDate && (
                <p className="text-[10px] text-rose-600 mt-0.5">{errors.incidentDate}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Claim Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.claimType}
                onChange={(e) => handleInputChange('claimType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500"
              >
                {formData.policyType === 'Motor' ? (
                  <>
                    <option value="motor-accident">Own Damage / Accidental Collision</option>
                    <option value="motor-theft">Total Theft / Stolen Vehicle</option>
                  </>
                ) : (
                  <>
                    <option value="health-cashless">Cashless Hospitalisation (Pre-Auth)</option>
                    <option value="health-reimbursement">Medical Reimbursement Claim</option>
                  </>
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                {formData.claimType === 'health-cashless'
                  ? 'Pre-authorisation Amount (₹)'
                  : 'Estimated Loss / Claim Amount (₹)'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.estimatedLoss}
                onChange={(e) => handleInputChange('estimatedLoss', e.target.value)}
                placeholder="e.g. 35000"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                  errors.estimatedLoss ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.estimatedLoss && (
                <p className="text-[10px] text-rose-600 mt-0.5">{errors.estimatedLoss}</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Incident Description */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Incident Description & Circumstances
          </label>
          <textarea
            rows={2}
            value={formData.incidentDescription}
            onChange={(e) => handleInputChange('incidentDescription', e.target.value)}
            placeholder="Briefly describe what happened, damage sustained, or medical condition..."
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 4. OPTIONAL ATTACHMENTS SECTION (Section 3a) */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-bold text-slate-800 text-xs">
                Documents / Attachments
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                Optional
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              PDF, JPG, PNG &bull; Max 5 MB each &bull; Max 10 files
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 border border-dashed border-blue-300 hover:border-blue-500 rounded-lg bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Select Files to Attach (or drag & drop)</span>
          </button>

          {/* Inline Rejected Files Messages */}
          {fileErrors.length > 0 && (
            <div className="space-y-1">
              {fileErrors.map((errMsg, errIdx) => (
                <div key={errIdx} className="p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errMsg}</span>
                </div>
              ))}
            </div>
          )}

          {/* Attached Files List */}
          {attachedFiles.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Selected Attachments ({attachedFiles.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {attachedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 block truncate text-xs">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(item.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Document Type Dropdown */}
                      <select
                        value={item.docType}
                        onChange={(e) => handleUpdateDocType(item.id, e.target.value)}
                        className="px-2 py-1 text-[11px] border border-slate-300 rounded bg-white text-slate-800 font-medium focus:ring-1 focus:ring-blue-500"
                      >
                        {docTypeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SLA Information Box */}
        <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Internal Settlement Target: <strong className="text-slate-900">7 Days SLA</strong>
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Auto-calculated upon submission</span>
        </div>
      </form>
    </Modal>
  );
}

export default RegisterNewClaimModal;
