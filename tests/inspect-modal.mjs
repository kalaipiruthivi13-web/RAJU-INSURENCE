import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function test() {
  const tmpDir = path.join(process.cwd(), '.tmp-inspect-modal');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9777',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:5173'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch('http://127.0.0.1:9777/json');
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

    // Wait for Dashboard to render
    await new Promise(r => setTimeout(r, 1000));

    // Click Towing Request
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const towBtn = btns.find(b => b.textContent.includes('Towing Request'));
        if (towBtn) towBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1000));

    // Inspect the entire modal HTML or footer
    const info = await send('Runtime.evaluate', {
      expression: `(() => {
        const modalContainer = document.querySelector('.fixed.inset-0.z-50');
        if (!modalContainer) return { modalFound: false };
        const buttons = Array.from(modalContainer.querySelectorAll('button')).map(b => ({
          text: b.textContent.trim(),
          classes: b.className,
          tag: b.tagName
        }));
        const footerEl = modalContainer.querySelector('.border-t.border-slate-100');
        return {
          modalFound: true,
          buttonCount: buttons.length,
          buttons,
          footerFound: !!footerEl,
          footerHtml: footerEl ? footerEl.outerHTML : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Modal Inspection Result:', JSON.stringify(info.result.value, null, 2));

    ws.close();
  } finally {
    chrome.kill();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

test().catch(console.error);
