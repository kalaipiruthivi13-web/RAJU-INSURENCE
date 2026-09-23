import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Send,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

export function ClaimTimeline5Stage({ claim, onAdvanceStage }) {
  const [modalStage, setModalStage] = useState(null);

  // Modal form states
  const [stage2Form, setStage2Form] = useState({
    docs: ['RC Book Copy', 'Driving License', 'Damage Photos (4)', 'Repair Estimate']
  });

  const [stage3Form, setStage3Form] = useState({
    insurerRefNo: `HEGO-CLM-${Math.floor(10000 + Math.random() * 90000)}`
  });

  const [stage4Form, setStage4Form] = useState({
    surveyorName: 'Er. R. Sundaralingam (IRDA SLA-8910)',
    surveyorPhone: '+91 94440 22334',
    inspectionDate: new Date().toISOString().split('T')[0],
    notes: 'Damaged panels inspected at authorized workshop. Estimate approved with 10% salvage deduction.'
  });

  const [stage5Form, setStage5Form] = useState({
    status: 'Settled',
    settledAmount: claim.claimAmountRequested ? String(claim.claimAmountRequested - 2500) : '45000',
    bankRefNo: `NEFT-AXIS-${Math.floor(10000000 + Math.random() * 90000000)}`,
    rejectionReason: ''
  });

  const stageDetails = claim.stageDetails || {};
  const currentStage = claim.currentStage || 1;

  const handleAdvanceToStage2 = (e) => {
    e.preventDefault();
    onAdvanceStage(claim.id, 2, stage2Form);
    setModalStage(null);
  };

  const handleAdvanceToStage3 = (e) => {
    e.preventDefault();
    onAdvanceStage(claim.id, 3, stage3Form);
    setModalStage(null);
  };

  const handleAdvanceToStage4 = (e) => {
    e.preventDefault();
    onAdvanceStage(claim.id, 4, stage4Form);
    setModalStage(null);
  };

  const handleAdvanceToStage5 = (e) => {
    e.preventDefault();
    onAdvanceStage(claim.id, 5, stage5Form);
    setModalStage(null);
  };

  const stages = [
    {
      stageNum: 1,
      name: 'Stage 1: Registered',
      subtitle: 'Docket Initialized in RAJU VENDOR',
      icon: FileText,
      isCompleted: currentStage >= 2 || (stageDetails.stage1 && stageDetails.stage1.completed),
      isActive: currentStage === 1,
      content: (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>Docket Date:</span>
            <span className="font-semibold text-slate-700">
              {stageDetails.stage1?.date || claim.incidentDate || 'Today'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Logged By:</span>
            <span className="font-semibold text-slate-700">Broker Office</span>
          </div>
          {currentStage === 1 && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => setModalStage(2)}
              >
                Upload Docs (Stage 2)
              </Button>
            </div>
          )}
        </div>
      )
    },
    {
      stageNum: 2,
      name: 'Stage 2: Docs Uploaded',
      subtitle: 'Checklist Verification',
      icon: UploadCloud,
      isCompleted: currentStage >= 3 || (stageDetails.stage2 && stageDetails.stage2.completed),
      isActive: currentStage === 2,
      content: (
        <div className="space-y-2 text-xs">
          {stageDetails.stage2?.completed || currentStage >= 2 ? (
            <>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Uploaded Documents:</span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(stageDetails.stage2?.docs || ['RC Book', 'DL Copy', 'Estimate']).map((d, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-indigo-200/60"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              {currentStage === 2 && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => setModalStage(3)}
                  >
                    Forward to Carrier (Stage 3)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">Awaiting document upload & KYC verification.</p>
          )}
        </div>
      )
    },
    {
      stageNum: 3,
      name: 'Stage 3: Insurer Review',
      subtitle: 'Carrier Portal Registration',
      icon: Send,
      isCompleted: currentStage >= 4 || (stageDetails.stage3 && stageDetails.stage3.completed),
      isActive: currentStage === 3,
      content: (
        <div className="space-y-2 text-xs">
          {stageDetails.stage3?.completed || currentStage >= 3 ? (
            <>
              <div className="flex items-center justify-between text-slate-500">
                <span>Insurer Ref No:</span>
                <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  {stageDetails.stage3?.insurerRefNo || 'HEGO-CLM-99120'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Portal Status:</span>
                <span className="text-emerald-700 font-semibold">
                  {stageDetails.stage3?.portalSubmissionStatus || 'Under Review'}
                </span>
              </div>
              {currentStage === 3 && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => setModalStage(4)}
                  >
                    Assign Surveyor (Stage 4)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">Will be forwarded to carrier portal after docs clearance.</p>
          )}
        </div>
      )
    },
    {
      stageNum: 4,
      name: 'Stage 4: Survey Assigned',
      subtitle: 'IRDA Surveyor Assessment',
      icon: Search,
      isCompleted: currentStage >= 5 || (stageDetails.stage4 && stageDetails.stage4.completed),
      isActive: currentStage === 4,
      content: (
        <div className="space-y-2 text-xs">
          {stageDetails.stage4?.completed || currentStage >= 4 ? (
            <>
              <div className="flex items-center justify-between text-slate-500">
                <span>IRDA Surveyor:</span>
                <span className="font-bold text-slate-800">
                  {stageDetails.stage4?.surveyorName || 'Er. M. Saravanan'}
                </span>
              </div>
              {stageDetails.stage4?.notes && (
                <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 mt-1">
                  <span className="font-bold block text-[10px] uppercase text-amber-700">Surveyor Note:</span>
                  <p className="text-[11px] mt-0.5">{stageDetails.stage4.notes}</p>
                </div>
              )}
              {currentStage === 4 && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => setModalStage(5)}
                  >
                    Record Settlement (Stage 5)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">Surveyor will be appointed once carrier docket clears.</p>
          )}
        </div>
      )
    },
    {
      stageNum: 5,
      name: 'Stage 5: Settlement',
      subtitle: 'Bank Payout & Closeout',
      icon: CheckCircle2,
      isCompleted: currentStage === 5 && stageDetails.stage5?.completed,
      isActive: currentStage === 5,
      content: (
        <div className="space-y-2 text-xs">
          {currentStage === 5 && stageDetails.stage5?.completed ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Decision:</span>
                <Badge
                  variant={stageDetails.stage5?.status === 'Settled' ? 'success' : 'danger'}
                  size="sm"
                >
                  {stageDetails.stage5?.status}
                </Badge>
              </div>
              {stageDetails.stage5?.status === 'Settled' ? (
                <>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Settled Amount:</span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      ₹{Number(stageDetails.stage5?.settledAmount || 45000).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Bank UTR:</span>
                    <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                      {stageDetails.stage5?.bankRefNo}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold text-[10px] uppercase block">Rejection Reason:</span>
                  <p>{stageDetails.stage5?.rejectionReason}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">Final NEFT credit / underwriting closeout pending.</p>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/60">
              {claim.id}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-700">{claim.companyName}</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-1">
            {claim.clientName} - {claim.vehicleNumber || claim.policyType}
          </h3>
          <p className="text-xs text-slate-500">
            Incident Date: {claim.incidentDate} • Claim Amount Requested: ₹
            {(claim.claimAmountRequested || 48000).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={currentStage === 5 ? 'success' : 'warning'}
            dot
            size="lg"
          >
            Stage {currentStage} of 5: {stages[currentStage - 1].name.replace('Stage ' + currentStage + ': ', '')}
          </Badge>
        </div>
      </div>

      {/* 5-Stage Stepper Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {stages.map((st) => (
          <div
            key={st.stageNum}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              st.isActive
                ? 'border-indigo-600 bg-gradient-to-tr from-blue-50/40 to-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20'
                : st.isCompleted
                ? 'border-emerald-200 bg-emerald-50/30'
                : 'border-slate-200 bg-slate-50/50 opacity-70'
            }`}
          >
            <div>
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    st.isCompleted
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-xs'
                      : st.isActive
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {st.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.stageNum}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Step {st.stageNum}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-tight">{st.name}</h4>
              <p className="text-[10px] text-slate-400 mb-2.5">{st.subtitle}</p>

              {/* Stage Body */}
              {st.content}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Advance to Stage 2 (Docs Uploaded) */}
      <Modal
        isOpen={modalStage === 2}
        onClose={() => setModalStage(null)}
        title="Upload & Verify Claim Documents (Stage 2)"
        subtitle="Confirm KYC and damage assessment evidence"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage2}>
              Confirm Documents Verified
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage2} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Select verified documents to attach to claim docket <strong>{claim.id}</strong>:
          </p>
          <div className="space-y-2">
            {['RC Book Copy', 'Driving License', 'Damage Photos (4)', 'Repair Estimate', 'Police FIR / CSR'].map(
              (doc, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50">
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600 w-4 h-4" />
                  <span className="font-semibold text-slate-700">{doc}</span>
                </label>
              )
            )}
          </div>
        </form>
      </Modal>

      {/* MODAL: Advance to Stage 3 (Insurer Review) */}
      <Modal
        isOpen={modalStage === 3}
        onClose={() => setModalStage(null)}
        title="Submit Claim to Carrier Portal (Stage 3)"
        subtitle="Record Insurance Company Claim Registration Reference Number"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage3}>
              Confirm Submission to Carrier
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage3} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Carrier Name</label>
            <input
              type="text"
              readOnly
              value={claim.companyName}
              className="w-full px-3 py-2 border rounded-xl bg-slate-100 text-slate-600 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Carrier Claim Reference Number *
            </label>
            <input
              type="text"
              required
              value={stage3Form.insurerRefNo}
              onChange={(e) => setStage3Form({ ...stage3Form, insurerRefNo: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: Advance to Stage 4 (Survey Assigned) */}
      <Modal
        isOpen={modalStage === 4}
        onClose={() => setModalStage(null)}
        title="Assign IRDA Licensed Surveyor (Stage 4)"
        subtitle="Record Surveyor Details & Loss Assessment Notes"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage4}>
              Save Inspection Details
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage4} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              IRDA Licensed Surveyor Name *
            </label>
            <input
              type="text"
              required
              value={stage4Form.surveyorName}
              onChange={(e) => setStage4Form({ ...stage4Form, surveyorName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Surveyor Phone *</label>
            <input
              type="text"
              required
              value={stage4Form.surveyorPhone}
              onChange={(e) => setStage4Form({ ...stage4Form, surveyorPhone: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Inspection Notes</label>
            <textarea
              rows={3}
              value={stage4Form.notes}
              onChange={(e) => setStage4Form({ ...stage4Form, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: Advance to Stage 5 (Settlement) */}
      <Modal
        isOpen={modalStage === 5}
        onClose={() => setModalStage(null)}
        title="Final Claim Settlement / Rejection (Stage 5)"
        subtitle="Record Approved Claim Payout and Bank UTR"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage5}>
              Submit Final Settlement
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage5} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Decision Status</label>
            <select
              value={stage5Form.status}
              onChange={(e) => setStage5Form({ ...stage5Form, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl bg-white"
            >
              <option value="Settled">Claim Settled (Approved & Paid)</option>
              <option value="Rejected">Claim Rejected by Underwriter</option>
            </select>
          </div>

          {stage5Form.status === 'Settled' ? (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Final Settled Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={stage5Form.settledAmount}
                  onChange={(e) => setStage5Form({ ...stage5Form, settledAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank UTR / Transaction Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={stage5Form.bankRefNo}
                  onChange={(e) => setStage5Form({ ...stage5Form, bankRefNo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Rejection *</label>
              <textarea
                rows={3}
                required
                value={stage5Form.rejectionReason}
                onChange={(e) => setStage5Form({ ...stage5Form, rejectionReason: e.target.value })}
                placeholder="e.g. Non-disclosure of pre-existing condition"
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default ClaimTimeline5Stage;
