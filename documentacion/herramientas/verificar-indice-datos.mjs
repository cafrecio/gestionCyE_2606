import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/cafre/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const htmlPath = 'C:/xampp/htdocs/gestionCyE_2606/documentacion/01-datos-indice.html';
const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const results = [];
for (const viewport of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]) {
  const page = await browser.newPage({viewport});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(htmlPath).href);
  const result = await page.evaluate(() => ({
    title: document.title,
    current: document.querySelector('.current')?.textContent.includes('01-01-01.1.1'),
    topics: document.querySelectorAll('#mapa .row').length,
    tasks: document.querySelectorAll('#pendiente li').length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    iaLink: document.querySelector('a[href="01-datos-indice.md"]') !== null
  }));
  results.push({viewport:viewport.name,...result,errors});
}
await browser.close();
const valid = results.every(item => item.current && item.topics === 14 && item.tasks === 7 && !item.overflow && item.iaLink && item.errors.length === 0);
console.log(JSON.stringify({valid,results},null,2));
if (!valid) process.exit(1);
