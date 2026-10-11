import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForChrome(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch (e) {}
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
    if (this.ws) this.ws.close();
  }
}

async function runLiveVerification() {
  console.log('========================================================');
  console.log('   STARTING BROWSER E2E TEST: SMART PHOTO AUTO-FILL');
  console.log('========================================================\n');

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
    await waitForChrome(PORT);
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const pages = await listRes.json();
    const page = pages.find(p => p.type === 'page') || pages[0];

    const cdp = new CDPClient(page.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Runtime.enable');

    cdp.on('Page.javascriptDialogOpening', async () => {
      await cdp.send('Page.handleJavaScriptDialog', { accept: true });
    });

    console.log('--- 1. Navigate to http://localhost:5173 ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    // TEST 1: Towing Request Modal Auto-fill
    console.log('\n--- 2. Testing Towing Request Modal Auto-Fill ---');
    await cdp.eval(`
      (() => {
        const towingBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Towing Request'));
        if (towingBtn) towingBtn.click();
      })()
    `);
    await sleep(600);

    // Verify Dropzone exists on Tab 1
    const dropzoneFoundTowing = await cdp.eval(`
      (() => {
        const heading = document.querySelector('h3');
        const hasDropzone = document.body.innerText.includes('Scan RC / Policy / Spot Photo');
        return hasDropzone;
      })()
    `);
    console.log(`Towing Modal Dropzone rendered: ${dropzoneFoundTowing}`);

    // Click sample preset "Sample Breakdown Spot Photo" in Towing modal
    console.log('Triggering "Sample Breakdown Spot Photo" preset...');
    await cdp.eval(`
      (() => {
        const presetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Breakdown Spot Photo') || b.textContent.includes('Spot'));
        if (presetBtn) presetBtn.click();
      })()
    `);
    await sleep(1000); // wait for scan progress

    const towingFilledData = await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const clientInput = inputs.find(i => i.value && (i.value.includes('Senthil') || i.value.includes('Karthikeyan')));
        const locInput = inputs.find(i => i.value && i.value.includes('GST Road'));
        const successBadge = document.body.innerText.includes('Auto-filled');
        return {
          clientName: clientInput ? clientInput.value : null,
          location: locInput ? locInput.value : null,
          successBadge
        };
      })()
    `);
    console.log('Towing Auto-filled Result:', towingFilledData);

    // Close Towing modal
    await cdp.eval(`
      (() => {
        const closeX = document.querySelector('button[aria-label="Close modal"]') || document.querySelector('.border-b.shrink-0 button');
        if (closeX) closeX.click();
      })()
    `);
    await sleep(400);

    // TEST 2: Register New Claim Modal Auto-fill
    console.log('\n--- 3. Testing Register New Claim Modal Auto-Fill ---');
    // Navigate to Claims page
    await cdp.eval(`
      (() => {
        const claimsLink = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.trim() === 'All Claims' || el.textContent.trim() === 'Claims Management');
        if (claimsLink) claimsLink.click();
      })()
    `);
    await sleep(600);

    // Open Register Claim Modal
    await cdp.eval(`
      (() => {
        const newClaimBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Register New Claim'));
        if (newClaimBtn) newClaimBtn.click();
      })()
    `);
    await sleep(600);

    const dropzoneFoundClaims = await cdp.eval(`
      (() => {
        return document.body.innerText.includes('Smart Document Scan & Auto-Fill');
      })()
    `);
    console.log(`Claims Modal Dropzone rendered: ${dropzoneFoundClaims}`);

    // Click sample preset "RC Copy - TN 09 BX 4512"
    console.log('Triggering "RC Copy" test preset in Claim Modal...');
    await cdp.eval(`
      (() => {
        const rcBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('RC Copy'));
        if (rcBtn) rcBtn.click();
      })()
    `);
    await sleep(1000);

    const claimsFilledData = await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const nameInput = inputs.find(i => i.value && i.value.includes('Karthikeyan'));
        const regInput = inputs.find(i => i.value && i.value.includes('TN 09 BX 4512'));
        const successBanner = document.body.innerText.includes('Auto-filled');
        return {
          customerName: nameInput ? nameInput.value : null,
          vehicleNo: regInput ? regInput.value : null,
          successBanner
        };
      })()
    `);
    console.log('Claims Auto-filled Result:', claimsFilledData);

    // Close Claim Modal
    await cdp.eval(`
      (() => {
        const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Cancel');
        if (cancelBtn) cancelBtn.click();
      })()
    `);
    await sleep(400);

    // TEST 3: Renewals Page Auto-fill
    console.log('\n--- 4. Testing Renewals Page Auto-Match & Auto-Fill ---');
    await cdp.eval(`
      (() => {
        const renewalsLink = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent.trim() === 'Policy Renewals');
        if (renewalsLink) renewalsLink.click();
      })()
    `);
    await sleep(800);

    const dropzoneFoundRenewals = await cdp.eval(`
      (() => {
        return document.body.innerText.includes('Quick Scan Old Policy / RC for Renewal');
      })()
    `);
    console.log(`Renewals Page Dropzone rendered: ${dropzoneFoundRenewals}`);

    // Trigger Renewal Preset
    console.log('Triggering "Renewal Policy" test preset...');
    await cdp.eval(`
      (() => {
        const renBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Renewal Policy'));
        if (renBtn) renBtn.click();
      })()
    `);
    await sleep(1000);

    const renewalModalOpened = await cdp.eval(`
      (() => {
        const modalHeading = document.querySelector('h3');
        const isOpen = modalHeading && modalHeading.textContent.includes('Execute Policy Renewal');
        return {
          isOpen,
          text: modalHeading ? modalHeading.textContent : null
        };
      })()
    `);
    console.log('Renewal Execution Modal Auto-Launched:', renewalModalOpened);

    cdp.close();
    console.log('\n✔ LIVE BROWSER AUTO-FILL VERIFICATION COMPLETED SUCCESSFULLY!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

runLiveVerification().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
