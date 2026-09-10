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
  const client=await context.newCDPSession(page);

  async function usableIndices(){
    return cells.evaluateAll(els=>els.map((el,i)=>({i,ok:!el.querySelector('.locked-footprint')&&!el.classList.contains('unavailable')})).filter(x=>x.ok).map(x=>x.i));
  }
  async function hold(index){
    const box=await cells.nth(index).boundingBox();
    assert(box,'hold target missing');
    const x=Math.round(box.x+box.width/2),y=Math.round(box.y+box.height/2);
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    await page.waitForTimeout(850);
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.waitForTimeout(90);
  }
  async function noteTexts(index){return cells.nth(index).locator('.note').allTextContents()}
  async function countNote(letter){return (await page.locator('.note').allTextContents()).filter(x=>x===letter).length}

  // NOTES -> FINAL: A in four cells, B in two of the same cells.
  const initial=await usableIndices();
  assert(initial.length>=4,'need four usable cells');
  const aCells=initial.slice(0,4),finalTarget=aCells[3];
  await people.nth(0).click(); // A
  for(const i of aCells)await cells.nth(i).tap();
  assert.strictEqual(await countNote('A'),4,'A must have four notes before finalization');

  await people.nth(1).click(); // B
  for(const i of aCells.slice(0,2))await cells.nth(i).tap();
  for(const i of aCells.slice(0,2))assert.deepStrictEqual((await noteTexts(i)).sort(),['A','B'],'shared cells must contain A and B before finalization');

  await people.nth(0).click(); // A
  await hold(finalTarget);
  assert.strictEqual(await cells.nth(finalTarget).locator('.final').textContent(),'A','hold must finalize A');
  assert.strictEqual(await countNote('A'),0,'finalizing A must remove every A note');
  assert.strictEqual(await countNote('B'),2,'finalizing A must preserve B notes');
  for(const i of aCells.slice(0,2))assert.deepStrictEqual(await noteTexts(i),['B'],'only B must remain in shared note cells');

  // One Undo restores the entire pre-final state, including cleared A notes.
  await undo.click();
  assert.strictEqual(await page.locator('.final').count(),0,'one Undo must remove the A final');
  assert.strictEqual(await countNote('A'),4,'Undo must restore all four A notes');
  assert.strictEqual(await countNote('B'),2,'Undo must preserve the two B notes');
  for(const i of aCells.slice(0,2))assert.deepStrictEqual((await noteTexts(i)).sort(),['A','B'],'Undo must restore shared A+B note state');

  // Finalize again, then erase: old A notes must not reappear.
  await hold(finalTarget);
  assert.strictEqual(await countNote('A'),0,'second finalization must clear A notes again');
  await eraser.click();
  await cells.nth(finalTarget).tap();
  assert.strictEqual(await page.locator('.final').count(),0,'one-shot Eraser must remove A final');
  assert.strictEqual(await countNote('A'),0,'erasing a final must not recreate previously cleared A notes');
  assert.strictEqual(await countNote('B'),2,'erasing A final must not affect B notes');
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'Eraser must auto-deactivate after successful final erase');

  // Reset only player state before focused grey-state test.
  await page.locator('#clearBtn').click();
  await people.nth(0).click(); // A
  const greyTarget=await cells.evaluateAll(els=>els.findIndex((el,i)=>{
    if(el.querySelector('.locked-footprint'))return false;
    const r=Math.floor(i/6),c=i%6;
    return els.some((other,j)=>j!==i&&(Math.floor(j/6)===r||j%6===c)&&(other.querySelector('.object')||other.querySelector('.locked-footprint')));
  }));
  assert(greyTarget>=0,'need final cell whose row/column crosses board geometry');
  await hold(greyTarget);
  assert.strictEqual(await page.locator('.cell.unavailable').count(),10,'one final must grey the other 10 row/column cells');
  assert(!(await cells.nth(greyTarget).evaluate(el=>el.classList.contains('unavailable'))),'final cell itself must not be muted');
  assert.strictEqual(await page.locator('.xmark').count(),0,'automatic X elements must remain absent');
  assert(!(await page.locator('#board').textContent()).includes('✕'),'automatic X characters must remain absent');

  const greyInfo=await page.locator('.cell.unavailable').evaluateAll(els=>{
    const first=getComputedStyle(els[0]);
    const shadow=first.boxShadow;
    const m=shadow.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/);
    const alpha=m?parseFloat(m[1]):0;
    const geometry=els.filter(el=>el.querySelector('.object')||el.querySelector('.locked-footprint')).map(el=>({
      objectVisible:el.querySelector('.object')?getComputedStyle(el.querySelector('.object')).visibility!=='hidden':true,
      lockedVisible:el.querySelector('.locked-footprint')?getComputedStyle(el.querySelector('.locked-footprint')).visibility!=='hidden':true,
      background:getComputedStyle(el).backgroundColor,
      borders:[getComputedStyle(el).borderTopWidth,getComputedStyle(el).borderRightWidth,getComputedStyle(el).borderBottomWidth,getComputedStyle(el).borderLeftWidth]
    }));
    return{shadow,alpha,geometry};
  });
  assert(greyInfo.alpha>=0.44,'unavailable overlay must be noticeably darker than the prior 0.30 treatment');
  assert(greyInfo.geometry.length>0,'grey row/column must include visible object/Locked geometry');
  assert(greyInfo.geometry.every(x=>x.objectVisible&&x.lockedVisible),'object and Locked rendering must remain visible');
  assert(greyInfo.geometry.every(x=>x.background!=='rgba(0, 0, 0, 0)'),'underlying room color must remain rendered');
  assert(greyInfo.geometry.every(x=>x.borders.every(v=>parseFloat(v)>=1)),'room/cell boundaries must remain readable');

  // Second final combines greying; one Undo recalculates to first final only.
  await people.nth(1).click(); // B
  const availableAfterA=await usableIndices();
  const secondFinal=availableAfterA.find(i=>i!==greyTarget);
  assert(Number.isInteger(secondFinal),'need a second available final cell');
  await hold(secondFinal);
  assert.strictEqual(await page.locator('.final').count(),2,'two finals must be present');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),18,'two distinct final rows/columns must combine to 18 unavailable cells');
  await undo.click();
  assert.strictEqual(await page.locator('.final').count(),1,'one Undo must remove only the second final');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),10,'Undo must recalculate greying from the remaining final');

  // Erase remaining final and verify greying returns to zero.
  await eraser.click();
  await cells.nth(greyTarget).tap();
  assert.strictEqual(await page.locator('.final').count(),0,'Eraser must remove remaining final');
  assert.strictEqual(await page.locator('.cell.unavailable').count(),0,'erasing remaining final must clear derived grey state');
  assert(!(await eraser.evaluate(el=>el.classList.contains('active'))),'Eraser must remain one-shot');

  // Tap = note still works after all operations.
  const open=await usableIndices();
  await cells.nth(open[0]).tap();
  assert.strictEqual(await cells.nth(open[0]).locator('.note').textContent(),'A','tap must still create selected-person note');

  // Mobile scroll regression and debug reachability.
  const layout=await page.evaluate(()=>({scrollHeight:document.documentElement.scrollHeight,innerHeight:window.innerHeight,touchAction:getComputedStyle(document.querySelector('.cell')).touchAction,paddingBottom:parseFloat(getComputedStyle(document.querySelector('.wrap')).paddingBottom)}));
  assert(layout.scrollHeight>layout.innerHeight,'document must remain vertically scrollable');
  assert.strictEqual(layout.touchAction,'pan-y','board must retain pan-y');
  assert(layout.paddingBottom>=90,'Safari bottom clearance must remain');
  await page.evaluate(()=>window.scrollTo(0,0));
  const board=await page.locator('#board').boundingBox();
  const x=Math.round(board.x+board.width/2),startY=Math.round(Math.min(board.y+board.height*.7,760));
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:startY}]});
  for(const y of [startY-50,startY-110,startY-180,startY-250]){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await page.waitForTimeout(35)}
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(200);
  assert((await page.evaluate(()=>window.scrollY))>0,'vertical swipe starting on board must scroll page');

  const copy=page.locator('#copyDebugBtn');
  await copy.evaluate(el=>el.scrollIntoView({block:'center'}));
  let box=await copy.boundingBox();
  assert(box&&box.y>=0&&box.y+box.height<=764,'COPY PUZZLE DEBUG must remain reachable above simulated Safari toolbar');
  await copy.click();
  await page.waitForFunction(()=>document.getElementById('feedback').textContent.includes('Puzzle debug copied'));
  const load=page.locator('#loadPuzzleBtn');
  await load.evaluate(el=>el.scrollIntoView({block:'center'}));
  box=await load.boundingBox();
  assert(box&&box.y>=0&&box.y+box.height<=764,'LOAD PUZZLE ID must remain reachable');

  console.log('FINAL EASY NOTE CLEAR + DARKER GREY PASS',JSON.stringify({aCells,finalTarget,greyTarget,secondFinal,greyAlpha:greyInfo.alpha,layout}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
