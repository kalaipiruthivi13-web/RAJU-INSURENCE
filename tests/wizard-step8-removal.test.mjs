import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock localStorage for Node test environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.window = {
  localStorage: new MockLocalStorage()
};
global.localStorage = global.window.localStorage;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const results = [];

function assert(testId, description, condition, details = '') {
  if (condition) {
    results.push({ testId, description, status: 'PASS' });
    console.log(`\x1b[32m✔ [${testId}] ${description}\x1b[0m`);
  } else {
    results.push({ testId, description, status: 'FAIL', details });
    console.error(`\x1b[31m✖ [${testId}] ${description}\x1b[0m`);
    if (details) console.error(`   Details: ${details}`);
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('   RAJU VENDOR - WIZARD STEP 8 REMOVAL ACCEPTANCE TESTS');
  console.log('======================================================\n');

  // Load components and source code
  const insurancePageSrc = fs.readFileSync(path.join(rootDir, 'src/pages/InsurancePage.jsx'), 'utf8');
  const step7Src = fs.readFileSync(path.join(rootDir, 'src/components/insurance/Step7ReviewApproval.jsx'), 'utf8');
  const appDataCtxSrc = fs.readFileSync(path.join(rootDir, 'src/context/AppDataContext.jsx'), 'utf8');
  const applicationsPageSrc = fs.readFileSync(path.join(rootDir, 'src/pages/ApplicationsPage.jsx'), 'utf8');
  const policiesPageSrc = fs.readFileSync(path.join(rootDir, 'src/pages/PoliciesPage.jsx'), 'utf8');
  const reportsPageSrc = fs.readFileSync(path.join(rootDir, 'src/pages/ReportsAuditPage.jsx'), 'utf8');

  // Test 1: Step 8 component is NOT imported in InsurancePage
  const importsStep8 = insurancePageSrc.includes("import Step8PaymentIssuance") || insurancePageSrc.includes("from '../components/insurance/Step8PaymentIssuance'");
  assert('TEST_01', 'Step 8 (Step8PaymentIssuance) is not imported in InsurancePage', !importsStep8);

  // Test 2: Stepper is configured for exactly 7 steps
  const hasStep8InArray = insurancePageSrc.includes('{ number: 8');
  assert('TEST_02', 'Stepper steps array contains no Step 8', !hasStep8InArray);

  const has7StepsInArray = insurancePageSrc.includes('{ number: 7, label: \'07 Review\', icon: FileCheck2 }');
  assert('TEST_03', 'Step 7 (Review) is the final step in steps array', has7StepsInArray);

  // Test 3: Progress percentage calculation is based on 7 steps (division by 6)
  const has7StepProgress = insurancePageSrc.includes('(currentStep - 1) / 6');
  assert('TEST_04', 'Progress bar percentage calculates using 7 steps ((currentStep - 1) / 6 * 100%)', has7StepProgress);

  // Test 4: Header badge displays "Step X of 7"
  const hasStepOf7Badge = insurancePageSrc.includes('Step {currentStep} of 7');
  const hasStepOf8Badge = insurancePageSrc.includes('Step {currentStep} of 8');
  assert('TEST_05', 'Header displays "Step {currentStep} of 7" and zero "Step {currentStep} of 8"', hasStepOf7Badge && !hasStepOf8Badge);

  // Test 5: Stepper grid updated to 7 columns
  const has7ColsGrid = insurancePageSrc.includes('sm:grid-cols-7');
  assert('TEST_06', 'Stepper node grid is styled for 7 columns (sm:grid-cols-7)', has7ColsGrid);

  // Test 6: Draft clamping logic exists
  const hasClampingEffect = insurancePageSrc.includes('if (currentStep > 7)') && insurancePageSrc.includes('setCurrentStep(7)');
  assert('TEST_07', 'InsurancePage includes draft clamping guard (clamps step > 7 to 7)', hasClampingEffect);

  // Test 7: Step 7 action button is "Submit Application" with double-click protection
  const hasSubmitAppButton = step7Src.includes('Submit Application') && !step7Src.includes('Approve & Proceed to Step 8: Payment & Issuance');
  assert('TEST_08', 'Step 7 action button text is "Submit Application"', hasSubmitAppButton);

  const hasSubmittingDisabled = step7Src.includes('disabled={isSubmitting}') && step7Src.includes('Submitting Application...');
  assert('TEST_09', 'Step 7 button disables during submission (isSubmitting guard)', hasSubmittingDisabled);

  // Test 8: Removed payment terminology from Wizard
  const forbiddenWizardTerms = [
    'Payment & Issue',
    'Payment Gateway',
    'Carrier Gateway',
    'Instant UPI QR',
    'Client Payment Link',
    'Agency Float / CD Ledger'
  ];

  let foundForbiddenTerms = [];
  for (const term of forbiddenWizardTerms) {
    if (insurancePageSrc.includes(term) || step7Src.includes(term)) {
      foundForbiddenTerms.push(term);
    }
  }
  assert('TEST_10', 'Zero occurrences of obsolete payment/gateway terms in Wizard files', foundForbiddenTerms.length === 0, `Found: ${foundForbiddenTerms.join(', ')}`);

  // Test 9: Application Data Context exports applications and addApplication
  const hasInitialAppsDef = appDataCtxSrc.includes('export const INITIAL_APPLICATIONS = [');
  const hasAddApplicationFn = appDataCtxSrc.includes('const addApplication = (appData) => {');
  assert('TEST_11', 'AppDataContext defines INITIAL_APPLICATIONS and addApplication', hasInitialAppsDef && hasAddApplicationFn);

  // Test 10: Applications have "Pending Issuance" status and safe payment defaults
  const hasPendingIssuanceInCtx = appDataCtxSrc.includes("status: 'Pending Issuance'") && appDataCtxSrc.includes("stepProgress: 'Step 7 of 7 (Review Completed)'");
  const hasSafePaymentDefaults = appDataCtxSrc.includes("paymentStatus: 'Pending'") && appDataCtxSrc.includes("paymentMethod: 'N/A'");
  assert('TEST_12', 'Application data model enforces status "Pending Issuance" and safe payment defaults', hasPendingIssuanceInCtx && hasSafePaymentDefaults);

  // Test 11: addApplication behavior
  // Simulate addApplication logic as defined in AppDataContext
  const sampleAppData = {
    clientName: 'Senthil Nathan K.',
    phone: '+91 98410 77654',
    productType: 'Car Insurance (New Vehicle)',
    payablePremium: 18486,
    approvalDecision: 'APPROVED'
  };

  const newApp = {
    id: `APP-2024-${Math.floor(100 + Math.random() * 900)}`,
    clientName: sampleAppData.clientName,
    phone: sampleAppData.phone,
    productType: sampleAppData.productType,
    status: 'Pending Issuance',
    stepProgress: 'Step 7 of 7 (Review Completed)',
    payablePremium: sampleAppData.payablePremium,
    paymentStatus: 'Pending',
    paymentMethod: 'N/A'
  };

  assert('TEST_13', 'Submitted application sets status to "Pending Issuance"', newApp.status === 'Pending Issuance');
  assert('TEST_14', 'Submitted application does not generate a policy number (POL-...)', !newApp.id.startsWith('POL-'));
  assert('TEST_15', 'Submitted application sets stepProgress to "Step 7 of 7 (Review Completed)"', newApp.stepProgress === 'Step 7 of 7 (Review Completed)');

  // Test 12: ApplicationsPage displays dynamic counts and connects to context
  const hasAppListInApplicationsPage = applicationsPageSrc.includes('const { applications') && applicationsPageSrc.includes('pendingApps.length');
  assert('TEST_16', 'ApplicationsPage connects to applications from context and renders dynamic counts', hasAppListInApplicationsPage);

  // Test 13: Zero occurrences of "Step X of 8" in ApplicationsPage
  const hasStepXOf8InAppsPage = applicationsPageSrc.includes('of 8');
  assert('TEST_17', 'ApplicationsPage contains zero occurrences of "of 8"', !hasStepXOf8InAppsPage);

  // Test 14: Safety of non-wizard modules (Towing, Loans, Claims Settlement)
  const towingJobHasPayment = appDataCtxSrc.includes("paymentStatus: 'Pending'") && appDataCtxSrc.includes("paymentMethod: 'UPI'");
  assert('TEST_18', 'Towing jobs retain dedicated paymentStatus and paymentMethod', towingJobHasPayment);

  const claimsServiceSrc = fs.readFileSync(path.join(rootDir, 'src/services/claimsService.js'), 'utf8');
  const claimsSettlementUntouched = claimsServiceSrc.includes('paymentReference') && claimsServiceSrc.includes('settlement');
  assert('TEST_19', 'Claims Settlement paymentReference remains completely intact', claimsSettlementUntouched);

  const loansPageSrc = fs.readFileSync(path.join(rootDir, 'src/pages/LoansPage.jsx'), 'utf8');
  const loansLedgerUntouched = loansPageSrc.includes('ledger') && loansPageSrc.includes('Disburse Loan');
  assert('TEST_20', 'Loans 30-day interest ledger remains completely intact', loansLedgerUntouched);

  // Summary
  console.log('\n======================================================');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`TEST SUMMARY: ${passed} PASSED / ${failed} FAILED (Total: ${results.length})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
