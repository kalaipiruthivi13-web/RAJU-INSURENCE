import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('======================================================');
console.log('   RAJU VENDOR - TOWING CLEANUP & INR ACCEPTANCE TESTS');
console.log('======================================================\n');

const modalCode = fs.readFileSync('src/components/dashboard/TowingRequestModal.jsx', 'utf8');
const modalUiCode = fs.readFileSync('src/components/ui/Modal.jsx', 'utf8');

let passedCount = 0;
let totalCount = 0;

function runTest(testId, description, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✔ [${testId}] ${description}`);
    passedCount++;
  } catch (err) {
    console.error(`✖ [${testId}] ${description}`);
    console.error(`   Error: ${err.message}`);
  }
}

// ------------------------------------------------------------------
// 1. CURRENCY & RUPEE TESTS
// ------------------------------------------------------------------
console.log('--- 1. Testing Currency & Rupee Standardization ---');

runTest('CURR_01', 'DollarSign icon is completely removed from TowingRequestModal', () => {
  assert.strictEqual(modalCode.includes('DollarSign'), false, 'Found DollarSign in TowingRequestModal');
});

runTest('CURR_02', 'IndianRupee icon is imported from lucide-react', () => {
  assert.strictEqual(modalCode.includes('IndianRupee'), true, 'IndianRupee icon missing');
});

runTest('CURR_03', 'Charges tab uses IndianRupee icon', () => {
  const chargesTabDef = modalCode.match(/id:\s*'CHARGES'[^}]+icon:\s*(\w+)/);
  assert.ok(chargesTabDef, 'Could not locate CHARGES tab definition');
  assert.strictEqual(chargesTabDef[1], 'IndianRupee', 'CHARGES tab does not use IndianRupee icon');
});

runTest('CURR_04', 'Zero occurrences of USD or dollar in UI strings', () => {
  const matches = modalCode.match(/\b(USD|dollar)\b/gi);
  assert.strictEqual(matches, null, `Found obsolete currency terms: ${matches}`);
});

runTest('CURR_05', 'Shared formatINR currency formatter is implemented', () => {
  assert.ok(modalCode.includes('export const formatINR'), 'formatINR formatter is not exported');
  assert.ok(modalCode.includes("currency: 'INR'"), 'formatINR does not configure INR currency');
  assert.ok(modalCode.includes("'en-IN'"), 'formatINR does not configure en-IN locale');
});

runTest('CURR_06', 'formatINR formats values with rupee sign and Indian groupings', () => {
  const fmt = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val);
  assert.strictEqual(fmt(125000.5), '₹1,25,000.50');
  assert.strictEqual(fmt(450), '₹450.00');
});

// ------------------------------------------------------------------
// 2. DUPLICATE REMOVAL TESTS
// ------------------------------------------------------------------
console.log('\n--- 2. Testing Duplicate Removal ---');

runTest('DUP_01', 'Exactly ONE Save (Draft) button exists in the whole modal', () => {
  // Count Button tags or text with Save (Draft)
  const matches = modalCode.match(/Save\s*\(\s*Draft\s*\)/g);
  // Should appear only once as a button in the footer
  assert.strictEqual(matches ? matches.length : 0, 1, `Expected exactly 1 Save (Draft) occurrence, found ${matches?.length}`);
});

runTest('DUP_02', 'Exactly ONE Save & Complete Job button exists in the whole modal', () => {
  const matches = modalCode.match(/<Button[^>]*>[\s\S]*?Save\s*&\s*Complete\s*Job[\s\S]*?<\/Button>/g);
  assert.strictEqual(matches ? matches.length : 0, 1, `Expected exactly 1 Save & Complete Job button, found ${matches?.length}`);
});

runTest('DUP_03', 'Exactly ONE Close button in modal footer', () => {
  const footerCode = modalCode.match(/footer=\{[\s\S]*?<\/[M|m]odal>/);
  assert.ok(footerCode, 'Could not extract footer block');
  const closeMatches = footerCode[0].match(/<Button[^>]*>[\s\S]*?Close[\s\S]*?<\/Button>/g);
  assert.strictEqual(closeMatches ? closeMatches.length : 0, 1, `Expected 1 Close button in footer, found ${closeMatches?.length}`);
});

runTest('DUP_04', 'Demo quick presets (Load Short Bill / Load Long Bill) are removed', () => {
  assert.strictEqual(modalCode.includes('handleLoadShortBillPreset'), false, 'Found handleLoadShortBillPreset');
  assert.strictEqual(modalCode.includes('handleLoadLongBillPreset'), false, 'Found handleLoadLongBillPreset');
  assert.strictEqual(modalCode.includes('Load Short Bill'), false, 'Found Load Short Bill text');
  assert.strictEqual(modalCode.includes('Load Long Bill'), false, 'Found Load Long Bill text');
});

runTest('DUP_05', 'In-tab redundant bottom navigation rows removed from tab panels', () => {
  assert.strictEqual(modalCode.includes('Proceed to Towing Details'), false, 'Found redundant Proceed to Towing Details');
  assert.strictEqual(modalCode.includes('Proceed to Charges'), false, 'Found redundant Proceed to Charges');
  assert.strictEqual(modalCode.includes('Proceed to Documents'), false, 'Found redundant Proceed to Documents');
  assert.strictEqual(modalCode.includes('Proceed to Billing'), false, 'Found redundant Proceed to Billing');
});

// ------------------------------------------------------------------
// 3. FOOTER & MODAL LAYOUT TESTS
// ------------------------------------------------------------------
console.log('\n--- 3. Testing Footer & Modal Layout ---');

runTest('LAYOUT_01', 'Modal dialog container uses flex flex-col and max-h constraint', () => {
  assert.ok(modalUiCode.includes('flex flex-col'), 'Modal does not use flex flex-col');
  assert.ok(modalUiCode.includes('max-h-[90vh]'), 'Modal does not set max-h-[90vh]');
  assert.ok(modalUiCode.includes('overflow-y-auto flex-1 min-h-0'), 'Modal body is not flex-1 min-h-0 overflow-y-auto');
  assert.ok(modalUiCode.includes('shrink-0'), 'Header or footer not marked shrink-0');
});

runTest('LAYOUT_02', 'Status badge and Bill number moved out of footer into headerAction', () => {
  // Footer should NOT contain Status: or Bill #
  const footerBlock = modalCode.match(/footer=\{([\s\S]*?)\}/);
  assert.ok(footerBlock, 'Could not find footer block');
  assert.strictEqual(footerBlock[1].includes('Status:'), false, 'Footer still contains Status: badge');
  assert.strictEqual(footerBlock[1].includes('Bill #'), false, 'Footer still contains Bill # badge');

  // headerAction should contain Status badge and Bill #
  assert.ok(modalCode.includes('headerAction={'), 'headerAction prop not passed to Modal');
  assert.ok(modalCode.includes('Status: {formData.jobStatus}'), 'Status badge missing from header');
});

runTest('LAYOUT_03', 'Footer displays Back and Next on tabs 1 to 5 (Back hidden on Tab 1)', () => {
  assert.ok(modalCode.includes('handlePrevTab'), 'handlePrevTab missing');
  assert.ok(modalCode.includes('handleNextTab'), 'handleNextTab missing');
  assert.ok(modalCode.includes('activeTabIndex > 0'), 'Back button guard activeTabIndex > 0 missing');
  assert.ok(modalCode.includes('!isLastTab'), 'Next button guard !isLastTab missing');
});

runTest('LAYOUT_04', 'Footer displays Close, Save (Draft) and Save & Complete on the LAST tab only', () => {
  assert.ok(modalCode.includes('isLastTab'), 'isLastTab missing');
});

runTest('LAYOUT_05', 'Unsaved changes confirmation implemented before closing', () => {
  assert.ok(modalCode.includes('isDirty'), 'isDirty tracking missing');
  assert.ok(modalCode.includes('initialSnapshotRef'), 'initialSnapshotRef missing');
  assert.ok(modalCode.includes('Discard changes?'), 'Discard changes prompt missing');
});

// ------------------------------------------------------------------
// 4. 6-TAB STRUCTURE & RESPONSIVENESS TESTS
// ------------------------------------------------------------------
console.log('\n--- 4. Testing 6-Tab Structure & Responsiveness ---');

runTest('TAB_01', 'TOWING_TABS defines exactly 6 structured tabs', () => {
  const tabsMatch = modalCode.match(/export const TOWING_TABS = \[([\s\S]*?)\];/);
  assert.ok(tabsMatch, 'Could not locate TOWING_TABS definition');
  const ids = Array.from(tabsMatch[1].matchAll(/id:\s*'([A-Z]+)'/g)).map(m => m[1]);
  assert.deepStrictEqual(ids, ['REQUEST', 'DETAILS', 'CHARGES', 'DOCS', 'PAYMENT', 'BILLING']);
  assert.strictEqual(ids.length, 6, 'Expected exactly 6 tabs');
});

runTest('TAB_02', 'Tabs provide both fullLabel and shortLabel for responsive display', () => {
  assert.ok(modalCode.includes('fullLabel:'), 'fullLabel missing');
  assert.ok(modalCode.includes('shortLabel:'), 'shortLabel missing');
  assert.ok(modalCode.includes('hidden sm:inline'), 'sm:inline responsive class missing');
  assert.ok(modalCode.includes('sm:hidden'), 'sm:hidden responsive class missing');
});

runTest('TAB_03', 'Tab bar is horizontally scrollable with active tab auto-scroll into view', () => {
  assert.ok(modalCode.includes('overflow-x-auto'), 'overflow-x-auto missing from tab container');
  assert.ok(modalCode.includes('scrollIntoView'), 'scrollIntoView missing for active tab auto-scroll');
});

// ------------------------------------------------------------------
// 5. PRINT PORTAL ISOLATION
// ------------------------------------------------------------------
console.log('\n--- 5. Testing Print Portal Isolation ---');

runTest('PRINT_01', 'Print container remains portaled directly to document.body', () => {
  assert.ok(modalCode.includes("createPortal("), 'createPortal missing');
  assert.ok(modalCode.includes("id=\"towing-printable-bill\""), 'towing-printable-bill container missing');
  assert.ok(modalCode.includes("document.body"), 'document.body portal target missing');
});

runTest('PRINT_02', 'Print container amounts formatted via formatINR with zero $ signs', () => {
  const printPortalCode = modalCode.match(/id="towing-printable-bill"[\s\S]*?document\.body/);
  assert.ok(printPortalCode, 'Could not extract printable bill portal');
  assert.ok(printPortalCode[0].includes('formatINR('), 'formatINR not used in printable bill');
  assert.strictEqual(/\$(?!\s*\{)/.test(printPortalCode[0]), false, 'Found $ currency symbol in printable bill');
});

console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passedCount} PASSED / ${totalCount - passedCount} FAILED (Total: ${totalCount})`);
console.log('======================================================\n');

if (passedCount !== totalCount) {
  process.exit(1);
}
