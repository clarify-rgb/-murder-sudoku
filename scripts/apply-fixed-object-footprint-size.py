from pathlib import Path
import re

path = Path('engine/easy-6x6-profiles.js')
s = path.read_text()

valid_object = r'''function validObject(P,o,others=[]){let occ=objectOccurrences(P,o);if(!occ.length||occ.some(q=>!validFootprint(P,q.cells)))return false;let footprintSize=Number.isInteger(o.footprintSize)?o.footprintSize:occ[0].cells.length;if(footprintSize<1||footprintSize>3||occ.some(q=>q.cells.length!==footprintSize))return false;let all=occ.flatMap(q=>q.cells);if(new Set(all.map(x=>idx(x.r,x.c))).size!==all.length)return false;let occupied=new Set(others.flatMap(q=>objectCells({objects:[q]},q.name)).map(x=>idx(x.r,x.c)));return !all.some(x=>occupied.has(idx(x.r,x.c)))}'''

s, n = re.subn(
    r"function validObject\(P,o,others=\[\]\)\{.*?\}\nfunction validateObjects",
    valid_object + "\nfunction validateObjects",
    s,
    count=1,
    flags=re.S,
)
assert n == 1, f'validObject replacement count: {n}'

make_objects = r'''function sampleFootprintSize(){let roll=Math.random();return roll<.55?1:roll<.88?2:3}
function makeObjects(P){let used=new Set(),wanted=7+rand(3),normalN=0,lockedN=0;function draftObject(blocking,requiredSize=null){let pool=P.objects.filter(o=>o.blocking===blocking&&(requiredSize===null||o.footprintSize===requiredSize)),reuse=pool.length&&Math.random()<.32,o=reuse?pool[rand(pool.length)]:null;if(o)return{o,isNew:false};return{o:{occurrences:[],blocking,footprintSize:requiredSize===null?sampleFootprintSize():requiredSize},isNew:true}}function addOccurrence(target,cells){let o=target.o;if(target.isNew){let n=o.blocking?++lockedN:++normalN,name=(o.blocking?'Locked ':'Object ')+n;o.id=(o.blocking?'locked-':'object-')+n;o.name=name;o.icon=(o.blocking?'L':'')+n;P.objects.push(o);target.isNew=false}o.occurrences.push({cells:cells.map(x=>({r:x.r,c:x.c}))})}function findFootprint(size,blocking,free){for(const start of free){let cells=growFootprint(P,start,size,used);if(cells.length!==size)continue;if(blocking&&cells.some(x=>PEOPLE.some(p=>same(P.solution[p],x))))continue;return cells}return null}let made=0,guard=0;while(made<wanted&&guard++<80){let blocking=Math.random()<.38,target=draftObject(blocking),size=target.o.footprintSize,free=shuffle([...Array(N*N).keys()]).map(cell).filter(x=>!used.has(idx(x.r,x.c))&&(!blocking||!PEOPLE.some(p=>same(P.solution[p],x))));if(!free.length)break;let cells=findFootprint(size,blocking,free);if(!cells)continue;cells.forEach(x=>used.add(idx(x.r,x.c)));addOccurrence(target,cells);made++}for(const p of BASE){let x=P.solution[p];if(!P.objects.some(o=>objectCells(P,o.name).some(c=>same(c,x)))&&Math.random()<.35&&!used.has(idx(x.r,x.c))){let target=draftObject(false,1);addOccurrence(target,[x]);used.add(idx(x.r,x.c))}}}'''

s, n = re.subn(
    r"(?:function sampleFootprintSize\(\)\{.*?\}\n)?function makeObjects\(P\)\{.*?\}\nfunction factPool",
    make_objects + "\nfunction factPool",
    s,
    count=1,
    flags=re.S,
)
assert n == 1, f'makeObjects replacement count: {n}'

path.write_text(s)
