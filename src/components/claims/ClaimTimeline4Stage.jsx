import React, { useState } from 'react';
import {
  FileText,
  Send,
  Search,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

export function ClaimTimeline4Stage({ claim, onAdvanceStage }) {
  const [modalStage, setModalStage] = useState(null);

  const [stage2Form, setStage2Form] = useState({
    insurerRefNo: `HEGO-CLM-${Math.floor(10000 + Math.random() * 90000)}`
  });

  const [stage3Form, setStage3Form] = useState({
    surveyorName: 'Er. R. Sundaralingam (IRDA SLA-8910)',
    surveyorPhone: '+91 94440 22334',
    inspectionDate: new Date().toISOString().split('T')[0],
    notes: 'Damaged panels inspected at authorized workshop. Estimate approved with 10% salvage deduction.'
  });

  const [stage4Form, setStage4Form] = useState({
    status: 'Settled',
    settledAmount: claim.claimAmountRequested ? String(claim.claimAmountRequested - 2500) : '45000',
    bankRefNo: `NEFT-AXIS-${Math.floor(10000000 + Math.random() * 90000000)}`,
    rejectionReason: ''
  });

  const { stageDetails, currentStage } = claim;

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

  const stages = [
    {
      stageNum: 1,
      name: '01 Registered',
      subtitle: 'Docket Created in Broker System',
      icon: FileText,
      isCompleted: currentStage >= 2 || stageDetails.stage1?.completed,
      isActive: currentStage === 1,
      content: (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>Docket Date:</span>
            <span className="font-semibold text-slate-700">{stageDetails.stage1?.date || 'Today'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Status:</span>
            <span className="font-semibold text-emerald-700">Claim Logged</span>
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
                Upload Docs & Submit (Stage 2)
              </Button>
            </div>
          )}
        </div>
      )
    },
    {
      stageNum: 2,
      name: '02 Documents & Insurer Submission',
      subtitle: 'RC, Bills & Estimates Uploaded',
      icon: Send,
      isCompleted: currentStage >= 3 || (currentStage === 2 && stageDetails.stage2?.completed),
      isActive: currentStage === 2,
      content: (
        <div className="space-y-2 text-xs">
          {stageDetails.stage2?.completed || currentStage >= 2 ? (
            <>
              <div className="flex items-center justify-between text-slate-500">
                <span>Insurer Ref No:</span>
                <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  {stageDetails.stage2?.insurerRefNo || 'HEGO-CLM-2024'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Uploaded Checklist:</span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(stageDetails.stage2?.docs || ['RC Book', 'Driving License', 'Damage Photos']).map(
                    (doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-indigo-200/60"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {doc}
                      </span>
                    )
                  )}
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
                    Assign Surveyor & Notes (Stage 3)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">Waiting for Stage 1 completion to send to insurer portal.</p>
          )}
        </div>
      )
    },
    {
      stageNum: 3,
      name: '03 Survey / Review',
      subtitle: 'Surveyor Assigned & Loss Assessed',
      icon: Search,
      isCompleted: currentStage >= 4 || (currentStage === 3 && stageDetails.stage3?.completed),
      isActive: currentStage === 3,
      content: (
        <div className="space-y-2 text-xs">
          {stageDetails.stage3?.completed || currentStage >= 3 ? (
            <>
              <div className="flex items-center justify-between text-slate-500">
                <span>IRDAI Surveyor:</span>
                <span className="font-bold text-slate-800">
                  {stageDetails.stage3?.surveyorName || 'Pending Assignment'}
                </span>
              </div>
              {stageDetails.stage3?.surveyorPhone && (
                <div className="flex items-center justify-between text-slate-500">
                  <span>Contact Phone:</span>
                  <span className="font-mono text-slate-700">{stageDetails.stage3?.surveyorPhone}</span>
                </div>
              )}
              {stageDetails.stage3?.notes && (
                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 mt-1">
                  <span className="font-bold block text-[10px] uppercase text-amber-700">Surveyor Notes:</span>
                  <p className="text-[11px] mt-0.5">{stageDetails.stage3?.notes}</p>
                </div>
              )}
              {currentStage === 3 && (
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => setModalStage(4)}
                  >
                    Record Settlement / Rejection (Stage 4)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">Surveyor will be assigned after insurer registration.</p>
          )}
        </div>
      )
    },
    {
      stageNum: 4,
      name: '04 Settlement / Rejection',
      subtitle: 'Claim Approval & Payment Disbursement',
      icon: CheckCircle2,
      isCompleted: currentStage === 4,
      isActive: currentStage === 4,
      content: (
        <div className="space-y-2 text-xs">
          {currentStage === 4 && stageDetails.stage4.completed ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Final Decision:</span>
                <Badge
                  variant={stageDetails.stage4.status === 'Settled' ? 'success' : 'danger'}
                  size="sm"
                >
                  {stageDetails.stage4.status}
                </Badge>
              </div>
              {stageDetails.stage4.status === 'Settled' ? (
                <>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Approved Claim Amount:</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      ₹{stageDetails.stage4.settledAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Bank UTR Ref No:</span>
                    <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {stageDetails.stage4.bankRefNo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Payout Date:</span>
                    <span className="font-semibold text-slate-700">
                      {stageDetails.stage4.settlementDate}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold text-[10px] uppercase block">Rejection Reason:</span>
                  <p>{stageDetails.stage4.rejectionReason}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">
              Claim is undergoing processing. Final settlement will be credited directly to client account.
            </p>
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
            {claim.claimAmountRequested.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={currentStage === 4 ? 'success' : 'warning'}
            dot
            size="lg"
          >
            Stage {currentStage} of 4: {stages[currentStage - 1].name.replace('Stage ' + currentStage + ': ', '')}
          </Badge>
        </div>
      </div>

      {/* 4-Stage Stepper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((st) => {
          return (
            <div
              key={st.stageNum}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
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
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
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

                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {st.name}
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">{st.subtitle}</p>

                {/* Stage Body */}
                {st.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Advance to Stage 2 */}
      <Modal
        isOpen={modalStage === 2}
        onClose={() => setModalStage(null)}
        title="Forward Claim to Insurer (Stage 2)"
        subtitle="Record Insurance Company Claim Registration Reference Number"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage2}>
              Confirm Submission to Insurer
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage2} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Insurance Partner Company
            </label>
            <input
              type="text"
              readOnly
              value={claim.companyName}
              className="w-full px-3.5 py-2 border rounded-xl bg-slate-100 text-slate-600 font-medium"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Company Claim Registration Reference Number *
            </label>
            <input
              type="text"
              required
              value={stage2Form.insurerRefNo}
              onChange={(e) => setStage2Form({ ...stage2Form, insurerRefNo: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: Advance to Stage 3 */}
      <Modal
        isOpen={modalStage === 3}
        onClose={() => setModalStage(null)}
        title="Assign Surveyor & Enter Inspection Notes (Stage 3)"
        subtitle="Record Surveyor Credentials & Loss Assessment Notes"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage3}>
              Save Inspection Details
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage3} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              IRDA Licensed Surveyor Name *
            </label>
            <input
              type="text"
              required
              value={stage3Form.surveyorName}
              onChange={(e) => setStage3Form({ ...stage3Form, surveyorName: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Surveyor Mobile Number *
            </label>
            <input
              type="text"
              required
              value={stage3Form.surveyorPhone}
              onChange={(e) => setStage3Form({ ...stage3Form, surveyorPhone: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Inspection / Loss Assessment Notes
            </label>
            <textarea
              rows={3}
              value={stage3Form.notes}
              onChange={(e) => setStage3Form({ ...stage3Form, notes: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: Advance to Stage 4 */}
      <Modal
        isOpen={modalStage === 4}
        onClose={() => setModalStage(null)}
        title="Final Claim Decision: Settle or Reject (Stage 4)"
        subtitle="Close Claim with Bank NEFT or Record Rejection Reason"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage4}>
              Submit Final Decision
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage4} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Decision Status
            </label>
            <select
              value={stage4Form.status}
              onChange={(e) => setStage4Form({ ...stage4Form, status: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl bg-white"
            >
              <option value="Settled">Claim Settled (Approved & Paid)</option>
              <option value="Rejected">Claim Rejected by Underwriter</option>
            </select>
          </div>

          {stage4Form.status === 'Settled' ? (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Final Settled Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={stage4Form.settledAmount}
                  onChange={(e) => setStage4Form({ ...stage4Form, settledAmount: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank UTR / Transaction Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={stage4Form.bankRefNo}
                  onChange={(e) => setStage4Form({ ...stage4Form, bankRefNo: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                required
                value={stage4Form.rejectionReason}
                onChange={(e) => setStage4Form({ ...stage4Form, rejectionReason: e.target.value })}
                placeholder="e.g. Non-disclosure of pre-existing condition / Policy expired before incident"
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

export default ClaimTimeline4Stage;
