import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { scanAndExtractDocument, DOCUMENT_TYPES, SAMPLE_DOCUMENTS } from '../src/services/documentScannerService.js';

console.log('======================================================');
console.log('   RAJU VENDOR - SMART PHOTO SCAN & AUTO-FILL TESTS');
console.log('======================================================\n');

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

async function runAsyncTest(testId, description, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`✔ [${testId}] ${description}`);
    passedCount++;
  } catch (err) {
    console.error(`✖ [${testId}] ${description}`);
    console.error(`   Error: ${err.message}`);
  }
}

async function main() {
  console.log('--- 1. Testing Document Scanner Service & Entities ---');

  await runAsyncTest('SCAN_01', 'Extracts complete RC book entities (Vehicle, Customer, Phone, Policy)', async () => {
    const rcDoc = SAMPLE_DOCUMENTS.find(d => d.docType === DOCUMENT_TYPES.RC_BOOK);
    assert.ok(rcDoc, 'RC preset not found');
    const res = await scanAndExtractDocument({ name: rcDoc.fileName, presetId: rcDoc.id }, { delay: 0 });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.documentType, DOCUMENT_TYPES.RC_BOOK);
    assert.strictEqual(res.data.vehicleNumber, 'TN 09 BX 4512');
    assert.strictEqual(res.data.customerName, 'R. Karthikeyan');
    assert.strictEqual(res.data.phone, '9841234567');
    assert.strictEqual(res.data.policyNumber, 'POL-2024-8891');
  });

  await runAsyncTest('SCAN_02', 'Extracts complete Policy Schedule entities (Policy #, Insurer, Premium, Expiry)', async () => {
    const polDoc = SAMPLE_DOCUMENTS.find(d => d.id === 'sample-policy-1');
    assert.ok(polDoc, 'Policy preset not found');
    const res = await scanAndExtractDocument({ name: polDoc.fileName, presetId: polDoc.id }, { delay: 0 });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.policyNumber, 'POL-2024-8842');
    assert.strictEqual(res.data.insuranceCompany, 'ICICI Lombard');
    assert.strictEqual(res.data.customerName, 'S. Rajasekaran');
    assert.strictEqual(res.data.vehicleNumber, 'TN 10 AP 5432');
  });

  await runAsyncTest('SCAN_03', 'Extracts Breakdown Spot photo entities (Location, Workshop, Distance)', async () => {
    const spotDoc = SAMPLE_DOCUMENTS.find(d => d.docType === DOCUMENT_TYPES.BREAKDOWN_SPOT);
    assert.ok(spotDoc, 'Spot preset not found');
    const res = await scanAndExtractDocument({ name: spotDoc.fileName, presetId: spotDoc.id }, { delay: 0 });
    assert.strictEqual(res.success, true);
    assert.ok(res.data.breakdownLocation.includes('GST Road'));
    assert.ok(res.data.destinationWorkshop.includes('ABT Maruti'));
    assert.strictEqual(res.data.vehicleNumber, 'TN 22 CE 8821');
    assert.strictEqual(res.data.actualDistanceKm, 18);
  });

  await runAsyncTest('SCAN_04', 'Custom file extraction regex detects vehicle number from filename', async () => {
    const res = await scanAndExtractDocument({ name: 'Accident_Damage_TN-09-BX-4512_Front.png' }, { delay: 0 });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.vehicleNumber, 'TN 09 BX 4512');
  });

  console.log('\n--- 2. Testing Claim Form (RegisterNewClaimModal) Integration ---');

  const claimModalCode = fs.readFileSync('src/components/claims/RegisterNewClaimModal.jsx', 'utf8');

  runTest('CLAIM_01', 'RegisterNewClaimModal imports DocumentScanDropzone and scanner service', () => {
    assert.ok(claimModalCode.includes('DocumentScanDropzone'), 'DocumentScanDropzone import missing');
    assert.ok(claimModalCode.includes('scanAndExtractDocument'), 'scanAndExtractDocument import missing');
  });

  runTest('CLAIM_02', 'RegisterNewClaimModal implements handleScanComplete with core field auto-fill', () => {
    assert.ok(claimModalCode.includes('handleScanComplete'), 'handleScanComplete missing');
    assert.ok(claimModalCode.includes('customerName'), 'customerName auto-fill missing');
    assert.ok(claimModalCode.includes('mobile'), 'mobile auto-fill missing');
    assert.ok(claimModalCode.includes('vehicleNo'), 'vehicleNo auto-fill missing');
    assert.ok(claimModalCode.includes('policyNo'), 'policyNo auto-fill missing');
    assert.ok(claimModalCode.includes('insuranceCompany'), 'insuranceCompany auto-fill missing');
  });

  runTest('CLAIM_03', 'RegisterNewClaimModal renders DocumentScanDropzone in modal UI', () => {
    assert.ok(claimModalCode.includes('<DocumentScanDropzone'), 'DocumentScanDropzone not rendered in JSX');
    assert.ok(claimModalCode.includes('onScanComplete={handleScanComplete}'), 'onScanComplete prop missing');
  });

  console.log('\n--- 3. Testing Towing Request Modal Integration ---');

  const towingModalCode = fs.readFileSync('src/components/dashboard/TowingRequestModal.jsx', 'utf8');

  runTest('TOW_01', 'TowingRequestModal imports and renders DocumentScanDropzone in Tab 1 and Tab 4', () => {
    assert.ok(towingModalCode.includes('DocumentScanDropzone'), 'DocumentScanDropzone import missing in TowingRequestModal');
    const matches = towingModalCode.match(/<DocumentScanDropzone/g);
    assert.ok(matches && matches.length >= 2, `Expected at least 2 dropzone renders in tabs, found ${matches?.length}`);
  });

  runTest('TOW_02', 'TowingRequestModal handleScanComplete auto-fills Client, Vehicle, Location & Workshop', () => {
    assert.ok(towingModalCode.includes('handleScanComplete'), 'handleScanComplete missing in TowingRequestModal');
    assert.ok(towingModalCode.includes('breakdownLocation'), 'breakdownLocation auto-fill missing');
    assert.ok(towingModalCode.includes('destinationWorkshop'), 'destinationWorkshop auto-fill missing');
    assert.ok(towingModalCode.includes('clientName'), 'clientName auto-fill missing');
    assert.ok(towingModalCode.includes('vehicleNumber'), 'vehicleNumber auto-fill missing');
  });

  console.log('\n--- 4. Testing Renewals Page Integration ---');

  const renewalsCode = fs.readFileSync('src/pages/RenewalsPage.jsx', 'utf8');

  runTest('REN_01', 'RenewalsPage imports and renders DocumentScanDropzone for quick renewal scan', () => {
    assert.ok(renewalsCode.includes('DocumentScanDropzone'), 'DocumentScanDropzone import missing in RenewalsPage');
    assert.ok(renewalsCode.includes('<DocumentScanDropzone'), 'DocumentScanDropzone not rendered in RenewalsPage');
  });

  runTest('REN_02', 'RenewalsPage handleRenewalScanComplete matches policy and triggers renewal modal', () => {
    assert.ok(renewalsCode.includes('handleRenewalScanComplete'), 'handleRenewalScanComplete missing');
    assert.ok(renewalsCode.includes('openRenewModal(targetPolicy)'), 'openRenewModal not called on match');
    assert.ok(renewalsCode.includes('setSearchInputValue'), 'setSearchInputValue missing');
  });

  runTest('REN_03', 'Execute Policy Renewal modal provides internal scan for endorsement/renewal verification', () => {
    assert.ok(renewalsCode.includes('Scan Renewal Document / Endorsement'), 'Endorsement scan missing in renewal modal');
  });

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED / ${totalCount - passedCount} FAILED (Total: ${totalCount})`);
  console.log('======================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
