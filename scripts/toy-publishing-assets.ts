import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const page=await b.newPage({viewport:{width:1200,height:900},deviceScaleFactor:1});
await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);
await page.evaluate(()=>(window as any).__PAIPAI_TEST__.home());
await page.screenshot({path:'artifacts/toy-cover-1200x900.png'});
await page.setViewportSize({width:500,height:500});
await page.goto('http://localhost:4173/assets/favicon.svg');
await page.screenshot({path:'artifacts/toy-icon-500x500.png',omitBackground:true});
for(const [file,w,h] of [['toy-cover-1200x900.png',1200,900],['toy-icon-500x500.png',500,500]] as const){const png=await fs.readFile('artifacts/'+file);assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h)}
await b.close();console.log('Toy cover 1200x900 and icon 500x500 generated');
