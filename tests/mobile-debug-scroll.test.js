'use strict';
const assert=require('assert');
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3,permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelectorAll('.cell').length===36);
  const layout=await page.evaluate(()=>({
    scrollHeight:document.documentElement.scrollHeight,
    innerHeight:window.innerHeight,
    htmlOverflow:getComputedStyle(document.documentElement).overflowY,
    bodyOverflow:getComputedStyle(document.body).overflowY,
    wrapHeight:getComputedStyle(document.querySelector('.wrap')).height,
    wrapMinHeight:getComputedStyle(document.querySelector('.wrap')).minHeight,
    wrapOverflow:getComputedStyle(document.querySelector('.wrap')).overflowY,
    cellTouchAction:getComputedStyle(document.querySelector('.cell')).touchAction,
    wrapPaddingBottom:parseFloat(getComputedStyle(document.querySelector('.wrap')).paddingBottom)
  }));
  assert(layout.scrollHeight>layout.innerHeight,'document must grow beyond mobile viewport');
  assert.notStrictEqual(layout.htmlOverflow,'hidden');
  assert.notStrictEqual(layout.bodyOverflow,'hidden');
  assert.notStrictEqual(layout.wrapOverflow,'hidden');
  assert.strictEqual(layout.cellTouchAction,'pan-y','board cells must permit vertical panning');
  assert(layout.wrapPaddingBottom>=90,'must reserve bottom toolbar/safe-area clearance');

  await page.evaluate(()=>window.scrollTo(0,0));
  const board=await page.locator('#board').boundingBox();
  assert(board,'board missing');
  const client=await context.newCDPSession(page);
  const x=Math.round(board.x+board.width/2),startY=Math.round(Math.min(board.y+board.height*0.70,760));
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:startY}]});
  for(const y of [startY-50,startY-110,startY-180,startY-250]){
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});
    await new Promise(r=>setTimeout(r,35));
  }
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(250);
  const touchScroll=await page.evaluate(()=>({y:window.scrollY,max:document.documentElement.scrollHeight-window.innerHeight}));
  assert(touchScroll.max>0,'mobile document must have positive scroll range');
  assert(touchScroll.y>0,'touch swipe starting on board must scroll page');

  const copy=page.locator('#copyDebugBtn');
  await copy.evaluate(el=>el.scrollIntoView({block:'center'}));
  let box=await copy.boundingBox();
  assert(box&&box.y>=0&&box.y+box.height<=764,'COPY PUZZLE DEBUG must be above simulated Safari bottom toolbar');
  await copy.click();
  await page.waitForFunction(()=>document.getElementById('feedback').textContent.includes('Puzzle debug copied'));

  const load=page.locator('#loadPuzzleBtn');
  await load.evaluate(el=>el.scrollIntoView({block:'center'}));
  box=await load.boundingBox();
  assert(box&&box.y>=0&&box.y+box.height<=764,'LOAD PUZZLE ID must be above simulated Safari bottom toolbar');
  page.once('dialog',d=>d.dismiss());
  await load.click();

  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(100);
  assert((await page.evaluate(()=>window.scrollY))<5,'must scroll back to top');

  await page.locator('.person').first().click();
  const usableIndex=await page.locator('.cell').evaluateAll(cells=>cells.findIndex(c=>!c.querySelector('.locked-footprint')));
  assert(usableIndex>=0,'no usable board cell');
  const cell=page.locator('.cell').nth(usableIndex);
  await cell.tap();
  assert((await cell.locator('.note').count())>0,'tap = note must remain functional');
  await cell.dispatchEvent('pointerdown',{pointerType:'touch',button:0,isPrimary:true});
  await page.waitForTimeout(850);
  await cell.dispatchEvent('pointerup',{pointerType:'touch',button:0,isPrimary:true});
  assert.strictEqual(await cell.locator('.final').textContent(),'A','hold = final must remain functional');

  console.log('Mobile debug scroll PASS',JSON.stringify({...layout,touchScroll}));
  await browser.close();
})().catch(async e=>{console.error(e);process.exit(1)});
