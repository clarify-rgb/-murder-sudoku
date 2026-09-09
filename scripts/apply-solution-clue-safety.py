from pathlib import Path

engine = Path('engine/easy-6x6-profiles.js')
s = engine.read_text()

old = "function objectByName(P,n){return P.objects.find(o=>o.name===n)}function objectOccurrences(P,n){let o=typeof n==='string'?objectByName(P,n):n;if(!o)return[];if(Array.isArray(o.occurrences))return o.occurrences.map(q=>({cells:Array.isArray(q.cells)?q.cells:[]}));if(Array.isArray(o.cells))return[{cells:o.cells}];return Number.isInteger(o.r)&&Number.isInteger(o.c)?[{cells:[{r:o.r,c:o.c}]}]:[]}function objectCells(P,n){return objectOccurrences(P,n).flatMap(q=>q.cells)}function objectExtent(P,n){let cs=objectCells(P,n);if(!cs.length)return null;return{minR:Math.min(...cs.map(x=>x.r)),maxR:Math.max(...cs.map(x=>x.r)),minC:Math.min(...cs.map(x=>x.c)),maxC:Math.max(...cs.map(x=>x.c))}}"
new = "function objectByName(P,n){return P.objects.find(o=>o.name===n)}function objectOccurrences(P,n){let o=typeof n==='string'?objectByName(P,n):n;if(!o)return[];if(Array.isArray(o.occurrences))return o.occurrences.map(q=>({cells:Array.isArray(q.cells)?q.cells:[]}));if(Array.isArray(o.cells))return[{cells:o.cells}];return Number.isInteger(o.r)&&Number.isInteger(o.c)?[{cells:[{r:o.r,c:o.c}]}]:[]}function objectCells(P,n){return objectOccurrences(P,n).flatMap(q=>q.cells)}function extentOfCells(cs){if(!cs.length)return null;return{minR:Math.min(...cs.map(x=>x.r)),maxR:Math.max(...cs.map(x=>x.r)),minC:Math.min(...cs.map(x=>x.c)),maxC:Math.max(...cs.map(x=>x.c))}}function objectOccurrenceExtents(P,n){return objectOccurrences(P,n).map(q=>extentOfCells(q.cells)).filter(Boolean)}function objectExtent(P,n){return extentOfCells(objectCells(P,n))}"
if old in s:
    s = s.replace(old, new, 1)
elif 'function objectOccurrenceExtents(' not in s:
    raise SystemExit('object helper anchor missing')

old = "function unaryHolds(P,cl,x){let os=cl.object?objectCells(P,cl.object):[],ex=cl.object?objectExtent(P,cl.object):null;switch(cl.type){case'victim':return true;case'onObject':case'onlyOnObject':return os.some(o=>same(o,x));case'besideObject':return besideObject(P,x,cl.object);case'notBesideObject':return !besideObject(P,x,cl.object);case'room':return room(P,x)===cl.room;case'roomNotBesideObject':return room(P,x)===cl.room&&!besideObject(P,x,cl.object);case'corner':return isCorner(P,x,cl.room??null);case'diagonal':return os.some(o=>diag(x,o));case'row':return x.r===cl.row;case'column':return x.c===cl.column;case'westOfObject':return !!ex&&x.c<ex.minC;case'eastOfObject':return !!ex&&x.c>ex.maxC;case'northOfObject':return !!ex&&x.r<ex.minR;case'southOfObject':return !!ex&&x.r>ex.maxR;case'aloneInRooms':return cl.rooms.includes(room(P,x));default:return true}}"
new = "function unaryHolds(P,cl,x){let os=cl.object?objectCells(P,cl.object):[],exs=cl.object?objectOccurrenceExtents(P,cl.object):[];switch(cl.type){case'victim':return true;case'onObject':case'onlyOnObject':return os.some(o=>same(o,x));case'besideObject':return besideObject(P,x,cl.object);case'notBesideObject':return !besideObject(P,x,cl.object);case'room':return room(P,x)===cl.room;case'roomNotBesideObject':return room(P,x)===cl.room&&!besideObject(P,x,cl.object);case'corner':return isCorner(P,x,cl.room??null);case'diagonal':return os.some(o=>diag(x,o));case'row':return x.r===cl.row;case'column':return x.c===cl.column;case'westOfObject':return exs.some(ex=>x.c<ex.minC);case'eastOfObject':return exs.some(ex=>x.c>ex.maxC);case'northOfObject':return exs.some(ex=>x.r<ex.minR);case'southOfObject':return exs.some(ex=>x.r>ex.maxR);case'aloneInRooms':return cl.rooms.includes(room(P,x));default:return true}}"
if old in s:
    s = s.replace(old, new, 1)
elif "case'westOfObject':return exs.some" not in s:
    raise SystemExit('unaryHolds anchor missing')

old = "function fullValid(P,a){if(!validateObjects(P)||Object.keys(a).length!==N||new Set(PEOPLE.map(p=>a[p].r)).size!==N||new Set(PEOPLE.map(p=>a[p].c)).size!==N||PEOPLE.some(p=>blockedCell(P,a[p])))return false;for(const p of PEOPLE)for(const cl of clueList(P,p))if(!clueSatisfied(P,p,cl,a))return false;return true}"
new = "function validatePlacementAgainstClues(P,a){let failures=[],checked=0;for(const p of PEOPLE)for(const cl of clueList(P,p)){checked++;let ok=!!a?.[p]&&clueSatisfied(P,p,cl,a);if(!ok)failures.push({person:p,clue:cl,solutionCell:a?.[p]||null,reason:'canonical clue predicate returned false'})}return{valid:failures.length===0,checked,failures}}function validateStoredSolutionAgainstClues(P){return validatePlacementAgainstClues(P,P.solution)}function fullValid(P,a){if(!a||!validateObjects(P)||Object.keys(a).length!==N||PEOPLE.some(p=>!a[p])||new Set(PEOPLE.map(p=>a[p].r)).size!==N||new Set(PEOPLE.map(p=>a[p].c)).size!==N||PEOPLE.some(p=>blockedCell(P,a[p])))return false;return validatePlacementAgainstClues(P,a).valid}"
if old in s:
    s = s.replace(old, new, 1)
elif 'function validateStoredSolutionAgainstClues(' not in s:
    raise SystemExit('fullValid anchor missing')

old = "for(const o of P.objects){let cs=objectCells(P,o.name),ex=objectExtent(P,o.name);"
new = "for(const o of P.objects){let cs=objectCells(P,o.name),exs=objectOccurrenceExtents(P,o.name);"
if old in s:
    s = s.replace(old, new, 1)
elif "let cs=objectCells(P,o.name),exs=objectOccurrenceExtents" not in s:
    raise SystemExit('factPool extent anchor missing')

repls = {
    "if(x.c<ex.minC)add('westOfObject'": "if(exs.some(ex=>x.c<ex.minC))add('westOfObject'",
    "if(x.c>ex.maxC)add('eastOfObject'": "if(exs.some(ex=>x.c>ex.maxC))add('eastOfObject'",
    "if(x.r<ex.minR)add('northOfObject'": "if(exs.some(ex=>x.r<ex.minR))add('northOfObject'",
    "if(x.r>ex.maxR)add('southOfObject'": "if(exs.some(ex=>x.r>ex.maxR))add('southOfObject'",
}
for a,b in repls.items():
    if a in s:
        s = s.replace(a,b,1)
    elif b not in s:
        raise SystemExit('factPool directional anchor missing: '+a)

old = "if(on>2)return{ok:false,reason:'too many onObject clues'};if(!fullValid(P,P.solution))return{ok:false,reason:'stored solution invalid'};let h=strictSolve(P);"
new = "if(on>2)return{ok:false,reason:'too many onObject clues'};let storedSolutionClues=validateStoredSolutionAgainstClues(P);if(!storedSolutionClues.valid)return{ok:false,reason:'stored solution clue mismatch',storedSolutionClues};if(!fullValid(P,P.solution))return{ok:false,reason:'stored solution invalid'};let h=strictSolve(P);"
if old in s:
    s = s.replace(old, new, 1)
elif "reason:'stored solution clue mismatch'" not in s:
    raise SystemExit('validate stored-solution anchor missing')

old = "objectByName,objectOccurrences,objectCells,objectExtent,besideObject,validObject,validateObjects,blockedCell,baseCandidates,cluePairCoherence,validateCluePairs};"
new = "objectByName,objectOccurrences,objectCells,objectExtent,objectOccurrenceExtents,besideObject,validObject,validateObjects,blockedCell,baseCandidates,cluePairCoherence,validateCluePairs,validatePlacementAgainstClues,validateStoredSolutionAgainstClues};"
if old in s:
    s = s.replace(old, new, 1)
elif 'validateStoredSolutionAgainstClues};' not in s:
    raise SystemExit('export anchor missing')

engine.write_text(s)

ui = Path('index.html')
u = ui.read_text()
old = "let n=P.people.filter(p=>same(placed[p],P.solution[p])).length;feedback.innerHTML=n===N?'<b>Puzzle solved!</b>':`Not quite. ${n} of ${N} placements are correct.`"
new = "let n=P.people.filter(p=>same(placed[p],P.solution[p])).length,valid=E.fullValid(P,placed);feedback.innerHTML=n===N&&valid?'<b>Puzzle solved!</b>':`Not quite. ${n} of ${N} placements are correct.`"
if old in u:
    u = u.replace(old,new,1)
elif 'valid=E.fullValid(P,placed)' not in u:
    raise SystemExit('submit anchor missing')
ui.write_text(u)
