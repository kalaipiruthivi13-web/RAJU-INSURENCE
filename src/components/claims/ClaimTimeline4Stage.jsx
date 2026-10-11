import React, { useState } from 'react';
import {
  FileText,
  Send,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

export function ClaimTimeline4Stage({ claim, onAdvanceStage }) {
  const [modalStage, setModalStage] = useState(null);
  const [revertModalTarget, setRevertModalTarget] = useState(null);
  const [revertNote, setRevertNote] = useState('');

  const isHealth = (claim.policyType || '').toLowerCase().includes('health');

  const [stage2Form, setStage2Form] = useState({
    insurerRefNo: `HEGO-CLM-${Math.floor(10000 + Math.random() * 90000)}`,
    note: 'Initial documents verified and claim docket submitted to insurer carrier portal.'
  });

  const [stage3Form, setStage3Form] = useState({
    surveyorName: isHealth ? 'N/A (Health Desk Review)' : 'Er. R. Sundaralingam',
    surveyorPhone: isHealth ? '' : '+91 94440 22334',
    inspectionDate: new Date().toISOString().split('T')[0],
    notes: isHealth
      ? 'Medical desk review completed. Physical survey not required for health claim.'
      : 'Damaged panels inspected at authorized workshop. Estimate approved with salvage deduction.'
  });

  const [stage4Form, setStage4Form] = useState({
    status: 'Settled',
    settledAmount: claim.claimAmountRequested ? String(claim.claimAmountRequested - 2500) : '45000',
    bankRefNo: `NEFT-AXIS-${Math.floor(10000000 + Math.random() * 90000000)}`,
    rejectionReason: '',
    note: 'Final settlement sanction completed.'
  });

  const { stageDetails, currentStage } = claim;

  const handleAdvanceToStage2 = (e) => {
    e.preventDefault();
    if (!stage2Form.note || !stage2Form.note.trim()) {
      alert('A required transition note is mandatory to advance stage.');
      return;
    }
    onAdvanceStage(claim.id, 2, stage2Form);
    setModalStage(null);
  };

  const handleAdvanceToStage3 = (e) => {
    e.preventDefault();
    if (!stage3Form.notes || !stage3Form.notes.trim()) {
      alert('A required transition note is mandatory to advance stage.');
      return;
    }
    onAdvanceStage(claim.id, 3, stage3Form);
    setModalStage(null);
  };

  const handleAdvanceToStage4 = (e) => {
    e.preventDefault();
    if (!stage4Form.note || !stage4Form.note.trim()) {
      alert('A required transition note is mandatory to advance stage.');
      return;
    }
    onAdvanceStage(claim.id, 4, stage4Form);
    setModalStage(null);
  };

  const handleConfirmRevert = (e) => {
    e.preventDefault();
    if (!revertNote || !revertNote.trim()) {
      alert('A required transition note is mandatory to revert stage.');
      return;
    }
    onAdvanceStage(claim.id, revertModalTarget, { note: revertNote, notes: revertNote });
    setRevertModalTarget(null);
    setRevertNote('');
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
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ArrowLeft}
                    onClick={() => {
                      setRevertModalTarget(1);
                      setRevertNote('Reverting to Stage 1 for document review.');
                    }}
                  >
                    Revert to Stage 1
                  </Button>
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
      subtitle: isHealth ? 'Medical Desk Review (Physical Survey Optional)' : 'Surveyor Assigned & Loss Assessed',
      icon: Search,
      isCompleted: currentStage >= 4 || (currentStage === 3 && stageDetails.stage3?.completed),
      isActive: currentStage === 3,
      content: (
        <div className="space-y-2 text-xs">
          {stageDetails.stage3?.completed || currentStage >= 3 ? (
            <>
              {isHealth && (
                <div className="p-2 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 text-[11px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Health claim: Survey / Assessment is optional. Stage 3 can proceed without physical inspection.</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-500">
                <span>Surveyor / Assessor:</span>
                <span className="font-bold text-slate-800">
                  {stageDetails.stage3?.surveyorName || (isHealth ? 'Medical Desk Review' : 'Pending Assignment')}
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
                  <span className="font-bold block text-[10px] uppercase text-amber-700">Surveyor / Assessment Notes:</span>
                  <p className="text-[11px] mt-0.5">{stageDetails.stage3?.notes}</p>
                </div>
              )}
              {currentStage === 3 && (
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ArrowLeft}
                    onClick={() => {
                      setRevertModalTarget(2);
                      setRevertNote('Reverting to Stage 2 for insurer resubmission.');
                    }}
                  >
                    Revert to Stage 2
                  </Button>
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
                  {stageDetails.stage4.status} (CLOSED)
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
                      {stageDetails.stage4.bankRefNo || 'NEFT-881239'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold block text-[10px] uppercase">Rejection Reason:</span>
                  <p className="text-xs mt-0.5">{stageDetails.stage4.rejectionReason}</p>
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={() => {
                    setRevertModalTarget(3);
                    setRevertNote('Reopening claim from Stage 4 back to Stage 3 for review.');
                  }}
                >
                  Reopen to Stage 3
                </Button>
              </div>
            </>
          ) : (
            <p className="text-slate-400 italic">Awaiting survey / review clearance for final sanction.</p>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* 4 STAGE HORIZONTAL STEPPER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stages.map((stg) => {
          const Icon = stg.icon;
          return (
            <div
              key={stg.stageNum}
              className={`p-3 rounded-xl border transition-all ${
                stg.isActive
                  ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20'
                  : stg.isCompleted
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      stg.isCompleted
                        ? 'bg-emerald-600 text-white'
                        : stg.isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {stg.isCompleted ? '✓' : stg.stageNum}
                  </div>
                  <span className="font-bold text-slate-900 text-xs">{stg.name}</span>
                </div>
                <Icon
                  className={`w-4 h-4 ${
                    stg.isCompleted
                      ? 'text-emerald-600'
                      : stg.isActive
                      ? 'text-blue-600'
                      : 'text-slate-400'
                  }`}
                />
              </div>

              <p className="text-[10px] text-slate-500 mb-2 leading-tight">{stg.subtitle}</p>
              {stg.content}
            </div>
          );
        })}
      </div>

      {/* MODAL: Advance to Stage 2 */}
      <Modal
        isOpen={modalStage === 2}
        onClose={() => setModalStage(null)}
        title="Insurer Portal Registration (Stage 2)"
        subtitle="Submit intimation to carrier portal and record claim reference"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage2}>
              Save & Advance to Stage 2
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage2} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Carrier Partner</label>
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Stage Transition Note * (Logged in timeline)
            </label>
            <textarea
              rows={2}
              required
              value={stage2Form.note}
              onChange={(e) => setStage2Form({ ...stage2Form, note: e.target.value })}
              placeholder="Enter note for advancing to Stage 2..."
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: Advance to Stage 3 */}
      <Modal
        isOpen={modalStage === 3}
        onClose={() => setModalStage(null)}
        title="Assign Surveyor & Enter Inspection Notes (Stage 3)"
        subtitle={isHealth ? 'Health Policy: Physical survey is optional' : 'Record Surveyor Credentials & Loss Assessment Notes'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalStage(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAdvanceToStage3}>
              Save & Advance to Stage 3
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdvanceToStage3} className="space-y-4 text-xs">
          {isHealth && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
              <span className="font-bold block">Optional Survey for Health:</span>
              <p className="text-[11px] mt-0.5">
                Physical survey is optional for health policies. You can proceed directly with medical desk assessment notes.
              </p>
            </div>
          )}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isHealth ? 'Assessor / Surveyor Name (Optional for Health)' : 'Surveyor Name *'}
            </label>
            <input
              type="text"
              required={!isHealth}
              value={stage3Form.surveyorName}
              onChange={(e) => setStage3Form({ ...stage3Form, surveyorName: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Surveyor Contact Phone
            </label>
            <input
              type="text"
              value={stage3Form.surveyorPhone}
              onChange={(e) => setStage3Form({ ...stage3Form, surveyorPhone: e.target.value })}
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Inspection / Assessment Note * (Logged in timeline)
            </label>
            <textarea
              rows={3}
              required
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
            <label className="block font-semibold text-slate-700 mb-1">Decision Status</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Final Settled Amount (₹) *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Reason for Rejection *</label>
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transition Note * (Logged in timeline)
            </label>
            <textarea
              rows={2}
              required
              value={stage4Form.note}
              onChange={(e) => setStage4Form({ ...stage4Form, note: e.target.value })}
              placeholder="Enter note for closing claim..."
              className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: Revert Stage (Back Button) */}
      {revertModalTarget !== null && (
        <Modal
          isOpen={revertModalTarget !== null}
          onClose={() => setRevertModalTarget(null)}
          title={`Revert Claim to Stage 0${revertModalTarget}`}
          subtitle="Mandatory reason/note required to revert claim stage"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setRevertModalTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmRevert} className="bg-amber-600 hover:bg-amber-700 text-white">
                Confirm Revert
              </Button>
            </>
          }
        >
          <form onSubmit={handleConfirmRevert} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              <span className="font-bold block">Stage Reversal Audit</span>
              <p className="text-[11px] mt-0.5">
                Moving claim from Stage {currentStage} back to Stage {revertModalTarget}. This note will be recorded in the audit trail.
              </p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason / Note for Reverting Stage *
              </label>
              <textarea
                rows={3}
                required
                value={revertNote}
                onChange={(e) => setRevertNote(e.target.value)}
                placeholder="e.g. Additional documents required from insured; reopening survey."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ClaimTimeline4Stage;
