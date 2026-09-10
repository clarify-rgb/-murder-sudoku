'use strict';
const assert=require('assert');
const {chromium}=require('playwright');
const {PNG}=require('pngjs');

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3,permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelectorAll('.cell').length===36);

  const people=page.locator('.person'),cells=page.locator('.cell'),undo=page.locator('#undoBtn'),eraser=page.locator('#eraserMode');
  const client=await context.newCDPSession(page);
  async function hold(index){
    const box=await cells.nth(index).boundingBox();assert(box,'hold target missing');
    const x=Math.round(box.x+box.width/2),y=Math.round(box.y+box.height/2);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    await page.waitForTimeout(850);
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(90);
  }
  async function usable(){return cells.evaluateAll(els=>els.map((el,i)=>({i,ok:!el.querySelector('.locked-footprint')&&!el.classList.contains('unavailable')})).filter(x=>x.ok).map(x=>x.i))}
  function interiorStats(buf){
    const png=PNG.sync.read(buf),x0=Math.floor(png.width*.22),x1=Math.ceil(png.width*.78),y0=Math.floor(png.height*.22),y1=Math.ceil(png.height*.78);
    let spread=0,count=0,luma=0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
      const i=(y*png.width+x)*4,r=png.data[i],g=png.data[i+1],b=png.data[i+2],a=png.data[i+3];
      if(a<240)continue;spread+=Math.max(r,g,b)-Math.min(r,g,b);luma+=(r+g+b)/3;count++;
    }
    return{spread:spread/count,luma:luma/count,count};
  }

  await page.locator('#clearBtn').click();
  const target=await cells.evaluateAll(els=>els.findIndex((el,i)=>{
    if(el.querySelector('.locked-footprint'))return false;
    const r=Math.floor(i/6),c=i%6;
    const axis=els.map((other,j)=>({other,j})).filter(({j})=>j!==i&&(Math.floor(j/6)===r||j%6===c));
    return axis.some(({other})=>other.querySelector('.object')||other.querySelector('.locked-footprint'))&&axis.some(({other})=>!other.querySelector('.locked-footprint'));
  }));
  assert(target>=0,'need a final target crossing visible geometry');
  const tr=Math.floor(target/6),tc=target%6;
  const noteTarget=await cells.evaluateAll((els,pos)=>els.findIndex((el,i)=>i!==pos.target&&(Math.floor(i/6)===pos.r||i%6===pos.c)&&!el.querySelector('.locked-footprint')), {target,r:tr,c:tc});
  assert(noteTarget>=0,'need a row/column cell for preserved note');

  // Put a B note in a cell that will become unavailable, then finalize A.
  await people.nth(1).click();
  await cells.nth(noteTarget).tap();
  assert.strictEqual(await cells.nth(noteTarget).locator('.note').textContent(),'B','B note must exist before A final');
  await people.nth(0).click();
  await hold(target);

  assert.strictEqual(await cells.nth(target).locator('.final').textContent(),'A','hold must finalize A');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),10,'one final must create exactly 10 unavailable cells');
  assert(!(await cells.nth(target).evaluate(el=>el.classList.contains('unavailable'))),'final cell must remain full color');
  const finalFilter=await cells.nth(target).evaluate(el=>getComputedStyle(el).filter);
  assert.strictEqual(finalFilter,'none','final cell must have no desaturation filter');
  const filters=await page.locator('.cell.unavailable').evaluateAll(els=>els.map(el=>getComputedStyle(el).filter));
  assert(filters.every(v=>v==='grayscale(1) brightness(0.78) contrast(1.18)'),'all unavailable cells must use exact strong filter');
  const availableIndex=await cells.evaluateAll(els=>els.findIndex(el=>!el.classList.contains('unavailable')&&!el.querySelector('.final')&&!el.querySelector('.locked-footprint')));
  assert(availableIndex>=0,'need a normal available cell');
  assert.strictEqual(await cells.nth(availableIndex).evaluate(el=>getComputedStyle(el).filter),'none','available cells must remain full color');
  assert.strictEqual(await cells.nth(noteTarget).locator('.note').textContent(),'B','other-person note must remain visible in unavailable cell');
  const noteStyle=await cells.nth(noteTarget).locator('.note').evaluate(el=>({visibility:getComputedStyle(el).visibility,fontSize:parseFloat(getComputedStyle(el).fontSize),fontWeight:parseInt(getComputedStyle(el).fontWeight,10)}));
  assert.strictEqual(noteStyle.visibility,'visible');assert(noteStyle.fontSize>=11&&noteStyle.fontWeight>=900,'notes must remain readable');

  const geometry=await page.locator('.cell.unavailable').evaluateAll(els=>els.filter(el=>el.querySelector('.object')||el.querySelector('.locked-footprint')).map(el=>({
    object:el.querySelector('.object')?{text:el.querySelector('.object').textContent,visibility:getComputedStyle(el.querySelector('.object')).visibility}:null,
    locked:el.querySelector('.locked-footprint')?getComputedStyle(el.querySelector('.locked-footprint')).visibility:null,
    borders:[getComputedStyle(el).borderTopWidth,getComputedStyle(el).borderRightWidth,getComputedStyle(el).borderBottomWidth,getComputedStyle(el).borderLeftWidth]
  })));
  assert(geometry.length>0,'unavailable axis must include Object/Locked geometry');
  assert(geometry.every(x=>(!x.object||x.object.visibility==='visible')&&(!x.locked||x.locked==='visible')),'Object/Locked labels and footprints must remain visible');
  assert(geometry.every(x=>x.borders.every(v=>parseFloat(v)>=1)),'room/cell boundaries must remain visible');

  // Pixel-level mobile confirmation: unavailable plain cell is effectively monochrome while an active plain cell retains color.
  const plainUnavailable=await cells.evaluateAll(els=>els.findIndex(el=>el.classList.contains('unavailable')&&!el.querySelector('.object')&&!el.querySelector('.locked-footprint')&&!el.querySelector('.note')));
  const plainAvailable=await cells.evaluateAll(els=>els.findIndex(el=>!el.classList.contains('unavailable')&&!el.querySelector('.object')&&!el.querySelector('.locked-footprint')&&!el.querySelector('.note')&&!el.querySelector('.final')));
  assert(plainUnavailable>=0&&plainAvailable>=0,'need plain cells for visual sampling');
  const bw=interiorStats(await cells.nth(plainUnavailable).screenshot()),color=interiorStats(await cells.nth(plainAvailable).screenshot());
  assert(bw.spread<4,'unavailable cell must render nearly black-and-white');
  assert(color.spread>20,'available cell must retain obvious room color');

  // Second final: both actual final cells stay full color, combined unavailable state is derived.
  await people.nth(1).click();
  const second=(await usable()).find(i=>i!==target);
  assert(Number.isInteger(second),'need a second final target');
  await hold(second);
  assert.strictEqual(await page.locator('.final').count(),2,'two finals must be present');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),18,'two finals must combine to 18 unavailable cells');
  const finalFilters=await page.locator('.cell:has(.final)').evaluateAll(els=>els.map(el=>getComputedStyle(el).filter));
  assert(finalFilters.every(v=>v==='none'),'every actual final cell must stay full color');

  await undo.click();
  assert.strictEqual(await page.locator('.final').count(),1,'Undo must remove second final only');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),10,'Undo must recalculate unavailable cells');
  await eraser.click();
  await cells.nth(target).tap();
  assert.strictEqual(await page.locator('.final').count(),0,'Eraser must remove remaining final');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),0,'erase must recalculate unavailable cells to zero');
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'Eraser must remain one-shot');

  // Mobile scroll/debug regression.
  const layout=await page.evaluate(()=>({scrollHeight:document.documentElement.scrollHeight,innerHeight:innerHeight,touchAction:getComputedStyle(document.querySelector('.cell')).touchAction,paddingBottom:parseFloat(getComputedStyle(document.querySelector('.wrap')).paddingBottom)}));
  assert(layout.scrollHeight>layout.innerHeight,'page must remain scrollable');
  assert.strictEqual(layout.touchAction,'pan-y','board must retain pan-y');
  assert(layout.paddingBottom>=90,'bottom safe-area clearance must remain');
  await page.evaluate(()=>scrollTo(0,0));
  const board=await page.locator('#board').boundingBox(),x=Math.round(board.x+board.width/2),startY=Math.round(Math.min(board.y+board.height*.7,760));
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:startY}]});
  for(const y of [startY-50,startY-110,startY-180,startY-250]){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await page.waitForTimeout(35)}
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200);
  assert((await page.evaluate(()=>scrollY))>0,'vertical swipe beginning on board must scroll');
  const copy=page.locator('#copyDebugBtn');await copy.evaluate(el=>el.scrollIntoView({block:'center'}));let box=await copy.boundingBox();assert(box&&box.y>=0&&box.y+box.height<=764,'COPY PUZZLE DEBUG must be reachable');await copy.click();
  await page.waitForFunction(()=>document.getElementById('feedback').textContent.includes('Puzzle debug copied'));
  const load=page.locator('#loadPuzzleBtn');await load.evaluate(el=>el.scrollIntoView({block:'center'}));box=await load.boundingBox();assert(box&&box.y>=0&&box.y+box.height<=764,'LOAD PUZZLE ID must be reachable');

  console.log('STRONG UNAVAILABLE VISUAL PASS',JSON.stringify({filter:'grayscale(100%) brightness(.78) contrast(1.18)',target,noteTarget,second,bw,color,layout,noteStyle}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
