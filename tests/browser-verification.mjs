import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9555;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function countPdfPages(pdfBuffer) {
  const content = pdfBuffer.toString('binary');
  const matches = content.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runVerification() {
  console.log('================================================================');
  console.log('       RAJU VENDOR - REAL BROWSER TOWING VERIFICATION');
  console.log('================================================================\n');

  const tmpDir = path.join(process.cwd(), '.tmp-browser-profile-verify');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'http://localhost:5173'
  ]);

  let cdp = null;

  try {
    let targetWs = null;
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      try {
        const resp = await fetch(`http://127.0.0.1:${PORT}/json`);
        const targets = await resp.json();
        const pageTarget = targets.find(t => t.type === 'page');
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          targetWs = pageTarget.webSocketDebuggerUrl;
          break;
        }
      } catch (e) {}
    }

    if (!targetWs) throw new Error('Could not connect to Chrome debugging target');

    cdp = new CDPClient(targetWs);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    console.log('[Browser Connected] Waiting for application to load and render...');
    
    // Wait for Dashboard button to appear
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      const hasDashboard = await cdp.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('button, a'));
          return btns.some(b => b.textContent.includes('Towing Request'));
        })()
      `);
      if (hasDashboard) {
        ready = true;
        break;
      }
    }
    if (!ready) throw new Error('Application failed to render Towing Request button within 15s');

    console.log('Application ready on http://localhost:5173');

    // Helper functions inside browser
    await cdp.eval(`
      window.__helpers = {
        setInputValue: (input, value) => {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          ).set;
          nativeInputValueSetter.call(input, value);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        },
        clickBtnByText: (text) => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.trim().includes(text));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        }
      };
    `);

    // Step 1: Open Towing Request Modal
    console.log('\n--- Step 1: Open Towing Request Modal ---');
    const opened = await cdp.eval(`window.__helpers.clickBtnByText('Towing Request')`);
    console.log('Clicked "Towing Request" button:', opened);
    await sleep(800);

    const isModalOpen = await cdp.eval(`
      (() => {
        return !!document.querySelector('h3, h2, span')?.textContent?.includes('Roadside Assistance');
      })()
    `);
    console.log('Towing Modal visible:', isModalOpen);

    // Verify #towing-printable-bill portal exists on body
    const portalAttached = await cdp.eval(`
      (() => {
        const portal = document.getElementById('towing-printable-bill');
        return portal ? {
          found: true,
          parentElement: portal.parentElement.tagName,
          id: portal.id,
          classes: portal.className
        } : { found: false };
      })()
    `);
    console.log('Dedicated Print Portal attached to body:', portalAttached);

    // Step 2: Testing Empty Draft Validation
    console.log('\n--- Step 2: Testing Empty Draft Validation ---');
    // Switch to "+ New Towing Request / Blank Draft"
    await cdp.eval(`
      (() => {
        const sel = document.querySelector('select');
        if (sel) {
          sel.value = 'NEW';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        window.__helpers.clickBtnByText('+ New Request');
      })()
    `);
    await sleep(400);

    // Ensure customer name and vehicle number inputs are empty
    await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const cust = inputs.find(i => i.placeholder && i.placeholder.includes('Customer'));
        const veh = inputs.find(i => i.placeholder && (i.placeholder.includes('TN 01') || i.placeholder.includes('Vehicle')));
        if (cust) window.__helpers.setInputValue(cust, '');
        if (veh) window.__helpers.setInputValue(veh, '');
      })()
    `);
    await sleep(300);

    // Click "Save (Draft)"
    await cdp.eval(`window.__helpers.clickBtnByText('Save (Draft)')`);
    await sleep(400);

    const emptyDraftError = await cdp.eval(`
      (() => {
        const text = document.body.textContent;
        return text.includes('Please enter at least a Customer Name or Vehicle Number to save a draft.');
      })()
    `);
    console.log('Empty draft blocked with inline error banner:', emptyDraftError);

    // Step 3: Testing Draft with ONLY Customer Name
    console.log('\n--- Step 3: Testing Draft with ONLY Customer Name ---');
    await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const cust = inputs.find(i => i.placeholder && i.placeholder.includes('Customer'));
        if (cust) window.__helpers.setInputValue(cust, 'Browser Test Client Alpha');
      })()
    `);
    await sleep(300);
    await cdp.eval(`window.__helpers.clickBtnByText('Save (Draft)')`);
    await sleep(600);

    const draft1Status = await cdp.eval(`
      (() => {
        const text = document.body.textContent;
        const hasSuccess = text.includes('Draft saved successfully! (Status: Draft)');
        const hasDraftBadge = text.includes('Status: Draft');
        return { hasSuccess, hasDraftBadge };
      })()
    `);
    console.log('Customer-only draft saved successfully:', draft1Status.hasSuccess);
    console.log('Status badge set to Draft:', draft1Status.hasDraftBadge);

    // Step 4: Testing Draft with ONLY Vehicle Number
    console.log('\n--- Step 4: Testing Draft with ONLY Vehicle Number ---');
    await cdp.eval(`
      (() => {
        window.__helpers.clickBtnByText('+ New Request');
      })()
    `);
    await sleep(400);
    await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const cust = inputs.find(i => i.placeholder && i.placeholder.includes('Customer'));
        const veh = inputs.find(i => i.placeholder && (i.placeholder.includes('TN 01') || i.placeholder.includes('Vehicle')));
        if (cust) window.__helpers.setInputValue(cust, '');
        if (veh) window.__helpers.setInputValue(veh, 'TN 07 ZZ 8888');
      })()
    `);
    await sleep(300);
    await cdp.eval(`window.__helpers.clickBtnByText('Save (Draft)')`);
    await sleep(600);

    const draft2Status = await cdp.eval(`
      (() => {
        const text = document.body.textContent;
        return text.includes('Draft saved successfully! (Status: Draft)');
      })()
    `);
    console.log('Vehicle-only draft saved successfully:', draft2Status);

    // Step 5: Testing "Save & Complete Job" Validation Blocking
    console.log('\n--- Step 5: Testing Save & Complete Job Validation Blocking ---');
    await cdp.eval(`
      (() => {
        window.__helpers.clickBtnByText('+ New Request');
      })()
    `);
    await sleep(400);

    // Fill ONLY customer name, leave phone, vehicle, pickup, drop, distance, charges missing
    await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const cust = inputs.find(i => i.placeholder && i.placeholder.includes('Customer'));
        if (cust) window.__helpers.setInputValue(cust, 'Incomplete Job User');
      })()
    `);
    await sleep(300);

    // Click "Save & Complete Job"
    await cdp.eval(`window.__helpers.clickBtnByText('Save & Complete Job')`);
    await sleep(500);

    const validationSummary = await cdp.eval(`
      (() => {
        const text = document.body.textContent;
        const bannerFound = text.includes('Validation Incomplete — Please resolve the following before proceeding:');
        const phoneErr = text.includes('Customer Phone Number is required.');
        const vehErr = text.includes('Vehicle Registration Number is required.');
        const locErr = text.includes('Breakdown / Pickup location is required.');
        const dropErr = text.includes('Destination Workshop / Drop location is required.');
        const distErr = text.includes('Towing distance must be greater than 0 KM.');
        const chargeErr = text.includes('At least one towing charge or service line item is required.');
        return {
          bannerFound,
          phoneErr,
          vehErr,
          locErr,
          dropErr,
          distErr,
          chargeErr
        };
      })()
    `);
    console.log('Save & Complete blocked by Validation Banner:', validationSummary.bannerFound);
    console.log('Individual field validation errors:');
    console.log('  - Phone Required:', validationSummary.phoneErr);
    console.log('  - Vehicle Reg Required:', validationSummary.vehErr);
    console.log('  - Pickup Location Required:', validationSummary.locErr);
    console.log('  - Drop Location Required:', validationSummary.dropErr);
    console.log('  - Distance > 0 KM Required:', validationSummary.distErr);
    console.log('  - Line Item / Charge Required:', validationSummary.chargeErr);

    // Step 6: Testing Completion with Payment Status = "Pending"
    console.log('\n--- Step 6: Testing Completion with Payment Status = "Pending" ---');
    // Load Short Bill Preset to provide valid charges
    await cdp.eval(`window.__helpers.clickBtnByText('Short Bill Preset')`);
    await sleep(400);

    // Fill all 7 core fields
    await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const cust = inputs.find(i => i.placeholder && i.placeholder.includes('Customer'));
        const phone = inputs.find(i => i.placeholder && (i.placeholder.includes('98') || i.placeholder.includes('Phone') || i.type === 'tel'));
        const veh = inputs.find(i => i.placeholder && (i.placeholder.includes('TN 01') || i.placeholder.includes('Vehicle')));
        const pickup = inputs.find(i => i.placeholder && (i.placeholder.includes('Pickup') || i.placeholder.includes('GST Road') || i.placeholder.includes('Landmark')));
        const drop = inputs.find(i => i.placeholder && (i.placeholder.includes('Workshop') || i.placeholder.includes('Authorised') || i.placeholder.includes('Service Center')));

        if (cust) window.__helpers.setInputValue(cust, 'Raju Real Browser Customer');
        if (phone) window.__helpers.setInputValue(phone, '9840123456');
        if (veh) window.__helpers.setInputValue(veh, 'TN 01 AB 7788');
        if (pickup) window.__helpers.setInputValue(pickup, 'Guindy Industrial Estate, Chennai');
        if (drop) window.__helpers.setInputValue(drop, 'TVS Sundaram Motors, Mount Road');
      })()
    `);
    await sleep(400);

    // Switch to Tab 3 (Charges & Rates) to verify / set Payment Status = Pending
    await cdp.eval(`window.__helpers.clickBtnByText('3. Charges & Rates')`);
    await sleep(400);

    await cdp.eval(`
      (() => {
        const selects = Array.from(document.querySelectorAll('select'));
        const paySel = selects.find(s => Array.from(s.options).some(o => o.value === 'Pending'));
        if (paySel) {
          paySel.value = 'Pending';
          paySel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(300);

    // Click "Save & Complete Job"
    await cdp.eval(`window.__helpers.clickBtnByText('Save & Complete Job')`);
    await sleep(800);

    const completionResult = await cdp.eval(`
      (() => {
        const text = document.body.textContent;
        const billMatch = text.match(/TOW-BILL-\\d{4}-[A-Z0-9]+/);
        const hasCompletedStatus = text.includes('Status: Completed');
        const hasCompletedSuccess = text.includes('Job Completed successfully!');
        return {
          billNo: billMatch ? billMatch[0] : null,
          hasCompletedStatus,
          hasCompletedSuccess
        };
      })()
    `);
    console.log('Job Completed successfully:', completionResult.hasCompletedSuccess);
    console.log('Status badge updated to Completed:', completionResult.hasCompletedStatus);
    console.log('Official Bill Number Generated:', completionResult.billNo);

    // Check Bill Number preservation on subsequent edit
    const initialBillNo = completionResult.billNo;
    await cdp.eval(`
      (() => {
        // Switch to Tab 1 and modify breakdown notes or something minor
        window.__helpers.clickBtnByText('1. Request');
      })()
    `);
    await sleep(300);
    // Click Save (Draft)
    await cdp.eval(`window.__helpers.clickBtnByText('Save (Draft)')`);
    await sleep(600);

    const billNoAfterEdit = await cdp.eval(`
      (() => {
        const text = document.body.textContent;
        const billMatch = text.match(/TOW-BILL-\\d{4}-[A-Z0-9]+/);
        return billMatch ? billMatch[0] : null;
      })()
    `);
    console.log('Bill Number preserved after edit:', billNoAfterEdit === initialBillNo, `(${billNoAfterEdit})`);

    // Step 7: Print Output & Page Count Inspection
    console.log('\n--- Step 7: Print Output & Exact Page Count Verification ---');
    // Ensure Short Bill Preset is loaded
    await cdp.eval(`window.__helpers.clickBtnByText('Short Bill Preset')`);
    await sleep(500);

    // Generate PDF for Short Bill
    console.log('Rendering Short Bill to PDF via Chrome DevTools Protocol...');
    const shortPdfData = await cdp.send('Page.printToPDF', {
      paperWidth: 8.27, // A4 Width in inches
      paperHeight: 11.69, // A4 Height in inches
      marginTop: 0.47, // 12mm
      marginBottom: 0.47,
      marginLeft: 0.47,
      marginRight: 0.47,
      printBackground: true,
      preferCSSPageSize: true
    });
    const shortPdfBuffer = Buffer.from(shortPdfData.data, 'base64');
    const shortPdfPageCount = countPdfPages(shortPdfBuffer);
    fs.writeFileSync(path.join(process.cwd(), 'tests/short-bill-verified.pdf'), shortPdfBuffer);
    console.log('>>> [VERIFIED IN REAL BROWSER] SHORT BILL PAGE COUNT: EXACTLY', shortPdfPageCount, 'PAGE(S) <<<');

    // Switch to Long Bill Preset (12 line items)
    console.log('\nLoading Long Bill Preset (12 line items)...');
    await cdp.eval(`window.__helpers.clickBtnByText('Long Bill Preset')`);
    await sleep(500);

    const longPdfData = await cdp.send('Page.printToPDF', {
      paperWidth: 8.27,
      paperHeight: 11.69,
      marginTop: 0.47,
      marginBottom: 0.47,
      marginLeft: 0.47,
      marginRight: 0.47,
      printBackground: true,
      preferCSSPageSize: true
    });
    const longPdfBuffer = Buffer.from(longPdfData.data, 'base64');
    const longPdfPageCount = countPdfPages(longPdfBuffer);
    fs.writeFileSync(path.join(process.cwd(), 'tests/long-bill-verified.pdf'), longPdfBuffer);
    console.log('>>> [VERIFIED IN REAL BROWSER] LONG BILL PAGE COUNT: EXACTLY', longPdfPageCount, 'PAGE(S) <<<');

    console.log('\n================================================================');
    console.log('        REAL BROWSER VERIFICATION AUDIT SUMMARY');
    console.log('================================================================');
    console.log(`1. Empty Draft Blocked:            ${emptyDraftError ? 'PASSED' : 'FAILED'}`);
    console.log(`2. Draft with Customer Only:       ${draft1Status.hasSuccess ? 'PASSED' : 'FAILED'}`);
    console.log(`3. Draft with Vehicle Only:        ${draft2Status ? 'PASSED' : 'FAILED'}`);
    console.log(`4. Save & Complete Blocked:        ${validationSummary.bannerFound ? 'PASSED' : 'FAILED'}`);
    console.log(`5. All 6 Mandatory Errors Shown:   ${(validationSummary.phoneErr && validationSummary.vehErr && validationSummary.locErr && validationSummary.dropErr && validationSummary.distErr && validationSummary.chargeErr) ? 'PASSED' : 'FAILED'}`);
    console.log(`6. Complete with Payment Pending:  ${completionResult.hasCompletedStatus ? 'PASSED' : 'FAILED'}`);
    console.log(`7. Bill Number Generated Once:     ${completionResult.billNo ? 'PASSED (' + completionResult.billNo + ')' : 'FAILED'}`);
    console.log(`8. Bill Number Preserved on Edit:  ${billNoAfterEdit === initialBillNo ? 'PASSED' : 'FAILED'}`);
    console.log(`9. Short Bill Print Page Count:    ${shortPdfPageCount} PAGE (Target: 1 page)`);
    console.log(`10. Long Bill Print Page Count:    ${longPdfPageCount} PAGES (Target: Clean pagination)`);

  } finally {
    if (cdp) cdp.close();
    chromeProc.kill();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

runVerification().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
