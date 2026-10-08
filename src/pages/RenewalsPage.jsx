import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  RotateCcw,
  Copy,
  Receipt,
  Eye,
  Image as ImageIcon,
  ArrowUp,
  FileText,
  Layers,
  Quote,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  X
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import OperationsSubNavBar from '../components/layout/OperationsSubNavBar';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

export function RenewalsPage() {
  const {
    policies,
    renewPolicy,
    partners,
    globalSearch,
    setGlobalSearch,
    addNotification,
    checkPolicyClaimStatus,
    navigateToClaim
  } = useAppData();

  // Search Mode & Inputs matching Screenshot 1
  const [searchPill, setSearchPill] = useState('POLICY_QUOTE'); // 'POLICY_QUOTE' | 'PRODUCT'
  const [searchInputValue, setSearchInputValue] = useState('');
  const [selectedPolicyForRenew, setSelectedPolicyForRenew] = useState(null);
  const [unresolvedClaimWarning, setUnresolvedClaimWarning] = useState(null);
  const [showCollectModal, setShowCollectModal] = useState(null);
  const [showPhotosModal, setShowPhotosModal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(null);

  const [renewalForm, setRenewalForm] = useState({
    targetCompanyId: '',
    newExpiryDate: ''
  });

  // Map policies to renewal records matching enterprise format and clear standardized statuses
  const renewalRecords = useMemo(() => {
    return policies.map((p, index) => {
      // Deterministic 20-digit policy and quote number for enterprise lookup
      const baseNum = 71300431250300000000 + (index + 2474);
      const quoteNum = 7130042610000000 + (index + 4375);

      const expDate = new Date(p.expiryDate);
      const today = new Date();
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isExpired = diffDays < 0;

      // Clear standardized renewal statuses
      let statusLabel = 'Active';
      let quoteStatus = 'Renewal In Progress';

      if (p.status === 'Renewed') {
        statusLabel = 'Renewed';
        quoteStatus = 'Bound';
      } else if (p.status === 'Renewal In Progress') {
        statusLabel = 'Renewal In Progress';
        quoteStatus = 'Draft Underwriting';
      } else if (isExpired) {
        statusLabel = 'Expired';
        quoteStatus = 'Renewal In Progress';
      } else if (diffDays <= 30) {
        statusLabel = 'Expiring Soon';
        quoteStatus = 'Renewal In Progress';
      } else {
        statusLabel = 'Active';
        quoteStatus = 'Not Due';
      }

      return {
        sNo: index + 1,
        id: p.id,
        oldPolicyNo: `${baseNum}`,
        renewedQuoteNo: `${quoteNum}`,
        policyHolder: (p.clientName || 'KRISHNA KUMAR S').toUpperCase(),
        phone: p.phone || '+91 94440 12345',
        email: p.email || 'customer@rajuvendor.in',
        vehicleNumber: p.vehicleNumber || 'TN 09 BX 4512',
        productName: p.policyType || 'Motor Comprehensive',
        companyName: p.companyName || 'HDFC ERGO',
        startDate: p.issueDate ? p.issueDate.split('-').reverse().join('/') : '25/08/2026',
        expiryDate: p.expiryDate ? p.expiryDate.split('-').reverse().join('/') : '24/08/2026',
        policyStatus: statusLabel,
        renewedQuoteStatus: quoteStatus,
        premium: p.premium || 14250,
        originalPolicy: p
      };
    });
  }, [policies]);

  // Filter based on multi-parameter search input
  const filteredRecords = useMemo(() => {
    let list = renewalRecords;
    const term = (searchInputValue || globalSearch || '').trim().toLowerCase();

    if (term) {
      list = list.filter((r) => {
        return (
          r.oldPolicyNo.toLowerCase().includes(term) ||
          r.renewedQuoteNo.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term) ||
          r.policyHolder.toLowerCase().includes(term) ||
          (r.phone && r.phone.toLowerCase().includes(term)) ||
          (r.email && r.email.toLowerCase().includes(term)) ||
          (r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(term)) ||
          r.productName.toLowerCase().includes(term) ||
          r.companyName.toLowerCase().includes(term)
        );
      });
    }

    return list;
  }, [renewalRecords, searchInputValue, globalSearch]);

  const handleReset = () => {
    setSearchInputValue('');
    if (setGlobalSearch) setGlobalSearch('');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
  };

  const openRenewModal = (record) => {
    // Underwriting Check: Claim Check Before Renewal
    const claimCheck = checkPolicyClaimStatus ? checkPolicyClaimStatus(record.originalPolicy.id) : { hasUnresolvedClaim: false };
    if (claimCheck.hasUnresolvedClaim) {
      setUnresolvedClaimWarning({
        policy: record.originalPolicy,
        record,
        claim: claimCheck.claim
      });
      return;
    }

    setSelectedPolicyForRenew(record.originalPolicy);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setRenewalForm({
      targetCompanyId: record.originalPolicy.companyId,
      newExpiryDate: nextYear.toISOString().split('T')[0]
    });
  };

  const handleExecuteRenewal = (e) => {
    e.preventDefault();
    if (!selectedPolicyForRenew) return;

    renewPolicy(selectedPolicyForRenew.id, {
      newExpiryDate: renewalForm.newExpiryDate,
      newCompanyId: renewalForm.targetCompanyId || selectedPolicyForRenew.companyId
    });
    addNotification(`Policy ${selectedPolicyForRenew.id} renewed successfully!`, 'success');
    setSelectedPolicyForRenew(null);
  };

  const handleClone = (record) => {
    addNotification(`Quote ${record.renewedQuoteNo} cloned successfully into new renewal draft.`, 'info');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 pb-8">
      {/* 1. Top Operations Sub-Navigation Bar matching Screenshot 1 */}
      <OperationsSubNavBar activeItem="renewals" />

      {/* 2. Main Search & Action Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        {/* Segmented Pill Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setSearchPill('POLICY_QUOTE')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                searchPill === 'POLICY_QUOTE'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Renewal Quote No. / Old Policy No.</span>
            </button>

            <button
              type="button"
              onClick={() => setSearchPill('PRODUCT')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                searchPill === 'PRODUCT'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Search by Product Name</span>
            </button>
          </div>
        </div>

        {/* Search Input & Action Buttons */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {searchPill === 'POLICY_QUOTE'
                ? 'Renewal Quote No. / Old Policy No.'
                : 'Search by Product Name'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                placeholder="Search by Policy No, Quote No, Customer, Mobile, Email, Vehicle Reg..."
                className="w-full px-3 py-2 pr-8 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {searchInputValue && (
                <button
                  type="button"
                  onClick={() => setSearchInputValue('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 border border-blue-400 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 border border-blue-400 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* 3. Enterprise Results Table matching Screenshot 1 */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[#0B1E3D] text-white font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3 border-r border-slate-800">S.NO.</th>
                <th className="py-2.5 px-3 border-r border-slate-800">POLICY & QUOTE NO.</th>
                <th className="py-2.5 px-3 border-r border-slate-800">CUSTOMER DETAILS</th>
                <th className="py-2.5 px-3 border-r border-slate-800">PRODUCT & ASSET</th>
                <th className="py-2.5 px-3 border-r border-slate-800">INSURER</th>
                <th className="py-2.5 px-3 border-r border-slate-800">EXPIRY DATE</th>
                <th className="py-2.5 px-3 border-r border-slate-800 text-center">RENEWAL STATUS</th>
                <th className="py-2.5 px-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-700">{r.sNo}</td>
                    <td className="py-2 px-3">
                      <span className="font-mono font-bold text-slate-900 block">{r.oldPolicyNo}</span>
                      <span className="text-[10px] font-mono text-blue-700 block">Quote: {r.renewedQuoteNo}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-slate-900 block">{r.policyHolder}</span>
                      <span className="text-[10px] text-slate-600 font-mono block">{r.phone}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">{r.email}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-slate-900 font-semibold block">{r.productName}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{r.vehicleNumber}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-medium">{r.companyName}</td>
                    <td className="py-2 px-3 font-semibold text-slate-700">{r.expiryDate}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                          r.policyStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : r.policyStatus === 'Expiring Soon'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : r.policyStatus === 'Expired'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : r.policyStatus === 'Renewed'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {r.policyStatus}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openRenewModal(r)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-[#1E4E8C] hover:bg-blue-800 text-white rounded-md shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Renew</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClone(r)}
                          title="Clone Quote"
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    No matching policy or quote found for your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Bottom Action Toolbar matching Screenshot 1 */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => filteredRecords[0] && openRenewModal(filteredRecords[0])}
              className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Renew</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCollectModal(filteredRecords[0] || true)}
              className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-blue-600" />
              <span>Collect Premium</span>
            </button>

            <button
              type="button"
              onClick={() => setShowViewModal(filteredRecords[0] || true)}
              className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>View</span>
            </button>

            <button
              type="button"
              onClick={() => filteredRecords[0] && handleClone(filteredRecords[0])}
              className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span>Clone</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhotosModal(true)}
              className="flex items-center gap-1.5 text-slate-700 hover:text-blue-600 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>View Photos</span>
            </button>
          </div>

          {/* Go To Top Floating Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-700 self-end sm:self-auto cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-xs">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
            <span>Go To Top</span>
          </button>
        </div>
      </div>

      {/* UNRESOLVED CLAIM WARNING MODAL */}
      {unresolvedClaimWarning && (
        <Modal
          isOpen={true}
          onClose={() => setUnresolvedClaimWarning(null)}
          title="Renewal Underwriting Restriction"
          subtitle={`Policy: ${unresolvedClaimWarning.policy.id} • Customer: ${unresolvedClaimWarning.policy.clientName}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => setUnresolvedClaimWarning(null)}>
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={AlertTriangle}
                onClick={() => {
                  const claimId = unresolvedClaimWarning.claim.id;
                  setUnresolvedClaimWarning(null);
                  navigateToClaim(claimId);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                View & Resolve Claim Docket →
              </Button>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            {/* Prominent Warning Callout */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-800">
                  Policy cannot be renewed until the existing claim is resolved.
                </h4>
                <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                  IRDAI Statutory Compliance: Direct policy renewals cannot be bound or endorsed while an active, unadjudicated loss intimation remains pending in the claims ledger.
                </p>
              </div>
            </div>

            {/* Claim Specifics Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Associated Active Claim Particulars
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {unresolvedClaimWarning.claim.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Claim ID:</span>
                  <span className="font-mono font-bold text-slate-800">{unresolvedClaimWarning.claim.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Claim Status:</span>
                  <span className="font-bold text-amber-700">
                    {unresolvedClaimWarning.claim.currentStage === 3
                      ? 'Survey Assigned / Under Review'
                      : unresolvedClaimWarning.claim.currentStage === 2
                      ? 'Documents Pending'
                      : 'Registered'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Claim Stage:</span>
                  <span className="font-bold text-slate-800">
                    Stage {unresolvedClaimWarning.claim.currentStage} of 4 (
                    {unresolvedClaimWarning.claim.currentStage === 1
                      ? 'Registered'
                      : unresolvedClaimWarning.claim.currentStage === 2
                      ? 'Documents & Submission'
                      : unresolvedClaimWarning.claim.currentStage === 3
                      ? 'Survey / Review'
                      : 'Settlement Sanction'}
                    )
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Claim Settlement Status:</span>
                  <span className="font-bold text-rose-700">
                    {unresolvedClaimWarning.claim.settlementStatus || 'Unresolved (Pending Settlement)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Claim Amount Requested:</span>
                  <span className="font-bold text-slate-900">
                    ₹{unresolvedClaimWarning.claim.claimAmountRequested?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Asset / Vehicle:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {unresolvedClaimWarning.claim.vehicleNumber || unresolvedClaimWarning.policy.vehicleNumber}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>
                To proceed with renewal, navigate to Claims Management and advance the docket to Stage 4 (Settled / Closed).
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* RENEWAL MODAL */}
      <Modal
        isOpen={!!selectedPolicyForRenew}
        onClose={() => setSelectedPolicyForRenew(null)}
        title="Execute Policy Renewal"
        subtitle={`Policy: ${selectedPolicyForRenew?.id} • Client: ${selectedPolicyForRenew?.clientName}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setSelectedPolicyForRenew(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={handleExecuteRenewal}
              className="bg-[#0B1E3D] hover:bg-blue-900 text-white font-bold"
            >
              Confirm 1-Year Renewal
            </Button>
          </div>
        }
      >
        <form onSubmit={handleExecuteRenewal} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Insurer Partner</label>
            <select
              value={renewalForm.targetCompanyId}
              onChange={(e) => setRenewalForm({ ...renewalForm, targetCompanyId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Policy Expiry Date</label>
            <input
              type="date"
              required
              value={renewalForm.newExpiryDate}
              onChange={(e) => setRenewalForm({ ...renewalForm, newExpiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
            />
          </div>
        </form>
      </Modal>

      {/* COLLECT PREMIUM MODAL */}
      {showCollectModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCollectModal(null)}
          title="Collect Renewal Premium"
          subtitle="Direct POSP & IRDAI Premium Receipting"
          footer={
            <Button variant="primary" size="sm" onClick={() => {
              addNotification('Premium collection entry recorded successfully.', 'success');
              setShowCollectModal(null);
            }}>
              Record & Generate Receipt
            </Button>
          }
        >
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-slate-800">
              <p className="font-bold">Total Renewal Amount Payable: ₹14,250</p>
              <p className="text-[11px] text-slate-600">Payment Modes: UPI / Netbanking / NEFT / Cheque</p>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW PHOTOS MODAL */}
      {showPhotosModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowPhotosModal(null)}
          title="Inspection & Asset Photos"
          subtitle="Pre-Inspection Vehicle Spot Photos"
          footer={<Button variant="outline" size="sm" onClick={() => setShowPhotosModal(null)}>Close</Button>}
        >
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
            <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-700">Pre-Inspection Photos Verified</p>
            <p className="text-[11px] text-slate-400">Front, Rear, Odometer, and Engine bay images on record.</p>
          </div>
        </Modal>
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowViewModal(null)}
          title="Policy Renewal Docket"
          subtitle="Complete Underwriting Parameters"
          footer={<Button variant="outline" size="sm" onClick={() => setShowViewModal(null)}>Close</Button>}
        >
          <div className="space-y-2 text-xs">
            <p className="font-bold text-slate-800">Customer: KRISHNA KUMAR S</p>
            <p className="text-slate-600">Old Policy: 71300431250300002474</p>
            <p className="text-slate-600">Renewal Status: In Progress with IRDA Fast-Track underwriting.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default RenewalsPage;
