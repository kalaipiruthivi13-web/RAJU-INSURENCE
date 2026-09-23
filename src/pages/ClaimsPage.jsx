import React, { useState } from 'react';
import {
  Plus,
  Filter,
  CheckCircle,
  Clock,
  Shield,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import ClaimTimeline4Stage from '../components/claims/ClaimTimeline4Stage';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export function ClaimsPage() {
  const { claims, updateClaimStage, addClaim, partners, globalSearch } = useAppData();

  const [selectedClaimId, setSelectedClaimId] = useState(claims[0]?.id || null);
  const [filterStage, setFilterStage] = useState('ALL');
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);

  const [newClaimForm, setNewClaimForm] = useState({
    clientName: 'S. Rajasekaran',
    phone: '+91 98409 33221',
    companyId: 'hdfc_ergo',
    policyType: 'Motor Comprehensive',
    vehicleNumber: 'TN 10 AP 5432',
    incidentDate: new Date().toISOString().split('T')[0],
    claimAmountRequested: '35000'
  });

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  const handleCreateClaim = (e) => {
    e.preventDefault();
    const partner = partners.find((p) => p.id === newClaimForm.companyId);
    const created = addClaim({
      ...newClaimForm,
      companyName: partner ? partner.shortName : 'HDFC ERGO',
      claimAmountRequested: Number(newClaimForm.claimAmountRequested) || 25000
    });
    setSelectedClaimId(created.id);
    setShowNewClaimModal(false);
  };

  const filteredClaims = claims.filter((c) => {
    if (filterStage !== 'ALL' && c.currentStage !== Number(filterStage)) {
      return false;
    }
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        c.clientName.toLowerCase().includes(term) ||
        c.companyName.toLowerCase().includes(term) ||
        c.id.toLowerCase().includes(term) ||
        (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const stageLabels = [
    '01 Registered',
    '02 Docs & Submission',
    '03 Survey / Review',
    '04 Settlement'
  ];

  const columns = [
    {
      key: 'id',
      label: 'Claim ID',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-indigo-900">{val}</span>
          <p className="text-[11px] text-slate-400">{row.incidentDate}</p>
        </div>
      )
    },
    {
      key: 'clientName',
      label: 'Client & Asset',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900">{val}</p>
          <p className="text-xs text-slate-500 font-mono">{row.vehicleNumber}</p>
        </div>
      )
    },
    {
      key: 'companyName',
      label: 'Insurance Partner',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>
    },
    {
      key: 'claimAmountRequested',
      label: 'Requested Amount',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-slate-900">
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'currentStage',
      label: 'Pipeline Stage',
      sortable: true,
      render: (stage, row) => {
        const isSettled = stage === 4;
        const status = row.stageDetails?.stage4?.status || (stage === 4 ? 'Settled' : 'Pending');
        return (
          <Badge
            variant={isSettled ? (status === 'Settled' ? 'success' : 'danger') : 'warning'}
            dot
            size="sm"
          >
            {stageLabels[(stage || 1) - 1] || `Stage ${stage}`}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant={row.id === selectedClaimId ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedClaimId(row.id)}
        >
          {row.id === selectedClaimId ? 'Viewing' : 'Track Pipeline'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              4-Stage Claims Settlement Workflow
            </h1>
            <Badge variant="warning" size="sm">IRDAI Fast Track</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized 4-stage pipeline: 01 Registered ➔ 02 Documents & Insurer Submission ➔ 03 Survey / Review ➔ 04 Settlement / Rejection.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowNewClaimModal(true)}
          className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
        >
          Register New Claim
        </Button>
      </div>

      {/* Active Pipeline View for Selected Claim */}
      {selectedClaim && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Selected Claim Timeline (4-Stage Progress)
            </span>
          </div>
          <ClaimTimeline4Stage
            claim={selectedClaim}
            onAdvanceStage={updateClaimStage}
          />
        </div>
      )}

      {/* Claims List Section with Stage Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">All Claims Records</h2>

          {/* Quick Filter Buttons for 4 Stages */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: '1', label: '01 Registered' },
              { id: '2', label: '02 Documents' },
              { id: '3', label: '03 Survey' },
              { id: '4', label: '04 Settlement' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStage(st.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStage === st.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredClaims}
          searchPlaceholder="Search claims by client, vehicle or claim ID..."
          emptyMessage="No claims match current filter"
        />
      </div>

      {/* MODAL: Register New Claim */}
      <Modal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
        title="Register New Claim Request"
        subtitle="Initialize new claim docket and proceed with Stage 1 registration"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowNewClaimModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateClaim}>
              Initialize Claim Docket (Stage 1)
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateClaim} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={newClaimForm.clientName}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, clientName: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Client Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={newClaimForm.phone}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Insurance Partner Company *
              </label>
              <select
                value={newClaimForm.companyId}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, companyId: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
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
                Vehicle No / Asset Ref
              </label>
              <input
                type="text"
                value={newClaimForm.vehicleNumber}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, vehicleNumber: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date of Incident *
              </label>
              <input
                type="date"
                required
                value={newClaimForm.incidentDate}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, incidentDate: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estimated Loss / Claim Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={newClaimForm.claimAmountRequested}
                onChange={(e) => setNewClaimForm({ ...newClaimForm, claimAmountRequested: e.target.value })}
                className="w-full px-3.5 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClaimsPage;
