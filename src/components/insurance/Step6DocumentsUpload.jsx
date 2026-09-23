import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Trash2
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export function Step6DocumentsUpload({
  insuranceCategory,
  selectedQuote,
  documents,
  setDocuments,
  onNext,
  onPrev
}) {
  const [uploadingDocId, setUploadingDocId] = useState(null);

  const motorChecklist = [
    {
      id: 'doc_rc',
      title: 'Vehicle Registration Certificate (RC Book)',
      desc: 'Front and back scan showing chassis number and owner name',
      mandatory: true
    },
    {
      id: 'doc_prev_policy',
      title: 'Previous Year Policy Schedule',
      desc: 'Required for 25% NCB bonus discount verification',
      mandatory: true
    },
    {
      id: 'doc_kyc_pan',
      title: 'Proposer PAN & Aadhaar Card',
      desc: 'Mandatory IRDAI e-KYC compliance documents',
      mandatory: true
    },
    {
      id: 'doc_inspection',
      title: 'Inspection Report & 4-Side Photos',
      desc: 'Required if vehicle had a break in insurance (>90 days)',
      mandatory: false
    }
  ];

  const healthChecklist = [
    {
      id: 'doc_proposal',
      title: 'Signed Digital Proposal Form',
      desc: 'Proposer declaration with agent counter-signature',
      mandatory: true
    },
    {
      id: 'doc_health_kyc',
      title: 'Proposer & Insured Members KYC (Aadhaar / PAN)',
      desc: 'Identity and address proof for all enrolled family lives',
      mandatory: true
    },
    {
      id: 'doc_ppmc',
      title: 'Pre-Policy Medical Checkup (PPMC) Reports',
      desc: 'Mandatory for members aged >45 or Sum Insured ≥ ₹25 Lakhs',
      mandatory: false
    },
    {
      id: 'doc_ped_discharge',
      title: 'Medical Discharge / Investigation Summaries',
      desc: 'Required if Pre-Existing Disease (PED) is declared',
      mandatory: false
    }
  ];

  const checklist = insuranceCategory === 'MOTOR' ? motorChecklist : healthChecklist;

  const handleSimulateUpload = (docId) => {
    setUploadingDocId(docId);
    setTimeout(() => {
      setDocuments((prev) => ({
        ...prev,
        [docId]: {
          uploaded: true,
          fileName: `${docId.toUpperCase()}_SCAN_${Math.floor(1000 + Math.random() * 9000)}.pdf`,
          size: '1.8 MB',
          uploadedAt: new Date().toLocaleTimeString(),
          status: 'VERIFIED'
        }
      }));
      setUploadingDocId(null);
    }, 400);
  };

  const handleVerifyAll = () => {
    const verified = {};
    checklist.forEach((item) => {
      verified[item.id] = {
        uploaded: true,
        fileName: `${item.id.toUpperCase()}_SIGNED.pdf`,
        size: '2.1 MB',
        uploadedAt: new Date().toLocaleTimeString(),
        status: 'VERIFIED'
      };
    });
    setDocuments(verified);
  };

  const handleRemove = (docId) => {
    setDocuments((prev) => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  const mandatoryCount = checklist.filter((item) => item.mandatory).length;
  const uploadedMandatoryCount = checklist.filter(
    (item) => item.mandatory && documents[item.id]?.uploaded
  ).length;
  const isAllMandatoryUploaded = uploadedMandatoryCount >= mandatoryCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Document Checklist & IRDAI KYC Verification
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isAllMandatoryUploaded
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {uploadedMandatoryCount} of {mandatoryCount} Mandatory Uploaded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Carrier underwriting requires verified digital document scans before binding policy with{' '}
            <strong className="text-slate-700">{selectedQuote?.company?.name || 'Selected Insurer'}</strong>.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleVerifyAll}>
          Fast-Track Verify All Documents
        </Button>
      </div>

      {/* Checklist Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklist.map((item) => {
          const doc = documents[item.id];
          const isUploading = uploadingDocId === item.id;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                doc?.uploaded
                  ? 'border-emerald-200 bg-emerald-50/20 shadow-2xs'
                  : item.mandatory
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200 bg-slate-50/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        doc?.uploaded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {doc?.uploaded ? <FileCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  </div>

                  {item.mandatory ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      Mandatory
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
                      Conditional
                    </span>
                  )}
                </div>

                {/* Upload Status Card */}
                {doc?.uploaded ? (
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">{doc.fileName}</p>
                        <p className="text-[10px] text-slate-400">
                          {doc.size} • Verified at {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => handleSimulateUpload(item.id)}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white mt-3"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-indigo-600 block">
                      {isUploading ? 'Uploading & Scanning...' : 'Click to Upload Document'}
                    </span>
                    <span className="text-[10px] text-slate-400">PDF, JPEG, or PNG up to 10MB</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="lg" icon={ArrowLeft} onClick={onPrev}>
          Back to Quote Comparison
        </Button>
        <Button
          variant="primary"
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          disabled={!isAllMandatoryUploaded}
          onClick={onNext}
        >
          Proceed to Step 7: Underwriting Review
        </Button>
      </div>
    </div>
  );
}

export default Step6DocumentsUpload;
