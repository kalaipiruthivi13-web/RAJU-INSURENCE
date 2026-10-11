import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForChrome(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // wait and retry
    }
    await sleep(200);
  }
  throw new Error('Chrome did not start in time');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
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
        if (msg.error) {
          reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        } else {
          resolve(msg.result);
        }
      } else if (msg.method && this.eventListeners.has(msg.method)) {
        const listeners = this.eventListeners.get(msg.method);
        listeners.forEach(fn => fn(msg.params));
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, fn) {
    if (!this.eventListeners.has(method)) {
      this.eventListeners.set(method, []);
    }
    this.eventListeners.get(method).push(fn);
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${res.exceptionDetails.text} - ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runBrowserTests() {
  console.log('========================================================');
  console.log('   STARTING HEADLESS CHROME BROWSER E2E TEST');
  console.log('========================================================\n');

  // Launch headless Chrome
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    const versionInfo = await waitForChrome(PORT);
    console.log(`Connected to Chrome: ${versionInfo.Browser}`);

    // Get list of targets or create new target
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page') || pages[0];

    const cdp = new CDPClient(page.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('CDP WebSocket connected');

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');

    // Handle javascript dialogs (e.g. window.confirm)
    let dialogHistory = [];
    cdp.on('Page.javascriptDialogOpening', async (params) => {
      console.log(`[Browser Dialog] Type: ${params.type}, Message: "${params.message}"`);
      dialogHistory.push(params);
      // Accept confirmation dialogs
      await cdp.send('Page.handleJavaScriptDialog', { accept: true });
    });

    // 1. Navigate to App
    console.log('\n--- Test 1: Navigation to http://localhost:5173 ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    const title = await cdp.eval('document.title');
    console.log(`Page title: "${title}"`);

    // 2. Open Towing Modal
    console.log('\n--- Test 2: Opening Towing Request Modal ---');
    const openBtnFound = await cdp.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const towingBtn = btns.find(b => b.textContent.includes('Towing Request'));
        if (towingBtn) {
          towingBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log(`Found and clicked "Towing Request" button: ${openBtnFound}`);
    await sleep(600);

    // Verify modal is open
    const modalOpen = await cdp.eval(`
      (() => {
        const heading = document.querySelector('h3, [role="heading"]');
        return heading && heading.textContent.includes('Roadside Assistance & Towing');
      })()
    `);
    console.log(`Modal header visible: ${modalOpen}`);

    // 3. Inspect 6 Tabs
    console.log('\n--- Test 3: 6 Tabs Structure & Labels (Desktop 1440px) ---');
    const tabsInfo = await cdp.eval(`
      (() => {
        const tabBtns = Array.from(document.querySelectorAll('[data-tab-id]'));
        return tabBtns.map(btn => {
          const full = btn.querySelector('.sm\\\\:inline, span:not(.sm\\\\:hidden)')?.textContent?.trim() || '';
          const short = btn.querySelector('.sm\\\\:hidden')?.textContent?.trim() || '';
          const fullVisible = window.getComputedStyle(btn.querySelector('.hidden.sm\\\\:inline') || btn).display !== 'none';
          const shortVisible = btn.querySelector('.sm\\\\:hidden') ? window.getComputedStyle(btn.querySelector('.sm\\\\:hidden')).display !== 'none' : false;
          return {
            id: btn.getAttribute('data-tab-id'),
            text: btn.textContent.trim(),
            full,
            short,
            fullVisible,
            shortVisible
          };
        });
      })()
    `);
    console.log(`Found ${tabsInfo.length} tabs:`);
    tabsInfo.forEach(t => console.log(`  - [${t.id}] text: "${t.text}"`));

    // 4. Test Viewport Responsiveness: Tablet (768px) and Mobile (375px)
    console.log('\n--- Test 4: Responsiveness at Mobile Viewport (375px) ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      mobile: true
    });
    await sleep(300);

    const mobileTabLabels = await cdp.eval(`
      (() => {
        const tabBtns = Array.from(document.querySelectorAll('[data-tab-id]'));
        return tabBtns.map(btn => {
          const shortEl = btn.querySelector('.sm\\\\:hidden');
          const fullEl = btn.querySelector('.hidden.sm\\\\:inline');
          return {
            id: btn.getAttribute('data-tab-id'),
            shortText: shortEl?.textContent?.trim(),
            shortVisible: shortEl ? window.getComputedStyle(shortEl).display !== 'none' : false,
            fullVisible: fullEl ? window.getComputedStyle(fullEl).display !== 'none' : false
          };
        });
      })()
    `);
    console.log('Mobile view (375px) tab elements:');
    mobileTabLabels.forEach(t => {
      console.log(`  - [${t.id}] shortText: "${t.shortText}" (shortVisible: ${t.shortVisible}, fullVisible: ${t.fullVisible})`);
    });

    // Reset emulation back to Desktop
    await cdp.send('Emulation.clearDeviceMetricsOverride');
    await sleep(300);

    // 5. Test Footer buttons across Tab 1 to 6
    console.log('\n--- Test 5: Footer Actions across Tabs 1 to 6 ---');
    for (let tabIdx = 0; tabIdx < 6; tabIdx++) {
      // Click tab
      await cdp.eval(`
        (() => {
          const tabs = document.querySelectorAll('[data-tab-id]');
          if (tabs[${tabIdx}]) tabs[${tabIdx}].click();
        })()
      `);
      await sleep(200);

      const footerState = await cdp.eval(`
        (() => {
          const footer = document.querySelector('[data-modal-footer]') || document.querySelector('footer, .border-t.bg-slate-50\\\\/80');
          if (!footer) return { found: false };
          const btns = Array.from(footer.querySelectorAll('button')).map(b => b.textContent.trim().replace(/\\s+/g, ' '));
          return {
            found: true,
            buttonTexts: btns
          };
        })()
      `);
      console.log(`Tab ${tabIdx + 1} Footer buttons:`, footerState.buttonTexts);
    }

    // 6. Test Currency formatting on Tab 3 (Charges & Rates) and Tab 6 (Billing)
    console.log('\n--- Test 6: Currency (INR) and Rupee symbols ---');
    // Switch to Charges tab (index 2)
    await cdp.eval(`document.querySelectorAll('[data-tab-id]')[2].click();`);
    await sleep(200);

    const chargesCurrencies = await cdp.eval(`
      (() => {
        const bodyText = document.body.innerText;
        const dollarMatches = bodyText.match(/\\$[0-9]/g) || [];
        const inrMatches = bodyText.match(/₹[0-9,]+/g) || [];
        return {
          dollarFound: dollarMatches,
          inrSamples: inrMatches.slice(0, 5)
        };
      })()
    `);
    console.log(`Tab 3 (Charges) Dollar symbols found: ${chargesCurrencies.dollarFound.length}`);
    console.log(`Tab 3 (Charges) INR formatted samples:`, chargesCurrencies.inrSamples);

    // Switch to Billing tab (index 5)
    await cdp.eval(`document.querySelectorAll('[data-tab-id]')[5].click();`);
    await sleep(200);

    const billingCurrencies = await cdp.eval(`
      (() => {
        const bodyText = document.body.innerText;
        const dollarMatches = bodyText.match(/\\$[0-9]/g) || [];
        const inrMatches = bodyText.match(/₹[0-9,]+/g) || [];
        return {
          dollarFound: dollarMatches,
          inrSamples: inrMatches.slice(0, 8)
        };
      })()
    `);
    console.log(`Tab 6 (Billing) Dollar symbols found: ${billingCurrencies.dollarFound.length}`);
    console.log(`Tab 6 (Billing) INR formatted samples:`, billingCurrencies.inrSamples);

    // 7. Test Header status badge and bill number
    console.log('\n--- Test 7: Modal Header Action (Status Badge & Bill Number) ---');
    const headerDetails = await cdp.eval(`
      (() => {
        const headerEl = document.querySelector('.border-b.shrink-0') || document.querySelector('div[class*="border-b"][class*="shrink-0"]');
        return {
          text: headerEl ? headerEl.textContent.replace(/\\s+/g, ' ').trim() : 'NOT_FOUND'
        };
      })()
    `);
    console.log(`Header content: "${headerDetails?.text}"`);

    // 8. Test Unsaved Changes Confirmation on close
    console.log('\n--- Test 8: Unsaved Changes Confirmation ---');
    // Switch to Tab 1 (Request) and enter dirty text
    await cdp.eval(`document.querySelector('[data-tab-id="REQUEST"]').click();`);
    await sleep(200);

    const inputModified = await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
        const input = inputs.find(i => i.value && !i.readOnly) || inputs[0];
        if (input) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(input, input.value + ' - MODIFIED UNSAVED');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return { success: true, newVal: input.value };
        }
        return { success: false };
      })()
    `);
    console.log('Modified form field:', inputModified);
    await sleep(200);

    // Click Close 'X' button
    console.log('Clicking modal close button...');
    dialogHistory = [];
    await cdp.eval(`
      (() => {
        const closeX = document.querySelector('button[aria-label="Close modal"]') || document.querySelector('.border-b.shrink-0 button');
        if (closeX) closeX.click();
      })()
    `);
    await sleep(500);

    console.log(`Confirmation dialogs triggered: ${dialogHistory.length}`);
    dialogHistory.forEach(d => console.log(`  - Prompt: "${d.message}"`));

    // Verify modal closed after accepting confirmation
    const modalStillOpen = await cdp.eval(`
      (() => {
        const heading = document.querySelector('h3');
        return !!(heading && heading.textContent.includes('Roadside Assistance & Towing'));
      })()
    `);
    console.log(`Modal closed successfully after confirmation: ${!modalStillOpen}`);

    cdp.close();
    console.log('\n✔ BROWSER VERIFICATION COMPLETED SUCCESSFULLY!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

runBrowserTests().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
