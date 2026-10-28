import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = 'C:/xampp/htdocs/gestionCyE_2606/documentacion';
const report = JSON.parse(fs.readFileSync(path.join(root, '09-consolidacion-datos.json'), 'utf8'));
const htmlPath = path.join(root, '09-consolidacion-datos.html');
const mdPath = path.join(root, '09-consolidacion-datos.md');
const html = fs.readFileSync(htmlPath, 'utf8');
const md = fs.readFileSync(mdPath, 'utf8');

const required = [
  '/api/ISIS_PedidoClteCab_VW',
  '/api/ISIS_PedidoClteDet_VW',
  '/api/ISIS_VentasCabecera_VW',
  '/api/ISIS_VentasDetalle_VW',
  '/api/ISIS_VentasDetalLeFCAnti_VW',
  '/api/ISIS_RemitoClienteCabecera_VW',
  '/api/ISIS_RemitoClienteDetalle_VW',
  '/api/ISIS_OperacionesClienteImputacion_VW',
  '/api/ISIS_Articulo_VW',
  '/api/ISIS_ArticuloStock_VW',
  '/api/ISIS_Cliente_VW',
  '/api/ISIS_Vendedor_VW'
];

const checks = {
  reportComplete: report.complete === true && report.pendingBrowser === false,
  queryCount: report.queries.length === 23,
  initialSources: required.every(endpoint => report.endpoints.some(item => item.path === endpoint && item.scope === 'Pantalla inicial')),
  htmlHasReport: html.includes('id="report-data"') && html.includes('Fuentes consolidadas'),
  markdownHasRules: md.includes('## Alcance y reglas') && md.includes('## Instrucciones de continuidad para otra IA'),
  noApiHeaders: !/X-API-KEY|X-Api-Key|Authorization|Headers\s*=\s*\[/i.test(html + '\n' + md)
};

if (Object.values(checks).some(value => !value)) {
  console.error(JSON.stringify(checks, null, 2));
  process.exit(1);
}

const require = createRequire(import.meta.url);
const playwright = require('C:/Users/cafre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await playwright.chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
});
const issues = [];
const screenshots = [];
for (const viewport of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', error => issues.push(viewport.name + ': ' + error.message));
  await page.goto(pathToFileURL(htmlPath).href);
  await page.waitForLoadState('domcontentloaded');
  const state = await page.evaluate(() => ({
    title: document.title,
    rows: document.querySelectorAll('#endpoints tbody tr').length,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    notice: document.querySelector('.notice')?.textContent.trim()
  }));
  if (state.rows < 1 || state.horizontalOverflow || !state.notice?.includes('Fuentes consolidadas')) {
    issues.push(viewport.name + ': ' + JSON.stringify(state));
  }
  const screenshot = path.join(process.env.TEMP, 'gestioncye-consolidacion-' + viewport.name + '.png');
  await page.screenshot({ path: screenshot, fullPage: false });
  screenshots.push(screenshot);
}
await browser.close();
if (issues.length) {
  console.error(JSON.stringify({checks,issues}, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({checks, browser:'desktop + mobile sin errores ni desborde global', screenshots}, null, 2));
