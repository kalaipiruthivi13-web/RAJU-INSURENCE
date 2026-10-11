import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function test() {
  const tmpDir = path.join(process.cwd(), '.tmp-debug-browser');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9444',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:5173'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2500));
    const res = await fetch('http://127.0.0.1:9444/json');
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

    const evalRes = await send('Runtime.evaluate', {
      expression: 'Array.from(document.querySelectorAll("button")).map(b => b.textContent.trim())',
      returnByValue: true
    });
    console.log('Buttons before click:', evalRes.result.value);

    // Look for button that opens Towing
    const clickTow = await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const towBtn = btns.find(b => b.textContent.includes('Towing Request'));
        if (towBtn) {
          towBtn.click();
          return 'Clicked Towing Request';
        }
        return 'Not found';
      })()`,
      returnByValue: true
    });
    console.log('Click Towing result:', clickTow.result.value);

    await new Promise(r => setTimeout(r, 1000));

    const evalRes2 = await send('Runtime.evaluate', {
      expression: 'Array.from(document.querySelectorAll("button")).map(b => b.textContent.trim())',
      returnByValue: true
    });
    console.log('Buttons after Towing click:', evalRes2.result.value);

    const checkPortal = await send('Runtime.evaluate', {
      expression: '!!document.getElementById("towing-printable-bill")',
      returnByValue: true
    });
    console.log('Portal towing-printable-bill exists in DOM:', checkPortal.result.value);

    const portalHtml = await send('Runtime.evaluate', {
      expression: 'document.getElementById("towing-printable-bill")?.outerHTML?.slice(0, 200)',
      returnByValue: true
    });
    console.log('Portal outerHTML snippet:', portalHtml.result.value);

    ws.close();
  } finally {
    chrome.kill();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

test().catch(console.error);
