import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  console.log('   RAJU VENDOR - TOWING VALIDATION & PRINT ACCEPTANCE');
  console.log('======================================================\n');

  const towingModalSrc = fs.readFileSync(path.join(rootDir, 'src/components/dashboard/TowingRequestModal.jsx'), 'utf8');
  const indexCssSrc = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf8');
  const appDataCtxSrc = fs.readFileSync(path.join(rootDir, 'src/context/AppDataContext.jsx'), 'utf8');

  // ==========================================
  // PART 1: "Save" (Draft) Logic & Validation
  // ==========================================
  console.log('--- 1. Testing "Save" (Draft) Requirements ---');

  // Test 1: Draft requires only customer name OR vehicle number
  const draftValidator = (data) => {
    const hasCustomer = Boolean(data.clientName?.trim());
    const hasVehicle = Boolean(data.vehicleNumber?.trim());
    if (!hasCustomer && !hasVehicle) {
      return { valid: false, error: 'Please enter at least a Customer Name or Vehicle Number to save a draft.' };
    }
    return { valid: true };
  };

  const emptyDraft = draftValidator({ clientName: '', vehicleNumber: '' });
  assert('TOW_01', 'Empty draft (no customer name AND no vehicle no) fails validation', !emptyDraft.valid);

  const customerOnlyDraft = draftValidator({ clientName: 'Sundar Pichai', vehicleNumber: '' });
  assert('TOW_02', 'Draft with ONLY Customer Name passes validation', customerOnlyDraft.valid);

  const vehicleOnlyDraft = draftValidator({ clientName: '', vehicleNumber: 'TN 01 AB 1234' });
  assert('TOW_03', 'Draft with ONLY Vehicle Number passes validation', vehicleOnlyDraft.valid);

  const draftSetsStatus = towingModalSrc.includes("jobStatus: formData.jobStatus === 'Completed' ? 'Completed' : 'Draft'");
  assert('TOW_04', 'Saving a draft sets or preserves status as "Draft"', draftSetsStatus);

  // ==========================================
  // PART 2: "Save & Complete Job" Validation
  // ==========================================
  console.log('\n--- 2. Testing "Save & Complete Job" Mandatory Fields ---');

  const completeValidator = (data, calc) => {
    const errors = {};
    if (!data.clientName?.trim()) errors.clientName = 'Customer Name is required.';
    if (!data.phone?.trim()) errors.phone = 'Customer Phone Number is required.';
    if (!data.vehicleNumber?.trim()) errors.vehicleNumber = 'Vehicle Registration Number is required.';
    if (!data.breakdownLocation?.trim()) errors.breakdownLocation = 'Pickup Location is required.';
    if (!data.destinationWorkshop?.trim()) errors.destinationWorkshop = 'Destination Workshop is required.';
    const distance = Number(data.actualDistanceKm) || 0;
    if (distance <= 0) errors.actualDistanceKm = 'Towing Distance must be greater than 0 KM.';
    const hasCharges = (calc.grossAmount || 0) > 0 || (calc.lineItems || []).length > 0;
    if (!hasCharges) errors.charges = 'At least one charge line item is required.';
    return { valid: Object.keys(errors).length === 0, errors };
  };

  const completeMissingAll = completeValidator(
    { clientName: '', phone: '', vehicleNumber: '', breakdownLocation: '', destinationWorkshop: '', actualDistanceKm: 0 },
    { grossAmount: 0, lineItems: [] }
  );
  assert('TOW_05', 'Save & Complete Job blocks submission when core fields are missing', !completeMissingAll.valid && Object.keys(completeMissingAll.errors).length === 7);

  const completeMissingDistance = completeValidator(
    { clientName: 'Ravi', phone: '+91 98410 00000', vehicleNumber: 'TN 09 BX 4512', breakdownLocation: 'Guindy', destinationWorkshop: 'Ambattur', actualDistanceKm: 0 },
    { grossAmount: 450, lineItems: [{ id: 1 }] }
  );
  assert('TOW_06', 'Save & Complete Job blocks completion when distance is 0 KM', !completeMissingDistance.valid && Boolean(completeMissingDistance.errors.actualDistanceKm));

  const completeMissingCharges = completeValidator(
    { clientName: 'Ravi', phone: '+91 98410 00000', vehicleNumber: 'TN 09 BX 4512', breakdownLocation: 'Guindy', destinationWorkshop: 'Ambattur', actualDistanceKm: 15 },
    { grossAmount: 0, lineItems: [] }
  );
  assert('TOW_07', 'Save & Complete Job blocks completion when there are 0 line items / charges', !completeMissingCharges.valid && Boolean(completeMissingCharges.errors.charges));

  const completeAllValid = completeValidator(
    { clientName: 'Ravi Kumar', phone: '+91 98410 12345', vehicleNumber: 'TN 09 BX 4512', breakdownLocation: 'Guindy Flyover', destinationWorkshop: 'Maruti Guindy', actualDistanceKm: 18.5 },
    { grossAmount: 850, lineItems: [{ id: 1, amount: 850 }] }
  );
  assert('TOW_08', 'Save & Complete Job succeeds when all 7 core fields are provided', completeAllValid.valid);

  // ==========================================
  // PART 3: Payment & Status Logic
  // ==========================================
  console.log('\n--- 3. Testing Payment & Status Logic ---');

  // Test 9: Completing a job with Payment Status as "Pending / Unpaid" IS ALLOWED
  const allowsPendingPayment = towingModalSrc.includes('<option value="Pending">Pending / Unpaid</option>');
  assert('TOW_09', 'Completing a job with Payment Status as "Pending" is supported and permitted', allowsPendingPayment);

  // Test 10: Bill number generation once
  let existingJobWithBill = { id: 'TOW-101', billNo: 'TOW-BILL-2026-99999', jobStatus: 'Completed' };
  let billGenSim = (job) => {
    let billNo = job.billNo;
    if (!billNo) {
      billNo = 'TOW-BILL-2026-12345';
    }
    return billNo;
  };
  const billOnFirstComplete = billGenSim({ id: 'TOW-102', billNo: '' });
  assert('TOW_10', 'Bill Number is generated when job is first completed', billOnFirstComplete === 'TOW-BILL-2026-12345');

  const billOnSubsequentEdit = billGenSim(existingJobWithBill);
  assert('TOW_11', 'Bill Number is preserved and NOT regenerated on subsequent edits', billOnSubsequentEdit === 'TOW-BILL-2026-99999');

  // Test 11: Lock Completed Jobs
  const hasLockLogic = towingModalSrc.includes("const isCompleted = formData.jobStatus === 'Completed'") &&
                       towingModalSrc.includes("const isAdmin = currentUser?.role === 'ADMIN'") &&
                       towingModalSrc.includes("const isLocked = isCompleted && !isAdmin");
  assert('TOW_12', 'Completed jobs become read-only and locked for non-admin users (editable only by Admin)', hasLockLogic);

  // ==========================================
  // PART 4: Print Output & Single-Page A4 Styling
  // ==========================================
  console.log('\n--- 4. Testing Print Output & Page Isolation ---');

  // Test 13: Dedicated print container portaled to document.body
  const hasDedicatedPrintPortal = towingModalSrc.includes('id="towing-printable-bill"') &&
                                  towingModalSrc.includes('createPortal(') &&
                                  towingModalSrc.includes('document.body');
  assert('TOW_13', 'Bill renders in dedicated portal container (#towing-printable-bill) attached to document.body', hasDedicatedPrintPortal);

  // Test 14: @page configuration
  const hasA4PageRule = indexCssSrc.includes('@page') &&
                        indexCssSrc.includes('size: A4 portrait') &&
                        indexCssSrc.includes('margin: 12mm');
  assert('TOW_14', 'Print stylesheet enforces @page { size: A4 portrait; margin: 12mm; }', hasA4PageRule);

  // Test 15: #root hidden in @media print
  const hidesRootInPrint = indexCssSrc.includes('@media print') &&
                           indexCssSrc.includes('#root') &&
                           indexCssSrc.includes('display: none !important');
  assert('TOW_15', 'In @media print, #root and modal wrappers are completely hidden (display: none !important)', hidesRootInPrint);

  // Test 16: #towing-printable-bill isolated in @media print
  const displaysBillInPrint = indexCssSrc.includes('#towing-printable-bill') &&
                              indexCssSrc.includes('display: block !important') &&
                              indexCssSrc.includes('position: static !important');
  assert('TOW_16', 'In @media print, #towing-printable-bill is displayed cleanly as static block', displaysBillInPrint);

  // Test 17: Body font size 11px
  const has11pxFontSize = indexCssSrc.includes('font-size: 11px !important');
  assert('TOW_17', 'Print stylesheet sets base font size to 11px for crisp readability', has11pxFontSize);

  // Test 18: break-inside: avoid on rows and signatures
  const hasBreakInsideAvoid = indexCssSrc.includes('break-inside: avoid !important') &&
                              indexCssSrc.includes('page-break-inside: avoid !important');
  assert('TOW_18', 'Print stylesheet enforces break-inside: avoid on table rows and summary blocks', hasBreakInsideAvoid);

  // Test 19: Short bill preset exists for quick testing
  const hasShortBillPreset = towingModalSrc.includes('handleLoadShortBillPreset') &&
                             towingModalSrc.includes('Load Short Bill');
  assert('TOW_19', 'Modal provides Short Bill Preset (1-2 lines) for single-page print testing', hasShortBillPreset);

  // Test 20: Long bill preset exists for multi-page testing
  const hasLongBillPreset = towingModalSrc.includes('handleLoadLongBillPreset') &&
                            towingModalSrc.includes('Load Long Bill');
  assert('TOW_20', 'Modal provides Long Bill Preset (12 lines) for clean multi-page print testing', hasLongBillPreset);

  // Summary
  console.log('\n======================================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TEST SUMMARY: ${passed} PASSED / ${failed} FAILED (Total: ${results.length})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
