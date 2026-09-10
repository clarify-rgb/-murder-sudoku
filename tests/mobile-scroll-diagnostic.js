'use strict';
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelectorAll('.cell').length===36);
  const snap=async label=>console.log(label,await page.evaluate(()=>({
    windowY:window.scrollY,
    htmlTop:document.documentElement.scrollTop,
    bodyTop:document.body.scrollTop,
    scrollingElement:document.scrollingElement===document.documentElement?'html':document.scrollingElement===document.body?'body':'other',
    docH:document.documentElement.scrollHeight,bodyH:document.body.scrollHeight,innerH:innerHeight,
    htmlOverflow:getComputedStyle(document.documentElement).overflowY,
    bodyOverflow:getComputedStyle(document.body).overflowY,
    boardOverflow:getComputedStyle(document.getElementById('board')).overflowY,
    boardTouch:getComputedStyle(document.getElementById('board')).touchAction,
    cellTouch:getComputedStyle(document.querySelector('.cell')).touchAction,
  })));
  await snap('START');
  await page.evaluate(()=>window.scrollBy(0,200)); await page.waitForTimeout(100); await snap('WINDOW_SCROLLBY');
  await page.evaluate(()=>window.scrollTo(0,0));
  const board=await page.locator('#board').boundingBox();
  console.log('BOARD',board);
  await page.mouse.move(board.x+board.width/2,board.y+board.height/2);
  await page.mouse.wheel(0,250); await page.waitForTimeout(150); await snap('WHEEL_OVER_BOARD');
  await page.evaluate(()=>window.scrollTo(0,0));
  const client=await context.newCDPSession(page);
  const x=Math.round(board.x+board.width/2),sy=Math.round(board.y+board.height*0.7);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:sy}]});
  for(const y of [sy-40,sy-90,sy-150,sy-220]){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await new Promise(r=>setTimeout(r,60));}
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(300); await snap('TOUCH_OVER_BOARD');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
