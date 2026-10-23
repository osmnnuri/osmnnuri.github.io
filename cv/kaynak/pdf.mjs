// Başsız Chrome ile özgeçmiş HTML'lerini A4 PDF'e yazdırır (üstte küçük başlık, sağ altta sayfa numarası).
//
//   node cv/kaynak/pdf.mjs                          → cv/ içine, telefonsuz (sitedeki sürüm)
//   node cv/kaynak/pdf.mjs <klasör> "+90 5xx ..."   → verilen klasöre, telefonlu (başvuru sürümü)
//
// Telefon numarası depoya yazılmaz; yalnızca yazdırırken <span data-telefon> içine eklenir.
// Telefonlu PDF'leri depo dışındaki bir klasöre kaydet.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const kaynak = dirname(fileURLToPath(import.meta.url));
const cikti = resolve(process.argv[2] ?? join(kaynak, '..'));
const telefon = process.argv[3] ?? '';
if (telefon && cikti === resolve(kaynak, '..')) {
  console.error('Telefonlu PDF depodaki cv/ klasörüne yazılmaz; depo dışında bir klasör ver.');
  process.exit(1);
}
mkdirSync(cikti, { recursive: true });

const chrome = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => p && existsSync(p));
if (!chrome) {
  console.error('Chrome bulunamadı; CHROME ortam değişkeniyle yolunu ver.');
  process.exit(1);
}

const isler = [
  { html: 'Osman-Nuri-Yasar-Ozgecmis-TR.html', pdf: 'Osman-Nuri-Yasar-Ozgecmis-TR.pdf', sayfa: 'Sayfa <span class="pageNumber"></span> / <span class="totalPages"></span>' },
  { html: 'Osman-Nuri-Yasar-CV-EN.html', pdf: 'Osman-Nuri-Yasar-CV-EN.pdf', sayfa: 'Page <span class="pageNumber"></span> of <span class="totalPages"></span>' },
];

const port = 9333;
const tarayici = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cvpdf-'))}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

let wsAdres;
for (let i = 0; i < 50 && !wsAdres; i++) {
  try {
    const liste = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsAdres = liste.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
  } catch { await bekle(200); }
}
const ws = new WebSocket(wsAdres);
await new Promise((r) => ws.addEventListener('open', r));
let sayac = 0;
const bekleyen = new Map();
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && bekleyen.has(m.id)) { bekleyen.get(m.id)(m); bekleyen.delete(m.id); }
});
const gonder = (method, params = {}) => new Promise((res, rej) => {
  const id = ++sayac;
  bekleyen.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const calistir = async (expression) => (await gonder('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

const kucuk = 'font-family: Arial, sans-serif; font-size: 7.5pt; color: #8a8a8a; width: 100%; padding: 0 18mm;';
for (const is of isler) {
  await gonder('Page.navigate', { url: pathToFileURL(join(kaynak, is.html)).href });
  for (let i = 0; i < 100 && !(await calistir('document.readyState === "complete"')); i++) await bekle(100);
  await calistir('document.fonts.ready.then(() => true)');
  await calistir(`document.querySelectorAll('[data-telefon]').forEach((e) => { e.textContent = ${JSON.stringify(telefon ? ' | ' + telefon : '')}; }); true`);
  const baslik = await calistir('document.title');
  const { data } = await gonder('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="${kucuk}">${baslik}</div>`,
    footerTemplate: `<div style="${kucuk} text-align: right;">${is.sayfa}</div>`,
  });
  writeFileSync(join(cikti, is.pdf), Buffer.from(data, 'base64'));
  console.log('yazıldı', join(cikti, is.pdf));
}
ws.close();
tarayici.kill();
