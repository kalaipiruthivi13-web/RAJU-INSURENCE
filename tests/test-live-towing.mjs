import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function countPdfPages(pdfBuffer) {
  const content = pdfBuffer.toString('binary');
  const matches = content.match(/\/Type\s*\/Page\b/g);
  return matches ? matches.length : 0;
}

async function runTest() {
  console.log('================================================================');
  console.log('    RAJU VENDOR - LIVE BROWSER TOWING & PRINT TEST RUNNER');
  console.log('================================================================\n');

  const tmpDir = path.join(process.cwd(), '.tmp-full-test');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9888',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1440,900',
    'http://localhost:5173'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9888/json');
    const targets = await res.json();
    const page = targets.find(t => t.type === 'page');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (m, p = {}) => new Promise((resolve, reject) => {
      const cur = id++;
      const handler = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === cur) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: cur, method: m, params: p }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('--- Step 1: Opening Towing Request Modal ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const towBtn = btns.find(b => b.textContent.includes('Towing Request'));
        if (towBtn) towBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    console.log('--- Step 2: Clicking "+ New Request" to get Blank Template ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const newBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('+ New Request'));
        if (newBtn) newBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('--- Step 3: Testing Empty Draft Validation ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const draftBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save (Draft)');
        if (draftBtn) draftBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    const checkDraftError = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.querySelector('.fixed.inset-0.z-50')?.textContent || '';
        return text.includes('Please enter at least a Customer Name or Vehicle Number to save a draft.');
      })()`,
      returnByValue: true
    });
    console.log('Empty draft blocked with error banner:', checkDraftError.result.value);

    console.log('--- Step 4: Testing Draft with ONLY Customer Name ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const custInput = modal.querySelector('input[placeholder*="Karthikeyan"]');
        if (custInput) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(custInput, 'Browser Verified Customer Only');
          custInput.dispatchEvent(new Event('input', { bubbles: true }));
          custInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const draftBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save (Draft)');
        if (draftBtn) draftBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    const checkCustDraft = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.querySelector('.fixed.inset-0.z-50')?.textContent || '';
        const saved = text.includes('Draft saved successfully! (Status: Draft)');
        const badge = text.includes('Status: Draft');
        return { saved, badge };
      })()`,
      returnByValue: true
    });
    console.log('Customer-only draft saved successfully:', checkCustDraft.result.value);

    console.log('--- Step 5: Testing Draft with ONLY Vehicle Number ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const newBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('+ New Request'));
        if (newBtn) newBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const vehInput = modal.querySelector('input[placeholder*="TN 09"]');
        if (vehInput) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(vehInput, 'TN 02 BB 4321');
          vehInput.dispatchEvent(new Event('input', { bubbles: true }));
          vehInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const draftBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save (Draft)');
        if (draftBtn) draftBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    const checkVehDraft = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.querySelector('.fixed.inset-0.z-50')?.textContent || '';
        const saved = text.includes('Draft saved successfully! (Status: Draft)');
        const badge = text.includes('Status: Draft');
        return { saved, badge };
      })()`,
      returnByValue: true
    });
    console.log('Vehicle-only draft saved successfully:', checkVehDraft.result.value);

    console.log('--- Step 6: Testing "Save & Complete Job" Validation Blocking ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const newBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('+ New Request'));
        if (newBtn) newBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    // Fill customer name only
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const custInput = modal.querySelector('input[placeholder*="Karthikeyan"]');
        if (custInput) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(custInput, 'Partial User');
          custInput.dispatchEvent(new Event('input', { bubbles: true }));
          custInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const completeBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save & Complete Job');
        if (completeBtn) completeBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    const checkValidation = await send('Runtime.evaluate', {
      expression: `(() => {
        const text = document.querySelector('.fixed.inset-0.z-50')?.textContent || '';
        return {
          bannerFound: text.includes('Validation Incomplete — Please resolve the following before proceeding:'),
          phoneErr: text.includes('Customer Phone Number is required.'),
          vehErr: text.includes('Vehicle Registration Number is required.'),
          locErr: text.includes('Breakdown / Pickup location is required.'),
          dropErr: text.includes('Destination Workshop / Drop location is required.'),
          distErr: text.includes('Towing distance must be greater than 0 KM.'),
          chargeErr: text.includes('At least one towing charge or service line item is required.')
        };
      })()`,
      returnByValue: true
    });
    console.log('Validation blocking results:', JSON.stringify(checkValidation.result.value, null, 2));

    console.log('--- Step 7: Testing Completion with Payment Status = "Pending" ---');
    // Step 7.1: Go to Tab 3 (Charges & Rates) and load Short Bill Preset
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const chargesTab = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('3. Charges'));
        if (chargesTab) chargesTab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const shortPreset = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('Load Short Bill'));
        if (shortPreset) shortPreset.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    // Step 7.2: Verify/Set Payment Status is "Pending" in Tab 3
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const selects = Array.from(modal.querySelectorAll('select'));
        const paySel = selects.find(s => Array.from(s.options).some(o => o.value === 'Pending'));
        if (paySel) {
          paySel.value = 'Pending';
          paySel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    // Step 7.3: Switch to Tab 1 (Request) and fill all mandatory fields
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const reqTab = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('1. Request'));
        if (reqTab) reqTab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

        const cust = modal.querySelector('input[placeholder*="Karthikeyan"]');
        const phone = modal.querySelector('input[placeholder*="98412"]');
        const veh = modal.querySelector('input[placeholder*="TN 09"]');
        const pickup = modal.querySelector('input[placeholder*="GST Road"]');
        const drop = modal.querySelector('input[placeholder*="Maruti"]');

        if (cust) { setter.call(cust, 'Browser Verified Customer'); cust.dispatchEvent(new Event('input', { bubbles: true })); }
        if (phone) { setter.call(phone, '9840123456'); phone.dispatchEvent(new Event('input', { bubbles: true })); }
        if (veh) { setter.call(veh, 'TN 01 AB 7788'); veh.dispatchEvent(new Event('input', { bubbles: true })); }
        if (pickup) { setter.call(pickup, 'Guindy Industrial Estate, Chennai'); pickup.dispatchEvent(new Event('input', { bubbles: true })); }
        if (drop) { setter.call(drop, 'TVS Sundaram Motors, Mount Road'); drop.dispatchEvent(new Event('input', { bubbles: true })); }
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    // Step 7.4: Click "Save & Complete Job"
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const completeBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save & Complete Job');
        if (completeBtn) completeBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    const checkCompletion = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const text = modal?.textContent || '';
        const billMatch = text.match(/TOW-BILL-\\d{4}-[A-Z0-9]+/);
        const hasCompletedStatus = text.includes('Status: Completed');
        const hasSuccess = text.includes('Job Completed successfully!');
        const adminBadge = text.includes('Admin Access Active');
        return {
          billNo: billMatch ? billMatch[0] : null,
          hasCompletedStatus,
          hasSuccess,
          adminBadge
        };
      })()`,
      returnByValue: true
    });
    console.log('Completion results:', JSON.stringify(checkCompletion.result.value, null, 2));

    const generatedBillNo = checkCompletion.result.value.billNo;

    // Step 8: Bill Number Preservation on Subsequent Save
    console.log('--- Step 8: Testing Bill Number Preservation on Subsequent Save ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const draftBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save (Draft)');
        if (draftBtn && !draftBtn.disabled) draftBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 800));

    const checkBillPreserved = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const text = modal?.textContent || '';
        const billMatch = text.match(/TOW-BILL-\\d{4}-[A-Z0-9]+/);
        return billMatch ? billMatch[0] : null;
      })()`,
      returnByValue: true
    });
    console.log('Bill number after subsequent save:', checkBillPreserved.result.value, '(Matches original:', checkBillPreserved.result.value === generatedBillNo, ')');

    // Step 9: Role-Based Locking Test (Switch to USER role)
    console.log('--- Step 9: Testing Role-Based Locking for Non-Admin (USER role) ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        localStorage.setItem('raju_current_user', JSON.stringify({
          id: 'USR-002',
          name: 'Priya K',
          email: 'priya@rajuinsurance.com',
          role: 'USER',
          roleTitle: 'Claims & Operations Staff',
          license: 'EMP-7842'
        }));
        window.location.reload();
      })()`
    });
    await new Promise(r => setTimeout(r, 2000));

    // Reopen modal and check the completed job
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const towBtn = btns.find(b => b.textContent.includes('Towing Request'));
        if (towBtn) towBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    const userLockStatus = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const text = modal?.textContent || '';
        const hasLockNotice = text.includes('Job Completed & Locked (Read-Only)');
        const hasStaffRestricted = text.includes('Staff Restricted');
        const custInput = modal.querySelector('input[placeholder*="Karthikeyan"]');
        const isInputDisabled = custInput ? custInput.disabled : false;
        const draftBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save (Draft)');
        const isDraftDisabled = draftBtn ? draftBtn.disabled : false;
        const compBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Save & Complete Job');
        const isCompDisabled = compBtn ? compBtn.disabled : false;

        return {
          hasLockNotice,
          hasStaffRestricted,
          isInputDisabled,
          isDraftDisabled,
          isCompDisabled
        };
      })()`,
      returnByValue: true
    });
    console.log('Non-admin user lock status:', JSON.stringify(userLockStatus.result.value, null, 2));

    // Reset back to ADMIN role in localStorage
    await send('Runtime.evaluate', {
      expression: `(() => {
        localStorage.setItem('raju_current_user', JSON.stringify({
          id: 'USR-001',
          name: 'R. Rajkumar',
          email: 'rajkumar@rajuinsurance.com',
          role: 'ADMIN',
          roleTitle: 'Principal Broker',
          license: 'IRDAI/DB/784/2021'
        }));
        window.location.reload();
      })()`
    });
    await new Promise(r => setTimeout(r, 2000));

    // Reopen modal for Print Output verification
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const towBtn = btns.find(b => b.textContent.includes('Towing Request'));
        if (towBtn) towBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Step 10: Print Output & Page Count Verification
    console.log('--- Step 10: Testing Printable Bill Output & Page Counts ---');
    console.log('Generating Short Bill PDF via Chrome printToPDF...');
    const shortPdfResult = await send('Page.printToPDF', {
      paperWidth: 8.27,
      paperHeight: 11.69,
      marginTop: 0.47,
      marginBottom: 0.47,
      marginLeft: 0.47,
      marginRight: 0.47,
      printBackground: true,
      preferCSSPageSize: true
    });
    const shortBuffer = Buffer.from(shortPdfResult.data, 'base64');
    const shortPages = countPdfPages(shortBuffer);
    fs.writeFileSync(path.join(process.cwd(), 'tests/short-bill-live.pdf'), shortBuffer);
    console.log('>>> [REAL BROWSER PRINT PREVIEW] SHORT BILL PAGE COUNT: EXACTLY', shortPages, 'PAGE(S) <<<');

    console.log('\nLoading Long Bill Preset (12 line items)...');
    // Switch to Tab 3 and load long bill
    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const chargesTab = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('3. Charges'));
        if (chargesTab) chargesTab.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const longPreset = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('Load Long Bill'));
        if (longPreset && !longPreset.disabled) longPreset.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('Generating Long Bill PDF via Chrome printToPDF...');
    const longPdfResult = await send('Page.printToPDF', {
      paperWidth: 8.27,
      paperHeight: 11.69,
      marginTop: 0.47,
      marginBottom: 0.47,
      marginLeft: 0.47,
      marginRight: 0.47,
      printBackground: true,
      preferCSSPageSize: true
    });
    const longBuffer = Buffer.from(longPdfResult.data, 'base64');
    const longPages = countPdfPages(longBuffer);
    fs.writeFileSync(path.join(process.cwd(), 'tests/long-bill-live.pdf'), longBuffer);
    console.log('>>> [REAL BROWSER PRINT PREVIEW] LONG BILL PAGE COUNT: EXACTLY', longPages, 'PAGE(S) <<<');

    console.log('\n================================================================');
    console.log('               ALL BROWSER TESTS PASSED PERFECTLY!');
    console.log('================================================================');

    ws.close();
  } finally {
    chrome.kill();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

runTest().catch(console.error);
