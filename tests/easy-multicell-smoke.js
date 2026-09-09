'use strict';
const fs=require('fs'),E=require('../engine/easy-6x6-profiles.js'),results=[];
for(const profile of ['easy-1','easy-2','easy-3']){
  let passed=0,totalAttempts=0,sizes={1:0,2:0,3:0},rejects={},examples=[];
  for(let i=0;i<10;i++){
    const P=E.generate(profile,2000);
    if(!P)throw new Error(profile+' generation failed');
    passed++;totalAttempts+=P.generationAttempts;
    for(const [k,v] of Object.entries(P.rejections||{}))rejects[k]=(rejects[k]||0)+v;
    for(const o of P.objects)sizes[E.objectCells(P,o.name).length]++;
    if(examples.length<1)examples.push(P.objects.map(o=>o.name+':'+E.objectCells(P,o.name).map(c=>'R'+(c.r+1)+'C'+(c.c+1)).join('+')).join(' | '));
  }
  const row={profile,passed,averageAttempts:totalAttempts/passed,objectSizes:sizes,rejections:rejects,example:examples[0]};results.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync('easy-multicell-smoke-results.json',JSON.stringify(results,null,2));