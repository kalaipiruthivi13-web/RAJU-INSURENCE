import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  User
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useAppData } from '../../context/AppDataContext';

export function RegisterNewClaimModal({ isOpen, onClose }) {
  const { partners, addClaim } = useAppData();

  // Form State
  const [formData, setFormData] = useState({
    clientName: 'S. Rajasekaran',
    phone: '+91 98409 33221',
    companyId: 'hdfc_ergo',
    policyNumber: 'POL-2024-8842',
    policyType: 'Motor Comprehensive (Private Car)',
    vehicleNumber: 'TN 10 AP 5432',
    incidentDate: new Date().toISOString().split('T')[0],
    claimType: 'Own Damage (Accidental Collision)',
    claimAmountRequested: '35000',
    incidentLocation: 'Poonamallee High Road, Chennai',
    incidentDescription: 'Front collision with divider. Bumper, radiator and left fender damaged.',
    settlementTargetDays: '7'
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitClaim = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.phone || !formData.claimAmountRequested) {
      alert('Please fill Customer Name, Mobile Number, and Estimated Loss amount.');
      return;
    }

    const partner = partners.find((p) => p.id === formData.companyId);
    const days = Number(formData.settlementTargetDays) || 7;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    const calculatedDueDate = dueDate.toISOString().split('T')[0];

    addClaim({
      ...formData,
      companyName: partner ? partner.shortName : 'HDFC ERGO',
      claimAmountRequested: Number(formData.claimAmountRequested) || 35000,
      settlementDueDate: calculatedDueDate,
      settlementStatus: `Due in ${days} days`,
      attachments: [] // Documents can be uploaded later from Claim Details -> Documents
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Claim"
      subtitle="4-Stage IRDAI Fast-Track Settlement Docket Registration"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            onClick={handleSubmitClaim}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold cursor-pointer"
          >
            Submit Claim
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
        {/* Document policy banner */}
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold">No mandatory attachments required:</span> Supporting documents (RC book, repair estimate, spot photos) can be uploaded anytime after registration from <span className="font-semibold">Claim Details → Documents</span>.
          </div>
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
                Customer Name
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="e.g. S. Rajasekaran"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-xs font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98409 33221"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-xs font-semibold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 2. Policy & Vehicle Details */}
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            Policy & Asset Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Insurance Carrier
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => handleInputChange('companyId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] text-xs font-semibold text-slate-900"
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Policy Type / Product
              </label>
              <select
                value={formData.policyType}
                onChange={(e) => handleInputChange('policyType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] text-xs font-semibold text-slate-900"
              >
                <option value="Motor Comprehensive (Private Car)">Motor Comprehensive (Car)</option>
                <option value="Two Wheeler Package Policy">Two Wheeler Package Policy</option>
                <option value="Commercial Goods Vehicle">Commercial Goods Vehicle</option>
                <option value="Family Health Optima">Family Health Mediclaim</option>
                <option value="Senior Citizen Red Carpet">Senior Citizen Red Carpet</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vehicle Registration No
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                placeholder="TN 10 AP 5432"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-xs font-mono font-bold text-slate-900 uppercase"
              />
            </div>
          </div>
        </div>

        {/* 3. Incident Details */}
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Incident & Claim Specifics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Incident Date
              </label>
              <input
                type="date"
                required
                value={formData.incidentDate}
                onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Claim Type
              </label>
              <select
                value={formData.claimType}
                onChange={(e) => handleInputChange('claimType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] text-xs font-semibold text-slate-900"
              >
                <option value="Own Damage (Accidental Collision)">Own Damage (Accident / Collision)</option>
                <option value="Third Party Liability">Third Party Liability</option>
                <option value="Total Loss / Theft">Theft / Total Loss</option>
                <option value="Glass / Windshield Claim">Glass / Windshield Replacement</option>
                <option value="Health Cashless Hospitalization">Health Cashless Hospitalization</option>
                <option value="Health Reimbursement">Health Reimbursement</option>
                <option value="Flood / Storm / Natural Calamity">Natural Calamity / Flood</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Loss (₹)
              </label>
              <input
                type="number"
                required
                value={formData.claimAmountRequested}
                onChange={(e) => handleInputChange('claimAmountRequested', e.target.value)}
                placeholder="e.g. 35000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 4. Incident Description & Settlement SLA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Incident Description
            </label>
            <textarea
              rows={2}
              value={formData.incidentDescription}
              onChange={(e) => handleInputChange('incidentDescription', e.target.value)}
              placeholder="Describe spot collision details, damaged parts, workshop location..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563EB] text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Settlement SLA Target
            </label>
            <select
              value={formData.settlementTargetDays}
              onChange={(e) => handleInputChange('settlementTargetDays', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] text-xs font-bold text-slate-900"
            >
              <option value="3">3 Days (Fast-Track Express)</option>
              <option value="7">7 Days (Standard IRDAI Target)</option>
              <option value="14">14 Days (Commercial / Survey)</option>
            </select>
            <span className="text-[10px] text-slate-400 block mt-1">
              Auto-tracked in 7-Day Settlement Alert
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default RegisterNewClaimModal;
