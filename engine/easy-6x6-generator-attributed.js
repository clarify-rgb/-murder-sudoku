'use strict';
const Engine=require('./easy-6x6-attribution.js');
function generate(profileId,maxAttempts=2000){let rejects={};for(let attempt=1;attempt<=maxAttempts;attempt++){let P=Engine.buildCandidate(profileId);if(!P){rejects['candidate build failed']=(rejects['candidate build failed']||0)+1;continue}let V=Engine.validate(P);if(V.ok){P.validation=V;P.generationAttempts=attempt;P.rejections=rejects;return P}rejects[V.reason]=(rejects[V.reason]||0)+1}return null}
module.exports={...Engine,generate};
