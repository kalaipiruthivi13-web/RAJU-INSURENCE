import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import Step1CustomerKYC from '../components/insurance/Step1CustomerKYC';
import Step2NewVehicle from '../components/insurance/Step2NewVehicle';
import Step2ExistingVehicle from '../components/insurance/Step2ExistingVehicle';
import Step2TwoWheelerDetails from '../components/insurance/Step2TwoWheelerDetails';
import Step2AssetMembers from '../components/insurance/Step2AssetMembers';
import Step3CoverageAddons from '../components/insurance/Step3CoverageAddons';
import Step4PartnerEligibility from '../components/insurance/Step4PartnerEligibility';
import Step5QuoteComparison from '../components/insurance/Step5QuoteComparison';
import Step6DocumentsUpload from '../components/insurance/Step6DocumentsUpload';
import Step7ReviewApproval from '../components/insurance/Step7ReviewApproval';
import Step8PaymentIssuance from '../components/insurance/Step8PaymentIssuance';
import {
  User,
  Car,
  ShieldAlert,
  Building2,
  Sliders,
  FolderArchive,
  FileCheck2,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';
import Button from '../components/ui/Button';

export function InsurancePage() {
  const { partners, addPolicy, setActiveTab } = useAppData();

  // Funnel Navigation State:
  // 'CATEGORY' -> 'MOTOR_PRODUCT' -> 'MOTOR_INTENT' -> 'RENEWAL_LOOKUP' -> 'WIZARD'
  const [funnelStep, setFunnelStep] = useState('CATEGORY');
  const [insuranceCategory, setInsuranceCategory] = useState('MOTOR'); // 'MOTOR' | 'HEALTH'
  const [motorProduct, setMotorProduct] = useState('CAR'); // 'CAR' | 'TWO_WHEELER'
  const [motorIntent, setMotorIntent] = useState('NEW'); // 'NEW' | 'RENEWAL'

  const [currentStep, setCurrentStep] = useState(1);

  // Renewal Pre-Fill Lookup Data
  const [renewalData, setRenewalData] = useState({
    prevPolicyNo: 'POL-2023-998821',
    currentInsurerId: 'hdfc_ergo',
    policyExpiryDate: '2024-10-15',
    vehicleRegNo: 'TN 07 DJ 2341',
    hasPreviousClaim: false,
    previousNcb: 25
  });

  // Step 1: Customer KYC
  const [customerData, setCustomerData] = useState({
    customerType: 'INDIVIDUAL', // 'INDIVIDUAL' | 'ORGANIZATION'
    legalName: 'Senthil Nathan K.',
    mobile: '+91 98410 77654',
    email: 'senthil.nathan@gmail.com',
    panNumber: 'BNKP7890C',
    gstin: '',
    msmeRegNo: '',
    addressLine1: '14/2, Anna Salai, Guindy',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600032'
  });

  // Step 2: Motor Risk Details
  const [motorData, setMotorData] = useState({
    policyNature: 'ROLLOVER_RENEWAL',
    registrationStatus: 'PERMANENT',
    regNo: 'TN 07 DJ 2341',
    vehicleZone: 'ZONE_A',
    vehicleClass: 'PRIVATE_CAR',
    make: 'Hyundai',
    model: 'Creta 1.5 SX',
    engineNo: 'G4FLM891240',
    chassisNo: 'MALC381CLNM441209',
    cubicCapacity: 1497,
    fuelType: 'PETROL',
    mfgYear: 2023,
    seatingCapacity: '5',
    rcColor: 'Polar White',
    exShowroomPrice: 950000,
    invoicePrice: 1000000,
    calculatedIdv: 850000,
    depPercent: 15,
    prevPolicyNo: 'POL-2023-998821',
    prevInsurerId: 'hdfc_ergo',
    hasPreviousClaim: false,
    ncbPercentage: 25
  });

  // Step 2: Health Members
  const [healthMembers, setHealthMembers] = useState([
    {
      id: 'MEM-01',
      relation: 'SELF',
      memberName: 'Senthil Nathan K.',
      dob: '1985-06-15',
      age: 39,
      gender: 'MALE',
      heightCm: 175,
      weightKg: 72,
      bmi: 23.5,
      occupation: 'SALARIED'
    },
    {
      id: 'MEM-02',
      relation: 'SPOUSE',
      memberName: 'Meena Senthil',
      dob: '1988-09-22',
      age: 36,
      gender: 'FEMALE',
      heightCm: 162,
      weightKg: 58,
      bmi: 22.1,
      occupation: 'HOMEMAKER'
    }
  ]);

  // Step 3: Coverage & Addons
  const [motorAddons, setMotorAddons] = useState({
    tppdLimit: '750000',
    paOwnerDriver: true,
    paPassengerSum: '200000',
    llPaidDriver: true,
    hasAntiTheft: false,
    electricalFittingsVal: '',
    nonElectricalVal: '',
    cngValue: '',
    isHypothecated: false,
    bankName: '',
    bankBranch: '',
    loanAccountNo: '',
    addonZeroDep: true,
    addonEngineProtect: true,
    addonRsa: true,
    addonRti: false,
    addonConsumables: true,
    addonKeyReplace: false,
    addonTyreSecure: false
  });

  const [healthCoverage, setHealthCoverage] = useState({
    sumInsured: '1000000',
    roomRentPreference: 'NO_CAPPING',
    copayPreference: '0_PERCENT',
    riderMaternity: false,
    riderCriticalIllness: true,
    riderHospitalCash: false,
    pedDiabetes: false,
    pedHypertension: false,
    pedHeartCondition: false,
    pedAsthma: false,
    pastHospitalization: ''
  });

  // Step 4: Partners Selected
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([
    'hdfc_ergo',
    'icici_lombard',
    'tata_aig',
    'new_india',
    'star_health'
  ]);

  // Step 5: Selected Quote
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Step 6: Documents
  const [documents, setDocuments] = useState({
    doc_rc: {
      uploaded: true,
      fileName: 'RC_BOOK_TN07DJ2341.pdf',
      size: '2.4 MB',
      uploadedAt: '10:30 AM',
      status: 'VERIFIED'
    },
    doc_prev_policy: {
      uploaded: true,
      fileName: 'PREV_POL_HDFC_2023.pdf',
      size: '1.2 MB',
      uploadedAt: '10:31 AM',
      status: 'VERIFIED'
    },
    doc_kyc_pan: {
      uploaded: true,
      fileName: 'PAN_SENTHIL_NATHAN.pdf',
      size: '890 KB',
      uploadedAt: '10:32 AM',
      status: 'VERIFIED'
    }
  });

  // Step 7: Review & Underwriting Approval
  const [reviewData, setReviewData] = useState(null);

  // Dynamic Step Labels based on flow
  let step2Label = '02 New Vehicle Details';
  let step5Label = '05 Quotations';
  let step8Label = '08 Payment & Issue';

  if (insuranceCategory === 'MOTOR') {
    if (motorProduct === 'TWO_WHEELER') {
      step2Label = '02 Two Wheeler Details';
      step5Label = motorIntent === 'RENEWAL' ? '05 Renewal Quotations' : '05 Quotations';
      step8Label = motorIntent === 'RENEWAL' ? '08 Payment & Renewal' : '08 Payment & Issue';
    } else if (motorIntent === 'RENEWAL') {
      step2Label = '02 Existing Vehicle / Policy';
      step5Label = '05 Renewal Quotations';
      step8Label = '08 Payment & Renewal';
    } else {
      step2Label = '02 New Vehicle Details';
      step5Label = '05 Quotations';
      step8Label = '08 Payment & Issue';
    }
  } else {
    step2Label = '02 Insured Family Members';
    step5Label = '05 Quotations';
    step8Label = '08 Payment & Issue';
  }

  const steps = [
    { number: 1, label: '01 Customer', icon: User },
    { number: 2, label: step2Label, icon: Car },
    { number: 3, label: '03 Coverage & Add-ons', icon: ShieldAlert },
    { number: 4, label: '04 Partner Eligibility', icon: Building2 },
    { number: 5, label: step5Label, icon: Sliders },
    { number: 6, label: '06 Documents', icon: FolderArchive },
    { number: 7, label: '07 Review', icon: FileCheck2 },
    { number: 8, label: step8Label, icon: CreditCard }
  ];

  const handleSelectQuote = (quote) => {
    setSelectedQuote(quote);
    setCurrentStep(6);
  };

  const handleReviewApproval = (data) => {
    setReviewData(data);
    setCurrentStep(8);
  };

  const handleConfirmPolicy = ({ policyNo, expiryStr, payableAmount }) => {
    const isNew = motorIntent === 'NEW';
    addPolicy({
      id: policyNo,
      clientName: customerData.legalName,
      phone: customerData.mobile,
      email: customerData.email,
      policyType:
        insuranceCategory === 'MOTOR'
          ? `${motorProduct === 'CAR' ? 'Car' : 'Two Wheeler'} Insurance (${isNew ? 'New Vehicle' : 'Renewal'})`
          : 'Health Care Supreme (Family Floater)',
      vehicleNumber: insuranceCategory === 'MOTOR' ? (motorData.regNo || 'New Vehicle') : 'Health Insurance',
      companyId: selectedQuote?.company?.id || 'hdfc_ergo',
      companyName: selectedQuote?.company?.name || 'HDFC ERGO',
      premium: payableAmount,
      sumInsured:
        insuranceCategory === 'MOTOR'
          ? Number(motorData.calculatedIdv)
          : Number(healthCoverage.sumInsured),
      expiryDate: expiryStr,
      notes: `Issued via RAJU VENDOR Application Engine. IRDA Authorized.`
    });
  };

  // ==========================================
  // FUNNEL SCREEN 1: Category Selection
  // ==========================================
  if (funnelStep === 'CATEGORY') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                New Insurance Application
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white shadow-xs">
                MNC Engine
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              What type of insurance do you want to create?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl">
            {/* Motor Insurance Card */}
            <div className="p-6 sm:p-7 rounded-2xl border-2 border-slate-200 hover:border-[#2563EB] hover:shadow-lg transition-all flex flex-col justify-between bg-white group">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-3xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs border border-blue-100">
                  🚗
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">Motor Insurance</h2>
                <p className="text-xs font-bold text-[#2563EB] mt-0.5">Vehicle / Motor policies</p>
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                  Comprehensive & Third-Party policies for Private Cars, Two-Wheelers, and Commercial Fleets with instant IDV and NCB calculations.
                </p>

                <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Private Cars, Two-Wheelers & Fleets</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Auto IDV Depreciation Grid (Up to 50%)</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero Dep, Engine Protect, RSA & RTI Add-ons</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setInsuranceCategory('MOTOR');
                    setFunnelStep('MOTOR_PRODUCT');
                  }}
                  className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-[#2563EB] hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Health Insurance Card */}
            <div className="p-6 sm:p-7 rounded-2xl border-2 border-slate-200 hover:border-teal-600 hover:shadow-lg transition-all flex flex-col justify-between bg-white group">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-3xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs border border-teal-100">
                  🏥
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">Health Insurance</h2>
                <p className="text-xs font-bold text-teal-700 mt-0.5">Individual / Family Health policies</p>
                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                  Individual, Family Floater & Senior Citizen Mediclaim covers with dynamic demographic tracking, auto BMI, and cashless hospital network comparison.
                </p>

                <div className="mt-5 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Individual & Family Floater Schemes</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Auto Age & BMI Calculation per Member</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pre-Existing Disease (PED) & Maternity Riders</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setInsuranceCategory('HEALTH');
                    setFunnelStep('WIZARD');
                    setCurrentStep(1);
                  }}
                  className="w-full py-3 px-4 rounded-xl font-black text-xs text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // FUNNEL SCREEN 2: Select Motor Product (Car vs Two Wheeler)
  // ==========================================
  if (funnelStep === 'MOTOR_PRODUCT') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Applications ➔ Motor Insurance</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-1">
                Select Motor Product
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose vehicle category to configure underwriting rules and coverage limits
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setFunnelStep('CATEGORY')}
            >
              Back to Categories
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl">
            {/* Car Insurance */}
            <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col justify-between bg-white group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-3xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs border border-blue-100">
                  🚗
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">Car Insurance</h2>
                <p className="text-xs font-bold text-[#2563EB] mt-0.5">Private 4-Wheeler Passenger Cars</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Comprehensive & Third-Party covers for Hatchbacks, Sedans, MUVs and SUVs. Includes Zero Depreciation, Engine Protect & 24x7 RSA.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMotorProduct('CAR');
                    setFunnelStep('MOTOR_INTENT');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs text-white bg-[#2563EB] hover:bg-blue-700 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select Car Insurance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Two Wheeler Insurance */}
            <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col justify-between bg-white group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-3xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs border border-indigo-100">
                  🏍️
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">Two Wheeler Insurance</h2>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">Motorcycles & Scooters</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Fast quotes for Commuter, Sports, Scooters and EV Two-Wheelers. Multi-year TP compliance and standalone OD add-on packs.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMotorProduct('TWO_WHEELER');
                    setFunnelStep('MOTOR_INTENT');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs text-white bg-[#0F172A] hover:bg-slate-800 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select Two Wheeler</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // FUNNEL SCREEN 3: Motor Intent (New vs Renewal)
  // ==========================================
  if (funnelStep === 'MOTOR_INTENT') {
    const isCar = motorProduct === 'CAR';
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  Motor ➔ {isCar ? 'Car Insurance' : 'Two Wheeler Insurance'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-1">
                {isCar ? 'Car Insurance' : 'Two Wheeler Insurance'}
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                What would you like to do?
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setFunnelStep('MOTOR_PRODUCT')}
            >
              Back to Product Selection
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-4xl">
            {/* Intent 1: New Vehicle */}
            <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col justify-between bg-white group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-3xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs border border-blue-100">
                  🆕
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">Buy Insurance for New Vehicle</h2>
                <p className="text-xs font-bold text-[#2563EB] mt-0.5">Get quotes from multiple insurers</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  For brand new vehicles purchased from showroom. Zero depreciation IDV schedule with mandatory multi-year Third Party cover.
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unregistered / Temporary / TR Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto 5% Showroom Depreciation IDV</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMotorIntent('NEW');
                    setFunnelStep('WIZARD');
                    setCurrentStep(1);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs text-white bg-[#2563EB] hover:bg-blue-700 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue →</span>
                </button>
              </div>
            </div>

            {/* Intent 2: Renew Existing Policy */}
            <div className="p-6 rounded-2xl border-2 border-slate-200 hover:border-[#2563EB] hover:shadow-md transition-all flex flex-col justify-between bg-white group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-3xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs border border-amber-100">
                  🔄
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">Renew Existing Policy</h2>
                <p className="text-xs font-bold text-amber-700 mt-0.5">from Any Insurer</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Compare renewal quotes from partner insurers. Rollover earned No Claim Bonus (NCB up to 50%) and switch insurer effortlessly.
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rollover NCB from any existing insurer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant renewal without inspection waiver</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMotorIntent('RENEWAL');
                    setFunnelStep('RENEWAL_LOOKUP');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs text-white bg-[#0F172A] hover:bg-slate-800 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // FUNNEL SCREEN 4: Dedicated Renewal Lookup Screen
  // ==========================================
  if (funnelStep === 'RENEWAL_LOOKUP') {
    const isTwoWheeler = motorProduct === 'TWO_WHEELER';

    const handleRenewalLookupSubmit = (e) => {
      e.preventDefault();
      if (!renewalData.vehicleRegNo) {
        alert('Please fill Vehicle Registration Number');
        return;
      }
      setMotorData((prev) => ({
        ...prev,
        regNo: renewalData.vehicleRegNo,
        prevPolicyNo: renewalData.prevPolicyNo || 'POL-2023-998821',
        prevInsurerId: renewalData.currentInsurerId || 'hdfc_ergo',
        hasPreviousClaim: renewalData.hasPreviousClaim,
        ncbPercentage: renewalData.hasPreviousClaim ? 0 : (renewalData.previousNcb || 20)
      }));
      setFunnelStep('WIZARD');
      setCurrentStep(1);
    };

    const handlePresetSelect = (regNo, make, model, cc, ncb) => {
      setRenewalData((prev) => ({
        ...prev,
        vehicleRegNo: regNo,
        previousNcb: ncb,
        hasPreviousClaim: false
      }));
      setMotorData((prev) => ({
        ...prev,
        regNo,
        make,
        model,
        cubicCapacity: cc,
        ncbPercentage: ncb,
        hasPreviousClaim: false
      }));
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl mx-auto">
        <form onSubmit={handleRenewalLookupSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {isTwoWheeler ? '🏍️ Two Wheeler Renewal' : '🚗 Car Renewal'}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {isTwoWheeler ? 'Two Wheeler Insurance' : 'Car Insurance'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight mt-1">
                {isTwoWheeler ? 'Two Wheeler Policy Renewal' : 'Renew Existing Motor Policy'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your Vehicle Registration Number to fetch policy details & renew instantly
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setFunnelStep('MOTOR_INTENT')}
            >
              Back
            </Button>
          </div>

          {/* PROMINENT VEHICLE REGISTRATION NUMBER INPUT CARD */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border-2 border-slate-200 focus-within:border-[#2563EB] transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider">
                Vehicle Registration Number *
              </label>
              <span className="text-[11px] font-bold text-[#2563EB]">
                {isTwoWheeler ? 'Two-Wheeler Reg' : 'Motor Reg'}
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                <span className="text-base">{isTwoWheeler ? '🏍️' : '🚗'}</span>
                <span className="text-[10px] font-black bg-blue-900 text-white px-1 py-0.5 rounded">IND</span>
              </div>
              <input
                type="text"
                required
                placeholder="TN 09 BX 4512"
                value={renewalData.vehicleRegNo}
                onChange={(e) => setRenewalData((prev) => ({ ...prev, vehicleRegNo: e.target.value.toUpperCase() }))}
                className="w-full pl-20 pr-4 py-3 text-base sm:text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono uppercase font-black text-slate-900 bg-white tracking-widest shadow-2xs"
              />
            </div>

            {/* Quick Test Presets */}
            {isTwoWheeler ? (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('TN 09 BX 4512', 'Royal Enfield', 'Classic 350', 349, 25)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  TN 09 BX 4512 (Classic 350)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('TN 02 CD 4455', 'Honda', 'Activa 6G', 109, 20)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  TN 02 CD 4455 (Activa 6G)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('TN 10 AW 8890', 'TVS', 'Jupiter 125', 124, 35)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  TN 10 AW 8890 (Jupiter)
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('TN 07 DJ 2341', 'Hyundai', 'Creta 1.5 SX', 1497, 25)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  TN 07 DJ 2341 (Creta)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('TN 22 DK 8812', 'Maruti Suzuki', 'Swift ZXi', 1197, 20)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  TN 22 DK 8812 (Swift)
                </button>
              </div>
            )}
          </div>

          {/* PREVIOUS POLICY & NCB PARAMETERS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider pb-2 border-b border-slate-100">
              Previous Policy Details & Rollover NCB
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Previous Policy Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL-2023-998821"
                  value={renewalData.prevPolicyNo}
                  onChange={(e) => setRenewalData((prev) => ({ ...prev, prevPolicyNo: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Insurer *
                </label>
                <select
                  value={renewalData.currentInsurerId}
                  onChange={(e) => setRenewalData((prev) => ({ ...prev, currentInsurerId: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-medium text-slate-800"
                >
                  {(partners || []).filter((p) => p.motorSupported).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Policy Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={renewalData.policyExpiryDate}
                  onChange={(e) => setRenewalData((prev) => ({ ...prev, policyExpiryDate: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB] font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Previous Claim in Expiring Policy? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="claimChoice"
                      checked={renewalData.hasPreviousClaim === false}
                      onChange={() => setRenewalData((prev) => ({ ...prev, hasPreviousClaim: false }))}
                      className="text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-xs font-bold text-slate-800">No (NCB Eligible)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="claimChoice"
                      checked={renewalData.hasPreviousClaim === true}
                      onChange={() => setRenewalData((prev) => ({ ...prev, hasPreviousClaim: true }))}
                      className="text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-xs font-bold text-slate-800">Yes (0% NCB)</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Previous NCB on Expiring Policy *
                </label>
                <select
                  disabled={renewalData.hasPreviousClaim}
                  value={renewalData.hasPreviousClaim ? 0 : renewalData.previousNcb}
                  onChange={(e) => setRenewalData((prev) => ({ ...prev, previousNcb: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#2563EB] font-bold text-slate-900"
                >
                  <option value={0}>0% (New / Claimed in Previous Term)</option>
                  <option value={20}>20% (1 Claim-Free Year)</option>
                  <option value={25}>25% (2 Claim-Free Years)</option>
                  <option value={35}>35% (3 Claim-Free Years)</option>
                  <option value={45}>45% (4 Claim-Free Years)</option>
                  <option value={50}>50% Maximum Allowed NCB Discount</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="md"
              icon={ArrowLeft}
              onClick={() => setFunnelStep('MOTOR_INTENT')}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              type="submit"
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
            >
              Continue to Application Form
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // 8-STEP DYNAMIC INSURANCE WIZARD
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Wizard Header & Stepper */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                New Insurance Application
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2563EB] text-white shadow-xs">
                MNC Engine
              </span>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                insuranceCategory === 'MOTOR'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                  : 'bg-teal-50 text-teal-700 border border-teal-200'
              }`}>
                {insuranceCategory === 'MOTOR'
                  ? `${motorProduct === 'CAR' ? '🚗 Car' : '🏍️ Two Wheeler'} (${motorIntent === 'NEW' ? 'New Vehicle' : 'Renewal'})`
                  : '🏥 Health Insurance'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete the 8-step application to generate quotes, verify underwriting parameters, and bind policy.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setFunnelStep('CATEGORY')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ← Change Product / Flow
            </button>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full border border-blue-200">
              Step {currentStep} of 8: {steps[currentStep - 1].label}
            </span>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
            <div
              style={{ width: `${((currentStep - 1) / 7) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#2563EB] transition-all duration-300 rounded-full"
            />
          </div>

          {/* Stepper Icon Nodes */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
            {steps.map((step) => {
              const isDone = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  onClick={() => isDone && setCurrentStep(step.number)}
                  className={`flex flex-col items-center gap-1.5 ${isDone ? 'cursor-pointer' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#2563EB] text-white ring-4 ring-blue-100 shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[10px] font-semibold hidden sm:block ${
                      isCurrent
                        ? 'font-black text-[#2563EB]'
                        : isDone
                        ? 'text-[#0F172A]'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP COMPONENTS RENDER */}
      {currentStep === 1 && (
        <Step1CustomerKYC
          customerData={customerData}
          setCustomerData={setCustomerData}
          insuranceCategory={insuranceCategory}
          motorProduct={motorProduct}
          motorIntent={motorIntent}
          onNext={() => setCurrentStep(2)}
          onBackToFunnel={() => setFunnelStep('CATEGORY')}
        />
      )}

      {/* STEP 2: DYNAMICALLY BRANCHED FOR NEW VEHICLE VS EXISTING VEHICLE VS HEALTH */}
      {/* STEP 2: DYNAMICALLY BRANCHED FOR TWO WHEELER VS CAR NEW VS CAR RENEWAL VS HEALTH */}
      {currentStep === 2 && insuranceCategory === 'MOTOR' && motorProduct === 'TWO_WHEELER' && (
        <Step2TwoWheelerDetails
          motorIntent={motorIntent}
          motorData={motorData}
          setMotorData={setMotorData}
          renewalData={renewalData}
          onNext={() => setCurrentStep(3)}
          onPrev={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 2 && insuranceCategory === 'MOTOR' && motorProduct === 'CAR' && motorIntent === 'NEW' && (
        <Step2NewVehicle
          motorProduct={motorProduct}
          motorData={motorData}
          setMotorData={setMotorData}
          onNext={() => setCurrentStep(3)}
          onPrev={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 2 && insuranceCategory === 'MOTOR' && motorProduct === 'CAR' && motorIntent === 'RENEWAL' && (
        <Step2ExistingVehicle
          motorProduct={motorProduct}
          motorData={motorData}
          setMotorData={setMotorData}
          renewalData={renewalData}
          partners={partners}
          onNext={() => setCurrentStep(3)}
          onPrev={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 2 && insuranceCategory === 'HEALTH' && (
        <Step2AssetMembers
          insuranceCategory={insuranceCategory}
          motorData={motorData}
          setMotorData={setMotorData}
          healthMembers={healthMembers}
          setHealthMembers={setHealthMembers}
          partners={partners}
          onNext={() => setCurrentStep(3)}
          onPrev={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <Step3CoverageAddons
          insuranceCategory={insuranceCategory}
          motorAddons={motorAddons}
          setMotorAddons={setMotorAddons}
          healthCoverage={healthCoverage}
          setHealthCoverage={setHealthCoverage}
          onNext={() => setCurrentStep(4)}
          onPrev={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && (
        <Step4PartnerEligibility
          partners={partners}
          insuranceCategory={insuranceCategory}
          selectedCompanyIds={selectedCompanyIds}
          setSelectedCompanyIds={setSelectedCompanyIds}
          onNext={() => setCurrentStep(5)}
          onPrev={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 5 && (
        <Step5QuoteComparison
          partners={partners}
          selectedCompanyIds={selectedCompanyIds}
          insuranceCategory={insuranceCategory}
          motorData={motorData}
          motorAddons={motorAddons}
          healthCoverage={healthCoverage}
          onSelectQuote={handleSelectQuote}
          onPrev={() => setCurrentStep(4)}
        />
      )}

      {currentStep === 6 && (
        <Step6DocumentsUpload
          insuranceCategory={insuranceCategory}
          selectedQuote={selectedQuote}
          documents={documents}
          setDocuments={setDocuments}
          onNext={() => setCurrentStep(7)}
          onPrev={() => setCurrentStep(5)}
        />
      )}

      {currentStep === 7 && (
        <Step7ReviewApproval
          customerData={customerData}
          insuranceCategory={insuranceCategory}
          motorData={motorData}
          motorAddons={motorAddons}
          healthCoverage={healthCoverage}
          healthMembers={healthMembers}
          selectedQuote={selectedQuote}
          onNext={handleReviewApproval}
          onPrev={() => setCurrentStep(6)}
        />
      )}

      {currentStep === 8 && (
        <Step8PaymentIssuance
          customerData={customerData}
          insuranceCategory={insuranceCategory}
          motorData={motorData}
          healthCoverage={healthCoverage}
          healthMembers={healthMembers}
          selectedQuote={selectedQuote}
          reviewData={reviewData}
          onConfirmPolicy={handleConfirmPolicy}
          onPrev={() => setCurrentStep(7)}
        />
      )}
    </div>
  );
}

export default InsurancePage;
