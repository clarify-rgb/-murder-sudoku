from pathlib import Path

engine_path = Path('engine/easy-6x6-profiles.js')
index_path = Path('index.html')
engine = engine_path.read_text()
index = index_path.read_text()

old = "function baseCandidates(P){let out=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){let x={r,c};if(!blockedCell(P,x))out.push(x)}return out}function cluePairCoherence(P,p,clues=clueList(P,p)){if(clues.length!==2)return{ok:true,deadBranches:[]};let base=baseCandidates(P),dead=[];for(let i=0;i<2;i++){let multi=clues[i],other=clues[1-i];if(multi.type!=='aloneInRooms'||!Array.isArray(multi.rooms)||multi.rooms.length<2)continue;let afterOther=base.filter(x=>unaryHolds(P,other,x));for(const rid of multi.rooms)if(!afterOther.some(x=>room(P,x)===rid&&unaryHolds(P,multi,x)))dead.push({person:p,clueType:multi.type,room:rid,otherClueType:other.type})}return{ok:dead.length===0,deadBranches:dead}}function validateCluePairs(P){let inspected=0,dead=[];for(const p of PEOPLE){let cs=clueList(P,p);if(cs.length===2){inspected++;let q=cluePairCoherence(P,p,cs);dead.push(...q.deadBranches)}}return{ok:dead.length===0,inspected,deadBranches:dead}}"
new = "const OBJECT_OCCUPANCY_TYPES=new Set(['onObject','onlyOnObject']),OBJECT_SPATIAL_TYPES=new Set(['besideObject','notBesideObject','diagonal','westOfObject','eastOfObject','northOfObject','southOfObject','roomNotBesideObject']);function occurrenceBeside(P,x,occ){let cs=occ?.cells||[];return !cs.some(o=>same(o,x))&&cs.some(o=>adjacent(P,x,o))}function objectClueHoldsForOccurrence(P,cl,x,occ){let cs=occ?.cells||[],ex=extentOfCells(cs);switch(cl.type){case'onObject':case'onlyOnObject':return cs.some(o=>same(o,x));case'besideObject':return occurrenceBeside(P,x,occ);case'notBesideObject':return !occurrenceBeside(P,x,occ);case'diagonal':return cs.some(o=>diag(x,o));case'westOfObject':return !!ex&&x.c<ex.minC;case'eastOfObject':return !!ex&&x.c>ex.maxC;case'northOfObject':return !!ex&&x.r<ex.minR;case'southOfObject':return !!ex&&x.r>ex.maxR;case'roomNotBesideObject':return room(P,x)===cl.room&&!occurrenceBeside(P,x,occ);default:return false}}function sameObjectPairCoherence(P,p,clues=clueList(P,p)){if(clues.length!==2)return{ok:true,sameObjectPair:false,issues:[]};let a=clues[0],b=clues[1];if(!a.object||a.object!==b.object)return{ok:true,sameObjectPair:false,issues:[]};let occA=OBJECT_OCCUPANCY_TYPES.has(a.type),occB=OBJECT_OCCUPANCY_TYPES.has(b.type),spA=OBJECT_SPATIAL_TYPES.has(a.type),spB=OBJECT_SPATIAL_TYPES.has(b.type),issues=[];if((occA&&spB)||(occB&&spA)){issues.push({person:p,object:a.object,kind:'occupancy-relation',clueTypes:[a.type,b.type]})}else if(spA&&spB){let x=P.solution?.[p],occ=objectOccurrences(P,a.object),shared=!!x&&occ.some(q=>objectClueHoldsForOccurrence(P,a,x,q)&&objectClueHoldsForOccurrence(P,b,x,q));if(!shared)issues.push({person:p,object:a.object,kind:'cross-occurrence-only',clueTypes:[a.type,b.type]})}return{ok:issues.length===0,sameObjectPair:true,issues}}function baseCandidates(P){let out=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){let x={r,c};if(!blockedCell(P,x))out.push(x)}return out}function cluePairCoherence(P,p,clues=clueList(P,p)){if(clues.length!==2)return{ok:true,deadBranches:[],sameObjectIssues:[],sameObjectPair:false};let base=baseCandidates(P),dead=[];for(let i=0;i<2;i++){let multi=clues[i],other=clues[1-i];if(multi.type!=='aloneInRooms'||!Array.isArray(multi.rooms)||multi.rooms.length<2)continue;let afterOther=base.filter(x=>unaryHolds(P,other,x));for(const rid of multi.rooms)if(!afterOther.some(x=>room(P,x)===rid&&unaryHolds(P,multi,x)))dead.push({person:p,clueType:multi.type,room:rid,otherClueType:other.type})}let sameObj=sameObjectPairCoherence(P,p,clues);return{ok:dead.length===0&&sameObj.ok,deadBranches:dead,sameObjectIssues:sameObj.issues,sameObjectPair:sameObj.sameObjectPair}}function validateCluePairs(P){let inspected=0,dead=[],sameObjectIssues=[],sameObjectPairs=0;for(const p of PEOPLE){let cs=clueList(P,p);if(cs.length===2){inspected++;let q=cluePairCoherence(P,p,cs);dead.push(...q.deadBranches);sameObjectIssues.push(...q.sameObjectIssues);if(q.sameObjectPair)sameObjectPairs++}}return{ok:dead.length===0&&sameObjectIssues.length===0,inspected,sameObjectPairs,deadBranches:dead,sameObjectIssues}}"
if old not in engine:
    raise SystemExit('engine clue-pair anchor not found')
engine = engine.replace(old, new, 1)

old = "let coherence=validateCluePairs(P);if(!coherence.ok)return{ok:false,reason:'dead clue branch',cluePairCoherence:coherence};"
new = "let coherence=validateCluePairs(P);if(!coherence.ok){if(coherence.sameObjectIssues?.length)return{ok:false,reason:'misleading same-object clue pair',cluePairCoherence:coherence};return{ok:false,reason:'dead clue branch',cluePairCoherence:coherence}};"
if old not in engine:
    raise SystemExit('validate coherence anchor not found')
engine = engine.replace(old, new, 1)

old = "baseCandidates,cluePairCoherence,validateCluePairs,validatePlacementAgainstClues,validateStoredSolutionAgainstClues};"
new = "baseCandidates,objectClueHoldsForOccurrence,sameObjectPairCoherence,cluePairCoherence,validateCluePairs,validatePlacementAgainstClues,validateStoredSolutionAgainstClues};"
if old not in engine:
    raise SystemExit('export anchor not found')
engine = engine.replace(old, new, 1)

old = "*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,sans-serif;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}.wrap{max-width:1000px;margin:auto;padding:8px}"
new = "*{box-sizing:border-box}html{-webkit-text-size-adjust:100%;min-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,sans-serif;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);min-height:100%;overflow-y:auto}.wrap{max-width:1000px;margin:auto;padding:8px;padding-bottom:calc(104px + env(safe-area-inset-bottom));min-height:100dvh;height:auto;overflow:visible}"
if old not in index:
    raise SystemExit('page flow CSS anchor not found')
index = index.replace(old, new, 1)

old = "touch-action:none"
new = "touch-action:pan-y;-webkit-touch-callout:none"
if old not in index:
    raise SystemExit('touch-action anchor not found')
index = index.replace(old, new, 1)

old = "d.onpointerdown=e=>{e.preventDefault();down=true;held=false;"
new = "d.onpointerdown=e=>{down=true;held=false;"
if old not in index:
    raise SystemExit('pointerdown anchor not found')
index = index.replace(old, new, 1)

old = "d.onpointerup=e=>{e.preventDefault();down=false;clearTimeout(timer);"
new = "d.onpointerup=e=>{down=false;clearTimeout(timer);"
if old not in index:
    raise SystemExit('pointerup anchor not found')
index = index.replace(old, new, 1)

engine_path.write_text(engine)
index_path.write_text(index)
print('Applied same-object clue-pair safeguard and mobile debug scrolling fix')
