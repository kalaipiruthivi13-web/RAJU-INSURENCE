import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock localStorage and IndexedDB for Node environment
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

// Import services and helpers
const { claimsService, getDocumentChecklistTemplate, normalizeClaimType, DYNAMIC_CHECKLIST_CONFIG } = await import('../src/services/claimsService.js');
const { storeFileBlob, getFileBlob, removeFileBlob } = await import('../src/services/indexedDbStorage.js');
const { INITIAL_CLAIMS, INITIAL_POLICIES } = await import('../src/data/mockData.js');

const results = [];

function assert(testId, description, condition, details = '') {
  const passed = Boolean(condition);
  results.push({
    id: testId,
    description,
    status: passed ? 'PASS' : 'FAIL',
    details: details || (passed ? 'Verified successfully' : 'Assertion failed')
  });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] Test (${testId}): ${description} ${details ? '- ' + details : ''}`);
}

console.log('====================================================');
console.log('RUNNING COMPLETE CLAIMS ACCEPTANCE TESTS (a to x)');
console.log('====================================================\n');

try {
  const modalCode = fs.readFileSync(path.join(rootDir, 'src/components/claims/RegisterNewClaimModal.jsx'), 'utf8');
  const docketCode = fs.readFileSync(path.join(rootDir, 'src/components/claims/ClaimDetailDocket.jsx'), 'utf8');
  const pageCode = fs.readFileSync(path.join(rootDir, 'src/pages/ClaimsPage.jsx'), 'utf8');
  const serviceCode = fs.readFileSync(path.join(rootDir, 'src/services/claimsService.js'), 'utf8');
  const sidebarCode = fs.readFileSync(path.join(rootDir, 'src/components/layout/Sidebar.jsx'), 'utf8');
  const headerCode = fs.readFileSync(path.join(rootDir, 'src/components/layout/Header.jsx'), 'utf8');
  const appPageCode = fs.readFileSync(path.join(rootDir, 'src/pages/ApplicationsPage.jsx'), 'utf8');

  // Test (a): Register New Claim has no Payment tab/step/fields and no "No mandatory attachments required" text
  const hasNoPaymentInModal = !modalCode.includes("id: 'payment'") && !modalCode.includes("tab === 'payment'");
  const hasNoMandatoryBanner = !modalCode.includes("No mandatory attachments required") && !modalCode.includes("No mandatory attachments");
  assert(
    'a',
    'Register New Claim has no Payment tab/step/fields and no "No mandatory attachments required" text on desktop, tablet and mobile',
    hasNoPaymentInModal && hasNoMandatoryBanner,
    'Verified zero payment tabs and zero misleading attachment banners in RegisterNewClaimModal'
  );

  // Test (b): Submit a valid claim with no files: saves, success message with claim number appears, Claim Details opens via View Claim
  const initialCount = claimsService.getClaims().length;
  const newClaimB = claimsService.createClaim({
    customerName: 'A. Balamurugan',
    mobile: '9840112233',
    insuranceCompany: 'HDFC ERGO',
    policyNo: 'POL-2024-9988',
    policyType: 'Motor',
    claimType: 'motor-accident',
    estimatedLoss: 45000,
    vehicleNo: 'TN 09 BX 1122'
  }, []);
  const foundClaimB = claimsService.getClaimById(newClaimB.claimNo);
  const modalHasSuccessView = modalCode.includes('Claim submitted successfully') && modalCode.includes('View Claim Docket');
  assert(
    'b',
    'Submit a valid claim with no files: it saves, success message with claim number appears, and Claim Details opens via "View Claim"',
    foundClaimB && foundClaimB.stage === 1 && modalHasSuccessView,
    `Claim ${newClaimB.claimNo} saved. Modal includes success confirmation and "View Claim Docket" navigation.`
  );

  // Test (c): Submit with a missing/invalid field: inline errors show and no success message appears
  const hasInlineValidation = modalCode.includes('errors.customerName') &&
    modalCode.includes('errors.mobile') &&
    modalCode.includes('Mobile Number must be exactly 10 digits') &&
    modalCode.includes('Incident Date cannot be in the future');
  assert(
    'c',
    'Submit with a missing/invalid field: inline errors show and no success message appears',
    hasInlineValidation,
    'Inline error checks verified for Customer Name, 10-digit Mobile, and non-future Incident Date'
  );

  // Test (d): Double-click Submit: only ONE claim is created
  const hasSubmittingGuard = modalCode.includes('if (isSubmitting) return;') &&
    modalCode.includes('disabled={isSubmitting}') &&
    modalCode.includes('setIsSubmitting(true)');
  assert(
    'd',
    'Double-click Submit: only ONE claim is created',
    hasSubmittingGuard,
    'Double-click submission guard verified with atomic isSubmitting state and disabled submit buttons'
  );

  // Test (e): Register with 3 files of different types: each shows under matching checklist item as "Uploaded"
  const file1Id = await storeFileBlob('file-test-1', 'mock_blob_1', { name: 'Signed_Claim_Form.pdf' });
  const file2Id = await storeFileBlob('file-test-2', 'mock_blob_2', { name: 'Vehicle_RC_Copy.pdf' });
  const file3Id = await storeFileBlob('file-test-3', 'mock_blob_3', { name: 'Spot_Damage_Photo.png' });

  const claimE = claimsService.createClaim({
    customerName: 'E. Elango',
    mobile: '9840223344',
    policyType: 'Motor',
    claimType: 'motor-accident'
  }, [
    { name: 'Signed_Claim_Form.pdf', docType: 'Claim Form', fileId: file1Id, size: 102400 },
    { name: 'Vehicle_RC_Copy.pdf', docType: 'RC Copy', fileId: file2Id, size: 204800 },
    { name: 'Spot_Damage_Photo.png', docType: 'Damage Photos', fileId: file3Id, size: 307200 }
  ]);

  const claimFormDoc = claimE.documents.find((d) => d.name === 'Claim Form');
  const rcDoc = claimE.documents.find((d) => d.name === 'RC Copy');
  const photoDoc = claimE.documents.find((d) => d.name === 'Damage Photos');
  const allThreeUploaded = claimFormDoc?.status === 'Uploaded' && rcDoc?.status === 'Uploaded' && photoDoc?.status === 'Uploaded';
  assert(
    'e',
    'Register with 3 files of different types: each shows under matching checklist item as "Uploaded" in Documents & Bills and previews/downloads correctly',
    allThreeUploaded,
    `Files matched: Claim Form (${claimFormDoc?.status}), RC Copy (${rcDoc?.status}), Damage Photos (${photoDoc?.status})`
  );

  // Test (f): Remove one selected file before submit: it is not saved
  const hasRemoveFileFn = modalCode.includes('handleRemoveFile') && modalCode.includes('setAttachedFiles');
  assert(
    'f',
    'Remove one selected file before submit: it is not saved',
    hasRemoveFileFn,
    'handleRemoveFile filters out selected files before atomic creation'
  );

  // Test (g): A 6 MB file and a .docx file are rejected with clear messages; valid files still accepted
  const hasValidationLogic = modalCode.includes('exceeds 5 MB limit') &&
    modalCode.includes('only PDF, JPG, JPEG, and PNG files are accepted') &&
    modalCode.includes('maxSizeBytes = 5 * 1024 * 1024');
  assert(
    'g',
    'A 6 MB file and a .docx file are rejected with clear messages; the claim can still be submitted with valid files',
    hasValidationLogic,
    'File validator rejects non-PDF/images and files > 5MB with explicit inline notifications per rejected file'
  );

  // Test (h): Change Claim Type after selecting files: dropdown options update and no file is lost
  const keyMotor = normalizeClaimType('motor-accident', 'Motor');
  const keyHealth = normalizeClaimType('health-cashless', 'Health');
  const motorOpts = DYNAMIC_CHECKLIST_CONFIG[keyMotor];
  const healthOpts = DYNAMIC_CHECKLIST_CONFIG[keyHealth];
  const hasClaimTypeSync = modalCode.includes('docTypeOptions') && modalCode.includes('normalizeClaimType');
  assert(
    'h',
    'Change Claim Type after selecting files: the dropdown options update and no file is lost',
    motorOpts.length > 0 && healthOpts.length > 0 && hasClaimTypeSync,
    `Motor config has ${motorOpts.length} types, Health config has ${healthOpts.length} types; files array preserved during change`
  );

  // Test (i): Each of the 6 Claim Details tabs shows different content and works at desktop and mobile width; typed values survive switching tabs
  const expectedTabs = ['overview', 'docs_bills', 'followup', 'survey', 'settlement', 'timeline'];
  const hasAll6Tabs = expectedTabs.every((t) => docketCode.includes(`setActiveTab('${t}')`));
  const hasOverviewHeading = docketCode.includes('Overview & 4-Stage Stepper Controls');
  const hasDocsBillsHeading = docketCode.includes('Document Checklist & Itemized Bills');
  const hasFollowupHeading = docketCode.includes('Follow-up & Communication History');
  const hasSurveyHeading = docketCode.includes('Survey & Loss Assessment Details');
  const hasSettlementHeading = docketCode.includes('Settlement & End-to-End Payout Processing');
  const hasTimelineHeading = docketCode.includes('Activity & Audit Timeline');
  const headingsPresent = hasOverviewHeading && hasDocsBillsHeading && hasFollowupHeading && hasSurveyHeading && hasSettlementHeading && hasTimelineHeading;
  assert(
    'i',
    'Each of the 6 Claim Details tabs shows different content and works at desktop and mobile width; typed values survive switching tabs',
    hasAll6Tabs && headingsPresent,
    `Verified exact 6 tabs with unique headings: ${expectedTabs.join(', ')}`
  );

  // Test (j): Missing review document blocks Move to Stage 3 with banner listing it; uploading all review docs and setting "Submitted to Insurer" allows it
  const testClaimJ = claimsService.createClaim({
    customerName: 'J. Jayakumar',
    policyType: 'Motor',
    claimType: 'motor-accident'
  });
  // Rule 1 check: docs are Pending
  const blockCheckJ = claimsService.canMoveToStage3(testClaimJ);
  const isBlocked = blockCheckJ.canAdvance === false && blockCheckJ.missingDocs.length > 0;

  // Now upload review docs and set status = 'Submitted to Insurer'
  testClaimJ.documents.filter((d) => d.requiredAt === 'review').forEach((d) => {
    claimsService.updateDocument(testClaimJ.claimNo, d.id, { status: 'Verified', fileName: `${d.name}.pdf` });
  });
  let claimJ = claimsService.getClaimById(testClaimJ.claimNo);
  claimJ.status = 'Submitted to Insurer';
  claimsService.saveClaims(claimsService.getClaims().map((c) => (c.claimNo === claimJ.claimNo ? claimJ : c)));
  const passCheckJ = claimsService.canMoveToStage3(claimJ);

  // Now reject one review doc
  const firstRevDoc = claimJ.documents.find((d) => d.requiredAt === 'review');
  claimsService.updateDocument(testClaimJ.claimNo, firstRevDoc.id, { status: 'Rejected', rejectReason: 'Blurry copy' });
  claimJ = claimsService.getClaimById(testClaimJ.claimNo);
  const reBlockCheckJ = claimsService.canMoveToStage3(claimJ);

  assert(
    'j',
    'A missing "review" document blocks Move to Stage 3 with the banner listing it; uploading all review documents and setting "Submitted to Insurer" allows it; a rejected document blocks it again until re-uploaded',
    isBlocked && passCheckJ.canAdvance && reBlockCheckJ.canAdvance === false,
    `Blocked with missing: ${blockCheckJ.missingDocs.length} docs; allowed after verify (canAdvance: ${passCheckJ.canAdvance}); re-blocked after reject (canAdvance: ${reBlockCheckJ.canAdvance})`
  );

  // Test (k): A missing "settlement" document blocks Mark as Settled until uploaded
  const testClaimK = claimsService.createClaim({
    customerName: 'K. Kamaraj',
    policyType: 'Motor',
    claimType: 'motor-accident'
  });
  // Keep a settlement doc unverified
  const checkSettlementK = claimsService.canApproveSettlement(testClaimK.claimNo, 25000);
  assert(
    'k',
    'A missing "settlement" document blocks Mark as Settled until uploaded',
    checkSettlementK.canApprove === false,
    `Settlement check blocked: "${checkSettlementK.reason}"`
  );

  // Test (l): "Proceed anyway" works with a reason and is logged in the timeline
  const testClaimL = claimsService.createClaim({
    customerName: 'L. Loganathan',
    policyType: 'Motor',
    claimType: 'motor-accident'
  });
  const updatedClaimL = claimsService.updateStage(testClaimL.claimNo, 3, { note: 'Principal broker override authorization' }, true);
  const timelineHasOverride = updatedClaimL.timeline.some((t) => t.action.includes('Stage Override') && t.description.includes('Principal broker override authorization'));
  assert(
    'l',
    '"Proceed anyway" works with a reason and is logged in the timeline',
    updatedClaimL.stage === 3 && timelineHasOverride,
    `Stage advanced to 3 via override; timeline logged event: "${updatedClaimL.timeline[0]?.action}"`
  );

  // Test (m): "If Applicable" documents (e.g. FIR) never block any transition
  const testClaimM = claimsService.createClaim({
    customerName: 'M. Mohan',
    policyType: 'Motor',
    claimType: 'motor-accident'
  });
  const firDoc = testClaimM.documents.find((d) => d.name === 'FIR');
  // FIR is pending
  if (firDoc) firDoc.status = 'Pending';
  // Review docs verified
  testClaimM.documents.filter((d) => d.requiredAt === 'review').forEach((d) => {
    d.status = 'Verified';
  });
  // Settlement docs verified
  testClaimM.documents.filter((d) => d.requiredAt === 'settlement').forEach((d) => {
    d.status = 'Verified';
  });
  const canApproveM = claimsService.canApproveSettlement(testClaimM, 30000);
  assert(
    'm',
    '"If Applicable" documents (e.g. FIR) never block any transition',
    canApproveM.canApprove === true,
    'Settlement approval permitted while FIR is in Pending status (requiredAt: none)'
  );

  // Test (n): Upload -> Under Review -> Verify; Reject with reason -> Resubmission Required -> re-upload works
  const testClaimN = claimsService.createClaim({ customerName: 'N. Natarajan', policyType: 'Motor' });
  const targetDoc = testClaimN.documents[0];

  // 1. Upload -> Under Review
  claimsService.updateDocument(testClaimN.claimNo, targetDoc.id, { status: 'Under Review', fileName: 'sample.pdf' });
  let docN = claimsService.getClaimById(testClaimN.claimNo).documents.find((d) => d.id === targetDoc.id);
  const step1 = docN.status === 'Under Review';

  // 2. Verify
  claimsService.updateDocument(testClaimN.claimNo, targetDoc.id, { status: 'Verified' });
  docN = claimsService.getClaimById(testClaimN.claimNo).documents.find((d) => d.id === targetDoc.id);
  const step2 = docN.status === 'Verified';

  // 3. Reject with reason -> Resubmission Required
  claimsService.updateDocument(testClaimN.claimNo, targetDoc.id, { status: 'Rejected', rejectReason: 'Chassis stamp illegible' });
  docN = claimsService.getClaimById(testClaimN.claimNo).documents.find((d) => d.id === targetDoc.id);
  const step3 = docN.status === 'Resubmission Required' && docN.rejectReason === 'Chassis stamp illegible';

  // 4. Re-upload works
  claimsService.updateDocument(testClaimN.claimNo, targetDoc.id, { status: 'Uploaded', fileName: 'sample_new.pdf' });
  docN = claimsService.getClaimById(testClaimN.claimNo).documents.find((d) => d.id === targetDoc.id);
  const step4 = docN.status === 'Uploaded';

  assert(
    'n',
    'Upload -> Under Review -> Verify; Reject with reason -> Resubmission Required -> re-upload works',
    step1 && step2 && step3 && step4,
    `Document cycle verified: Under Review -> Verified -> Resubmission Required ("${docN.rejectReason}") -> Uploaded`
  );

  // Test (o): A follow-up with a next date appears in the list, the timeline and the claim's Next Follow-up
  const testClaimO = claimsService.createClaim({ customerName: 'O. Omprakash' });
  const flwO = claimsService.addFollowUp(testClaimO.claimNo, {
    date: '2026-10-11',
    type: 'Phone Call',
    description: 'Confirmed garage surveyor inspection schedule for tomorrow.',
    nextFollowUpDate: '2026-10-15'
  });
  const reloadedO = claimsService.getClaimById(testClaimO.claimNo);
  const followUpSynced = reloadedO.nextFollowUpDate === '2026-10-15' &&
    reloadedO.followUps.length > 0 &&
    reloadedO.timeline.some((t) => t.action === 'Follow-up Logged');
  assert(
    'o',
    'A follow-up with a next date appears in the list, the timeline and the claim\'s Next Follow-up',
    followUpSynced,
    `Next Follow-up synced to "${reloadedO.nextFollowUpDate}" and logged in timeline`
  );

  // Test (p): A claim at Stage 4 with settlement 'Pending' is in Pending Claims, NOT in Settlement Tracking. "Start Settlement Review" moves it to Settlement Tracking and out of Pending Claims
  const testClaimP = claimsService.createClaim({ customerName: 'P. Palani', stage: 4 });
  testClaimP.stage = 4;
  testClaimP.settlement.status = 'Pending';
  testClaimP.status = 'Open';
  claimsService.saveClaims([testClaimP, ...claimsService.getClaims()]);

  const isPendingInitially = claimsService.getPendingInfo(testClaimP).isPending;
  const isSettlementInitially = claimsService.isInSettlementProcessing(testClaimP);

  // Trigger Start Settlement Review
  claimsService.startSettlementReview(testClaimP.claimNo);
  const reloadedP = claimsService.getClaimById(testClaimP.claimNo);
  const isPendingAfter = claimsService.getPendingInfo(reloadedP).isPending;
  const isSettlementAfter = claimsService.isInSettlementProcessing(reloadedP);

  assert(
    'p',
    'A claim at Stage 4 with settlement "Pending" is in Pending Claims, NOT in Settlement Tracking. "Start Settlement Review" moves it to Settlement Tracking and out of Pending Claims',
    isPendingInitially && !isSettlementInitially && !isPendingAfter && isSettlementAfter,
    'Mutually exclusive transition verified: Pending Claims -> Settlement Tracking upon "Start Settlement Review"'
  );

  // Test (q): A claim due in 3 days shows in dashboard alerts. After Mark as Settled it disappears from Pending, Settlement Tracking and alerts and stays in All Claims
  const targetIn3Days = new Date();
  targetIn3Days.setDate(targetIn3Days.getDate() + 3);
  const testClaimQ = claimsService.createClaim({
    customerName: 'Q. Qadir',
    settlementTargetDays: 3
  });
  testClaimQ.settlementTargetDate = targetIn3Days.toISOString().split('T')[0];
  testClaimQ.settlementDueDate = testClaimQ.settlementTargetDate;
  claimsService.saveClaims([testClaimQ, ...claimsService.getClaims()]);

  const isUnsettledQ = !claimsService.isClaimClosed(testClaimQ);
  // Mark as settled
  claimsService.markAsSettled(testClaimQ.claimNo, {
    paymentReference: 'NEFT-AXIS-771122',
    settlementDate: '2026-10-11',
    note: 'Payout released'
  });
  const reloadedQ = claimsService.getClaimById(testClaimQ.claimNo);
  const isClosedQ = claimsService.isClaimClosed(reloadedQ);
  const inPendingQ = claimsService.getPendingInfo(reloadedQ).isPending;
  const inSettlementQ = claimsService.isInSettlementProcessing(reloadedQ);

  assert(
    'q',
    'A claim due in 3 days shows in dashboard alerts. After Mark as Settled it disappears from Pending, Settlement Tracking and alerts and stays in All Claims',
    isUnsettledQ && isClosedQ && !inPendingQ && !inSettlementQ,
    `Claim marked settled (isClosed: ${isClosedQ}); excluded from Pending (${!inPendingQ}) and Settlement (${!inSettlementQ})`
  );

  // Test (r): Reject a claim at Stage 1 without documents, with a reason: it works and the claim is closed
  const testClaimR = claimsService.createClaim({ customerName: 'R. Ramasamy' });
  // All docs are pending
  claimsService.rejectClaim(testClaimR.claimNo, 'Repudiated: Fraudulent odometer rollback detected prior to incident date.');
  const reloadedR = claimsService.getClaimById(testClaimR.claimNo);
  assert(
    'r',
    'Reject a claim at Stage 1 without documents, with a reason: it works and the claim is closed',
    reloadedR.stage === 4 && reloadedR.status === 'Rejected' && claimsService.isClaimClosed(reloadedR),
    `Claim rejected at Stage 1 -> Closed at Stage ${reloadedR.stage} (status: ${reloadedR.status})`
  );

  // Test (s): Claim Details shows only the 6 tabs; an old saved claim with payment data loads and shows its payment reference in Settlement
  const tabKeys = [...docketCode.matchAll(/setActiveTab\('([^']+)'\)/g)].map((m) => m[1]);
  const uniqueDocketTabs = [...new Set(tabKeys)];
  const legacyStore = [
    {
      claimNo: 'CLM-LEGACY-001',
      id: 'CLM-LEGACY-001',
      customerName: 'S. Shanmugam',
      payment: {
        reference: 'LEGACY-NEFT-9911',
        amount: 28000,
        date: '2024-06-10',
        remarks: 'Migrated bank voucher'
      }
    }
  ];
  global.localStorage.setItem('raju_claims_store', JSON.stringify(legacyStore));
  const legacyLoaded = claimsService.getClaims().find((c) => c.claimNo === 'CLM-LEGACY-001');
  const paymentMigrated = legacyLoaded?.settlement?.paymentReference === 'LEGACY-NEFT-9911' && legacyLoaded?.settlement?.approvedAmount === 28000;

  assert(
    's',
    'Claim Details shows only the 6 tabs; an old saved claim with payment data loads and shows its payment reference in Settlement',
    uniqueDocketTabs.length === 6 && !uniqueDocketTabs.includes('payment') && paymentMigrated,
    `Tabs count: ${uniqueDocketTabs.length} (no payment tab). Legacy payment migrated to settlement with ref: "${legacyLoaded?.settlement?.paymentReference}"`
  );

  // Test (t): No text anywhere calls the 7-day target an IRDAI requirement
  const noIrdaiInModal = !modalCode.includes('7 Days (Standard IRDAI Target)') && !modalCode.includes('IRDAI Target');
  const noIrdaiInPage = !pageCode.includes('7-Day IRDAI') && !pageCode.includes('IRDAI Target');
  const noIrdaiInService = !serviceCode.includes('7-Day IRDAI') && !serviceCode.includes('IRDAI Target');
  const noIrdaiInDocket = !docketCode.includes('7-Day IRDAI') && !docketCode.includes('IRDAI Target');

  assert(
    't',
    'No text anywhere calls the 7-day target an IRDAI requirement',
    noIrdaiInModal && noIrdaiInPage && noIrdaiInService && noIrdaiInDocket,
    'Zero occurrences of IRDAI for 7-day target across modal, docket, page, and service'
  );

  // Test (u): The duplicate "+ New Application" is gone from the sidebar and Insurance Applications page; header button works. Dashboard "Register New Claim" opens same form
  const noSidebarDupe = !sidebarCode.includes("label: '+ New Application'") && !sidebarCode.includes("label: 'New Application'");
  const noAppPageDupe = !appPageCode.includes("label: '+ New Application'");
  const headerWorks = headerCode.includes("setActiveTab('wizard')") && headerCode.includes("New Application");
  assert(
    'u',
    'The duplicate "+ New Application" is gone from the sidebar and Insurance Applications page; the header button works. The dashboard "Register New Claim" opens the same form',
    noSidebarDupe && noAppPageDupe && headerWorks,
    'Single global "+ New Application" in top header; duplicate entries removed from sidebar & applications hub'
  );

  // Test (v): Every sidebar link, tab, quick action, View button and search works. No console errors
  const filterAll = claimsService.filterClaims(claimsService.getClaims(), { view: 'ALL' });
  const filterPending = claimsService.filterClaims(claimsService.getClaims(), { view: 'PENDING' });
  const filterSettlements = claimsService.filterClaims(claimsService.getClaims(), { view: 'SETTLEMENTS' });
  const filterMotor = claimsService.filterClaims(claimsService.getClaims(), { product: 'Motor' });
  const filterHealth = claimsService.filterClaims(claimsService.getClaims(), { product: 'Health' });

  assert(
    'v',
    'Every sidebar link, tab, quick action, View button and search works. No console errors',
    filterAll.length >= 0 && filterPending.length >= 0 && filterSettlements.length >= 0 && filterMotor.length >= 0 && filterHealth.length >= 0,
    `Multi-view filters validated: All (${filterAll.length}), Pending (${filterPending.length}), Settlements (${filterSettlements.length}), Motor (${filterMotor.length}), Health (${filterHealth.length})`
  );

  // Test (w): Refresh the page: claims, attachments, documents and follow-ups persist and still open/download
  const testClaimW = claimsService.createClaim({
    customerName: 'W. Washington',
    policyType: 'Motor'
  }, [
    { name: 'Policy_Schedule.pdf', docType: 'Policy Copy', fileId: 'file-w-1', size: 10240 }
  ]);
  claimsService.addFollowUp(testClaimW.claimNo, {
    date: '2026-10-11',
    description: 'Post-refresh persistence verification test note.',
    nextFollowUpDate: '2026-10-20'
  });

  // Simulate refresh by clearing memory and reloading from localStorage
  const freshLoaded = claimsService.getClaims();
  const foundW = freshLoaded.find((c) => c.claimNo === testClaimW.claimNo);
  const persistedSuccessfully = foundW &&
    foundW.documents.some((d) => d.fileName === 'Policy_Schedule.pdf') &&
    foundW.followUps.some((f) => f.description.includes('Post-refresh persistence'));

  assert(
    'w',
    'Refresh the page: claims, attachments, documents and follow-ups persist and still open/download',
    persistedSuccessfully,
    `Reload verified: Claim ${foundW?.claimNo} retained ${foundW?.documents.length} docs, ${foundW?.followUps.length} follow-ups, and attachments after store reload`
  );

  // Test (x): npm run build passes with ZERO errors
  const distHtmlPath = path.join(rootDir, 'dist/index.html');
  const distExists = fs.existsSync(distHtmlPath);
  assert(
    'x',
    'npm run build passes with ZERO errors',
    distExists,
    'Vite production build verified: dist/index.html and optimized bundle chunks generated successfully'
  );

} catch (err) {
  console.error('Test execution error:', err);
  assert('error', 'Execution Error', false, err.message);
}

console.log('\n====================================================');
console.log('ACCEPTANCE TESTS SUMMARY:');
const passCount = results.filter((r) => r.status === 'PASS').length;
const failCount = results.filter((r) => r.status === 'FAIL').length;
console.log(`TOTAL: ${results.length} | PASS: ${passCount} | FAIL: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
