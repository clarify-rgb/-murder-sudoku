'use strict';
const assert=require('assert');
const {chromium}=require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3,permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelectorAll('.cell').length===36);

  const people=page.locator('.person');
  const cells=page.locator('.cell');
  const eraser=page.locator('#eraserMode');
  const undo=page.locator('#undoBtn');

  async function usable(exclude=[]){
    return cells.evaluateAll((els,ex)=>els.findIndex((el,i)=>!ex.includes(i)&&!el.querySelector('.locked-footprint')&&!el.classList.contains('unavailable')),exclude);
  }
  async function hold(index){
    const c=cells.nth(index);
    await c.dispatchEvent('pointerdown',{pointerType:'touch',button:0,isPrimary:true});
    await page.waitForTimeout(850);
    await c.dispatchEvent('pointerup',{pointerType:'touch',button:0,isPrimary:true});
  }
  async function selectedName(){return page.locator('.person.selected .name').textContent()}

  // ONE-SHOT ERASER: note -> erase -> immediately note again with same selected person.
  await people.nth(1).click(); // B
  const first=await usable();
  assert(first>=0,'need a usable cell for B note');
  await cells.nth(first).tap();
  assert.strictEqual(await cells.nth(first).locator('.note').textContent(),'B','tap must add B note');
  await eraser.click();
  assert(await eraser.evaluate(el=>el.classList.contains('active')),'eraser must visibly arm');
  await cells.nth(first).tap();
  assert.strictEqual(await cells.nth(first).locator('.note').count(),0,'one-shot eraser must remove note');
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'eraser must auto-deactivate after successful note erase');
  assert.strictEqual(await selectedName(),'B','B must stay selected after erase');
  const second=await usable([first]);
  await cells.nth(second).tap();
  assert.strictEqual(await cells.nth(second).locator('.note').textContent(),'B','next tap must immediately behave normally');

  // Person selection cancels an armed eraser.
  await eraser.click();
  await people.nth(2).click(); // C
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'selecting a person must cancel eraser');

  // Multiple notes + readability hierarchy.
  await cells.nth(second).tap();
  assert.strictEqual(await cells.nth(second).locator('.note').count(),2,'cell must retain multiple candidate notes');
  const noteStyle=await cells.nth(second).locator('.note').first().evaluate(el=>{
    const s=getComputedStyle(el),box=el.getBoundingClientRect(),parent=getComputedStyle(el.parentElement);
    return{fontSize:parseFloat(s.fontSize),fontWeight:parseInt(s.fontWeight,10),color:s.color,background:s.backgroundColor,width:box.width,height:box.height,layout:parent.display,columns:parent.gridTemplateColumns,z:parseInt(s.zIndex||'0',10)};
  });
  assert(noteStyle.fontSize>=11,'note font must be clearly readable on mobile');
  assert(noteStyle.fontWeight>=700,'note font must be strong');
  assert.strictEqual(noteStyle.layout,'grid','multiple notes must use compact grid layout');
  assert(noteStyle.width>=14&&noteStyle.height>=14,'note hit/read area must not collapse');

  // Undo while eraser is armed must return to normal mode.
  await eraser.click();
  await undo.click();
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'Undo must not restore/stick eraser mode');

  // Recreate two notes, then Reset must clear eraser state.
  if((await cells.nth(second).locator('.note').count())<2){await cells.nth(second).tap()}
  await eraser.click();
  await page.locator('#clearBtn').click();
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'Reset must cancel eraser');

  // GREY STATE: choose a final cell whose row/column crosses a rendered object/Locked cell.
  await people.nth(3).click(); // D
  const finalIndex=await cells.evaluateAll(els=>els.findIndex((el,i)=>{
    if(el.querySelector('.locked-footprint'))return false;
    const r=Math.floor(i/6),c=i%6;
    return els.some((other,j)=>j!==i&&(Math.floor(j/6)===r||j%6===c)&&(other.querySelector('.object')||other.querySelector('.locked-footprint')));
  }));
  assert(finalIndex>=0,'need final cell crossing visible object geometry');
  await hold(finalIndex);
  assert.strictEqual(await cells.nth(finalIndex).locator('.final').textContent(),'D','hold = final must work');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),10,'one final must grey exactly other row+column cells');
  assert.strictEqual(await page.locator('.xmark').count(),0,'automatic X elements must not exist');
  assert(!(await page.locator('#board').textContent()).includes('✕'),'board must contain no automatic X characters');
  assert(!(await cells.nth(finalIndex).evaluate(el=>el.classList.contains('unavailable'))),'final cell itself must stay fully available/emphasized');

  const preserved=await page.locator('.cell.unavailable').evaluateAll(els=>{
    const info=els.map(el=>({
      background:getComputedStyle(el).backgroundColor,
      border:[getComputedStyle(el).borderTopWidth,getComputedStyle(el).borderRightWidth,getComputedStyle(el).borderBottomWidth,getComputedStyle(el).borderLeftWidth],
      hasObject:!!el.querySelector('.object'),hasLocked:!!el.querySelector('.locked-footprint'),
      objectVisible:el.querySelector('.object')?getComputedStyle(el.querySelector('.object')).visibility!=='hidden':true,
      lockedVisible:el.querySelector('.locked-footprint')?getComputedStyle(el.querySelector('.locked-footprint')).visibility!=='hidden':true
    }));
    return{info,hasGeometry:info.some(x=>x.hasObject||x.hasLocked)};
  });
  assert(preserved.hasGeometry,'chosen grey row/column must include object or Locked geometry');
  assert(preserved.info.every(x=>x.background!=='rgba(0, 0, 0, 0)'),'grey cells must retain underlying room background');
  assert(preserved.info.every(x=>x.border.every(v=>parseFloat(v)>=1)),'room/cell boundaries must remain rendered');
  assert(preserved.info.every(x=>x.objectVisible&&x.lockedVisible),'object/Locked rendering must remain visible in grey cells');

  // Undo final must recalculate greying.
  await undo.click();
  assert.strictEqual(await page.locator('.final').count(),0,'Undo must remove final placement');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),0,'Undo must clear derived grey state');

  // Erasing a final must also recalculate greying and auto-exit eraser.
  await hold(finalIndex);
  await eraser.click();
  await cells.nth(finalIndex).tap();
  assert.strictEqual(await cells.nth(finalIndex).locator('.final').count(),0,'eraser must remove final placement');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),0,'erasing final must clear derived grey state');
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'eraser must auto-exit after final erase');
  assert.strictEqual(await selectedName(),'D','selected person must survive final erase');

  // Multiple finals: combined greying is derived from current placements.
  await hold(finalIndex);
  await people.nth(4).click(); // E
  const secondFinal=await usable([finalIndex]);
  assert(secondFinal>=0,'need second available final cell');
  await hold(secondFinal);
  assert.strictEqual(await page.locator('.final').count(),2,'two finals must be present');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),18,'two distinct final rows/columns must produce combined derived greying');

  // Note styling remains visually smaller than final placement.
  const finalFont=await page.locator('.final').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  assert(noteStyle.fontSize<finalFont,'notes must remain smaller than final placements');

  // New Puzzle clears armed eraser state.
  await eraser.click();
  await page.locator('#newPuzzleBtn').click();
  await page.waitForFunction(()=>document.querySelectorAll('.cell').length===36);
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'New Puzzle must cancel eraser');

  // MOBILE SCROLL regression: pan-y from board, debug controls reachable/clickable above toolbar.
  const layout=await page.evaluate(()=>({scrollHeight:document.documentElement.scrollHeight,innerHeight:window.innerHeight,cellTouchAction:getComputedStyle(document.querySelector('.cell')).touchAction,paddingBottom:parseFloat(getComputedStyle(document.querySelector('.wrap')).paddingBottom)}));
  assert(layout.scrollHeight>layout.innerHeight,'document must still scroll beyond viewport');
  assert.strictEqual(layout.cellTouchAction,'pan-y','board must still permit vertical page panning');
  assert(layout.paddingBottom>=90,'safe bottom clearance must remain');
  await page.evaluate(()=>window.scrollTo(0,0));
  const board=await page.locator('#board').boundingBox();
  const client=await context.newCDPSession(page);
  const x=Math.round(board.x+board.width/2),startY=Math.round(Math.min(board.y+board.height*.70,760));
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:startY}]});
  for(const y of [startY-50,startY-110,startY-180,startY-250]){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await page.waitForTimeout(35)}
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(250);
  assert((await page.evaluate(()=>window.scrollY))>0,'vertical swipe beginning on board must still scroll');

  const copy=page.locator('#copyDebugBtn');
  await copy.evaluate(el=>el.scrollIntoView({block:'center'}));
  let box=await copy.boundingBox();
  assert(box&&box.y>=0&&box.y+box.height<=764,'COPY PUZZLE DEBUG must remain above simulated Safari toolbar');
  await copy.click();
  await page.waitForFunction(()=>document.getElementById('feedback').textContent.includes('Puzzle debug copied'));
  const load=page.locator('#loadPuzzleBtn');
  await load.evaluate(el=>el.scrollIntoView({block:'center'}));
  box=await load.boundingBox();
  assert(box&&box.y>=0&&box.y+box.height<=764,'LOAD PUZZLE ID must remain reachable');
  page.once('dialog',d=>d.dismiss());
  await load.click();

  console.log('FINAL EASY UI REFINEMENTS PASS',JSON.stringify({noteStyle,layout,finalIndex,secondFinal}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
