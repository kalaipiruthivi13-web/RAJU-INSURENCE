import React, { useState, useEffect } from 'react';
import {
  Building2,
  FolderArchive,
  Download,
  ExternalLink,
  PhoneCall,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Sliders
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import DataTable from '../components/ui/DataTable';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export function CompaniesMasterPage({ initialTab = 'companies' }) {
  const { partners, repositoryDocs, products, globalSearch, setActiveTab } = useAppData();
  const [activeSection, setActiveSection] = useState(initialTab); // 'companies' | 'products' | 'repository'
  const [filterType, setFilterType] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'
  const [docCategory, setDocCategory] = useState('ALL');
  const [productCategory, setProductCategory] = useState('ALL');

  useEffect(() => {
    if (initialTab) {
      setActiveSection(initialTab);
    }
  }, [initialTab]);

  // Filter partners
  const filteredPartners = partners.filter((p) => {
    if (filterType === 'HEALTH' && !p.healthSupported) return false;
    if (filterType === 'MOTOR' && !p.motorSupported) return false;
    if (filterType === 'PSU' && !p.type?.includes('Public Sector')) return false;

    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term) ||
        (p.licenceNo && p.licenceNo.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // Filter repository docs
  const filteredDocs = (repositoryDocs || []).filter((doc) => {
    if (docCategory !== 'ALL' && doc.category !== docCategory) return false;
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        doc.title.toLowerCase().includes(term) ||
        doc.partner.toLowerCase().includes(term) ||
        doc.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Filter products
  const filteredProducts = (products || []).filter((prod) => {
    if (productCategory !== 'ALL' && prod.type !== productCategory) return false;
    if (globalSearch) {
      const term = globalSearch.toLowerCase();
      return (
        prod.name.toLowerCase().includes(term) ||
        prod.code.toLowerCase().includes(term) ||
        prod.category.toLowerCase().includes(term) ||
        prod.underwriters?.some((u) => u.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const productColumns = [
    {
      key: 'name',
      label: 'Insurance Plan / Product Line',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{val}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                {row.code}
              </span>
              <span className="text-[10px] text-slate-400">
                {row.irdaApprovalCode}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Segment',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {val}
        </span>
      )
    },
    {
      key: 'underwriters',
      label: 'Partner Underwriters',
      render: (val) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {val?.map((u, i) => (
            <span
              key={i}
              className="text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100 px-1.5 py-0.5 rounded"
            >
              {u}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'tenure',
      label: 'Coverage Term & Deductible',
      render: (val, row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">{val}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{row.standardDeductible}</p>
        </div>
      )
    },
    {
      key: 'basePremium',
      label: 'Standard Tariff',
      sortable: true,
      render: (val) => <span className="font-bold text-slate-900 text-xs">{val}</span>
    },
    {
      key: 'commissionRate',
      label: 'Broker Payout',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs">
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('quotes')}
          >
            Quote
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('applications')}
          >
            Apply
          </Button>
        </div>
      )
    }
  ];

  const partnerColumns = [
    {
      key: 'name',
      label: 'Insurer Company',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl ${row.logoBg || 'bg-indigo-600'} text-white flex items-center justify-center font-black text-xs shrink-0`}
          >
            {row.code || val.substring(0, 3)}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{val}</p>
            <span className="text-[11px] text-slate-400">{row.type}</span>
          </div>
        </div>
      )
    },
    {
      key: 'licenceNo',
      label: 'IRDA Licence No',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {val || 'IRDA-LIC-2024'}
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">Exp: {row.licenceExpiry || '2028-12-31'}</p>
        </div>
      )
    },
    {
      key: 'supportedProducts',
      label: 'Product Lines',
      render: (val, row) => (
        <span className="text-xs text-slate-700">
          {val || (row.motorSupported && row.healthSupported ? 'Motor, Health' : row.motorSupported ? 'Motor' : 'Health')}
        </span>
      )
    },
    {
      key: 'claimRatio',
      label: 'Claim Ratio (ICR)',
      sortable: true,
      render: (val) => <span className="font-bold text-emerald-700">{val}</span>
    },
    {
      key: 'networkCount',
      label: 'Cashless Network',
      render: (val) => <span className="text-xs text-slate-700">{val}</span>
    },
    {
      key: 'commissionRate',
      label: 'Broker Commission',
      sortable: true,
      render: (val) => (
        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-full text-xs">
          {val}
        </span>
      )
    },
    {
      key: 'portalUrl',
      label: 'Carrier Portal',
      render: (val) => (
        <a
          href={val}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          <span>Login</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )
    }
  ];

  const docColumns = [
    {
      key: 'title',
      label: 'Document Title',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{val}</p>
            <p className="text-[11px] text-slate-400">
              {row.fileSize} • Uploaded: {row.uploadedDate}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'partner',
      label: 'Insurance Partner',
      sortable: true,
      render: (val) => <span className="font-semibold text-slate-800">{val}</span>
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {val}
        </span>
      )
    },
    {
      key: 'fileType',
      label: 'Format',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
          {val}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => alert(`Downloading: ${row.title}`)}
        >
          Download
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Section Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {activeSection === 'companies'
                ? '15 Licensed Partner Insurers & Licences'
                : activeSection === 'products'
                ? 'Approved Product Lines & Insurance Plans'
                : 'Central Insurance Document Repository'}
            </h1>
            <Badge variant="primary" size="sm">
              {activeSection === 'companies'
                ? '15 Partners Active'
                : activeSection === 'products'
                ? `${filteredProducts.length} Active Plans`
                : 'IRDA Master Docs'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeSection === 'companies'
              ? 'Official IRDAI registration numbers, statutory solvency details, and direct carrier login links.'
              : activeSection === 'products'
              ? 'Standard rate sheets, underwriting guidelines, insurer commission slabs, and policy terms.'
              : 'Download approved policy wordings, network garage/hospital directories, proposal forms, and brochures.'}
          </p>
        </div>

        {/* Section Pill Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveSection('companies')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSection === 'companies'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Partner Licences
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSection === 'products'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Products & Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('repository')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSection === 'repository'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            Document Repository
          </button>
        </div>
      </div>

      {/* SECTION 1: PARTNER COMPANIES & LICENCES */}
      {activeSection === 'companies' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
              {[
                { id: 'ALL', label: 'All 15 Partners' },
                { id: 'MOTOR', label: 'General & Motor' },
                { id: 'HEALTH', label: 'Health Specialists' },
                { id: 'PSU', label: 'Govt / PSU' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    filterType === f.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'GRID' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Cards Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Master Table
              </button>
            </div>
          </div>

          {/* Render Cards Grid or Table */}
          {viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPartners.map((company) => (
                <div
                  key={company.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl ${company.logoBg || 'bg-indigo-600'} text-white flex items-center justify-center font-black text-xs tracking-wider shadow-xs`}
                        >
                          {company.code}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {company.name}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            {company.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Licences Pill */}
                    <div className="bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-200/60 mb-4 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-700 uppercase block">
                          IRDAI Licence Number
                        </span>
                        <span className="font-mono font-bold text-indigo-950">
                          {company.licenceNo || 'IRDA-LIC-2024'}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold">
                        Exp: {company.licenceExpiry || '2028'}
                      </span>
                    </div>

                    {/* Core Metrics */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs mb-4">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Claim Settlement</span>
                        <span className="font-black text-emerald-600 text-sm">
                          {company.claimRatio}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Broker Commission</span>
                        <span className="font-black text-indigo-700 text-sm">
                          {company.commissionRate}
                        </span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-200/60">
                        <span className="text-slate-400 block text-[10px]">Cashless Network</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {company.networkCount}
                        </span>
                      </div>
                    </div>

                    {/* Helpline */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">Helpline:</span>
                      <span className="font-mono font-bold text-slate-800">{company.helpline}</span>
                    </div>
                  </div>

                  {/* Portal Button */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100">
                    <a
                      href={company.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl border border-indigo-200/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Partner Portal Login</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              columns={partnerColumns}
              data={filteredPartners}
              searchPlaceholder="Search 15 partners by name, licence or code..."
              emptyMessage="No partners match current filter"
            />
          )}
        </div>
      )}

      {/* SECTION 2: PRODUCTS CATALOGUE */}
      {activeSection === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
              {[
                { id: 'ALL', label: 'All Products' },
                { id: 'Motor', label: 'Motor Plans' },
                { id: 'Health', label: 'Health & Mediclaim' },
                { id: 'Finance', label: 'Loan Shield' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setProductCategory(c.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    productCategory === c.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> approved tariff plans
            </div>
          </div>

          <DataTable
            columns={productColumns}
            data={filteredProducts}
            searchPlaceholder="Search products by plan name, code, segment or underwriter..."
            emptyMessage="No insurance products match current filter"
          />
        </div>
      )}

      {/* SECTION 3: DOCUMENT REPOSITORY */}
      {activeSection === 'repository' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
              {[
                { id: 'ALL', label: 'All Categories' },
                { id: 'Policy Wordings', label: 'Policy Wordings' },
                { id: 'Network Directory', label: 'Network Directory' },
                { id: 'Forms & Kits', label: 'Forms & Kits' },
                { id: 'Claim Forms', label: 'Claim Forms' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDocCategory(c.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    docCategory === c.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={docColumns}
            data={filteredDocs}
            searchPlaceholder="Search repository documents by title, partner or category..."
            emptyMessage="No documents found in repository"
          />
        </div>
      )}
    </div>
  );
}

export default CompaniesMasterPage;
