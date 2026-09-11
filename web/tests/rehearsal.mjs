// Run against an isolated, empty API database. Never resets a database.
// Start Chrome with --headless --remote-debugging-port=9227 and the app separately.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.REHEARSAL_URL ?? 'http://127.0.0.1:5175';
const debug = process.env.CHROME_DEBUG_URL ?? 'http://127.0.0.1:9227';
const api = `${base}/api`;
const initial = await (await fetch(`${api}/graph`)).json();
assert.equal(initial.accounts.length, 0, 'Use an isolated empty rehearsal database');
assert.deepEqual(await (await fetch(`${api}/rings`)).json(), []);
assert.equal((await fetch(`${api}/accounts/missing/risk`)).status, 404);
assert.equal((await fetch(`${api}/rings/missing/explanation`)).status, 404);
const tabs = await (await fetch(`${debug}/json`)).json();
const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
const errors = [];
let explanationRequests = 0;
ws.addEventListener('message', ({ data }) => {
  const m = JSON.parse(data);
  if (m.id) {
    const pair = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) pair.reject(new Error(JSON.stringify(m.error))); else pair.resolve(m.result);
  }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
  if (m.method === 'Network.requestWillBeSent' && m.params.request.url.endsWith('/explanation')) explanationRequests++;
});
function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function until(expression, timeout = 40000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return;
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timed out: ${expression}\n${await evaluate("document.body.textContent")}`);
}
async function clickText(text) {
  await evaluate(`Array.from(document.querySelectorAll('button,div,span')).find(e => e.textContent.trim() === ${JSON.stringify(text)}).click()`);
}
async function key(key) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key });
}
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${base}/#/app` });
  await until(`document.body.textContent.includes('No data loaded')`);
  assert(await evaluate(`document.body.textContent.includes('LIVE BACKEND')`));
  await clickText('Upload event log');
  const doc = await send('DOM.getDocument');
  const input = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'input[type=file]' });
  await send('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [resolve('data-generator/output/events.csv')] });
  await until(`document.body.textContent.includes('Upload complete')`);
  await clickText('Back to the graph');
  await until(`document.body.textContent.includes('26,814')`);
  assert(await evaluate(`document.body.textContent.includes('388')`));
  await until(`document.querySelector('canvas') !== null`);
  // Prefetch begins before an analyst opens the panel.
  await new Promise(r => setTimeout(r, 200));
  assert.equal(explanationRequests, 1);
  await clickText('Payment-moment view');
  assert(await evaluate(`document.body.textContent.includes('7,607')`));
  await clickText('Payment-moment view');
  await key('Enter');
  await until(`document.body.textContent.includes('Model interpretation')`);
  const bounds = await evaluate(`(() => {const label=Array.from(document.querySelectorAll('span')).find(e=>e.textContent==='Model interpretation'); const panel=label.parentElement.parentElement.parentElement; const r=panel.getBoundingClientRect(); return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width};})()`);
  assert(bounds.y >= 0 && bounds.bottom <= 1080 && bounds.right <= 1920 && bounds.width === 380, JSON.stringify(bounds));
  await until(`!document.querySelector('[style*="fr-shim"]')`);
  assert.equal(explanationRequests, 1, 'Panel must share prefetch');
  const panelText = await evaluate(`document.body.textContent`);
  assert(!panelText.includes('320 days'), 'No unrelated whale explanation');
  assert(!panelText.includes('**'), 'No bold Markdown markers');
  assert(panelText.includes('Written by Claude') || panelText.includes('Template text') || panelText.includes('The explanation is late'));
  console.log('Panel visible; explanation prefetched:', bounds, panelText.includes('Written by Claude') ? 'Claude' : 'fallback');
  await key('f'); await key('Enter');
  await until(`document.body.textContent.includes('Recorded as fraud') && document.body.textContent.includes('1/1')`);
  const graph = await (await fetch(`${api}/graph`)).json();
  assert.equal(graph.stats.totalEvents, 388);
  assert.equal(Math.round(graph.stats.totalVolumeUsd), 26814);
  assert(graph.rings.some(r => r.status === 'confirmed_fraud'));
  await key('Escape');
  await evaluate(`(() => {const slider=document.querySelector('input[type=range]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(slider,'80'); slider.dispatchEvent(new Event('input',{bubbles:true})); slider.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await until(`document.body.textContent.includes('2 / 3 rings')`);
  await clickText('Payment-moment view');
  assert(await evaluate(`document.body.textContent.includes('10,571')`));
  const successShot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile('/tmp/unecom-rehearsal-success.png', Buffer.from(successShot.data, 'base64'));
  const sample = await (await fetch(`${base}/sample-events.json`)).json();
  const duplicate = await (await fetch(`${api}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sample) })).json();
  assert.equal(duplicate.inserted, 0); assert.equal(duplicate.skipped, 388);
  assert.equal((await fetch(`${api}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
  assert.equal((await fetch(`${api}/rings/missing/explanation`)).status, 404);
  // Failure path: a fresh page must not turn a live ring into a mock whale.
  await send('Network.setBlockedURLs', { urls: ['*/rings/*/explanation', '*/rings/*/decision'] });
  const loaded = new Promise(resolve => {
    const listener = ({ data }) => {
      if (JSON.parse(data).method === 'Page.loadEventFired') {
        ws.removeEventListener('message', listener); resolve();
      }
    };
    ws.addEventListener('message', listener);
  });
  await send('Page.reload');
  await loaded;
  await until(`document.body.textContent.includes('26,814')`);
  await key('Enter');
  // The confirmed case is under the decided tab.
  await clickText('Decided'); await key('Enter');
  await until(`document.body.textContent.includes('The explanation is late')`);
  assert(!await evaluate(`document.body.textContent.includes('Written by Claude') || document.body.textContent.includes('320 days')`));
  await key('r'); await key('Enter');
  await until(`document.body.textContent.includes('Decision not saved')`);
  assert((await (await fetch(`${api}/graph`)).json()).rings.some(r => r.status === 'confirmed_fraud'));
  assert.deepEqual(errors, []);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile('/tmp/unecom-rehearsal.png', Buffer.from(shot.data, 'base64'));
  console.log('PASS: empty DB, upload, panel, prefetch, totals, decision, dedupe, 400/404, safe explanation/decision failures, no JS exceptions');
} finally { ws.close(); }
