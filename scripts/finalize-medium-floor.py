from pathlib import Path

path = Path('engine/medium-7x7.js')
s = path.read_text()

old_accept = "function mediumAcceptance(m){let reasons=[];if(m.directClueSingles!==0)reasons.push('immediate direct single');if(m.multiCandidatePeople!==PEOPLE.length)reasons.push('not every person initially unresolved');if(m.advancedDeductionCount<2)reasons.push('fewer than two structural advanced deductions');if(m.materialAdvancedDeductions<1)reasons.push('no advanced deduction contributes downstream');if(m.advancedDependentPlacements<1)reasons.push('no later placement depends on advanced deduction');if(m.multiPersonChainPeople<2)reasons.push('no genuine multi-person dependency chain');if(m.dependencyDepth<2)reasons.push('dependency depth too shallow');return{ok:reasons.length===0,reasons}}"
new_accept = "let mediumAcceptanceRejectionStats={'chain people < 4':0,'advanced-dependent placements < 4':0};function resetMediumAcceptanceRejectionStats(){mediumAcceptanceRejectionStats={'chain people < 4':0,'advanced-dependent placements < 4':0}}function getMediumAcceptanceRejectionStats(){return{...mediumAcceptanceRejectionStats}}function mediumAcceptance(m){let reasons=[];if(m.directClueSingles!==0)reasons.push('immediate direct single');if(m.multiCandidatePeople!==PEOPLE.length)reasons.push('not every person initially unresolved');if(m.advancedDeductionCount<2)reasons.push('fewer than two structural advanced deductions');if(m.materialAdvancedDeductions<1)reasons.push('no advanced deduction contributes downstream');if(m.advancedDependentPlacements<4)reasons.push('fewer than four advanced-dependent final placements');if(m.multiPersonChainPeople<4)reasons.push('fewer than four people in meaningful dependency chain');if(m.dependencyDepth<2)reasons.push('dependency depth too shallow');return{ok:reasons.length===0,reasons}}"
assert old_accept in s
s = s.replace(old_accept, new_accept, 1)

old_build = "let m=metrics(P,h),accept=mediumAcceptance(m);if(accept.ok){P.selectionAttempts=pick;return P}"
new_build = "let m=metrics(P,h),accept=mediumAcceptance(m);if(accept.ok){P.selectionAttempts=pick;return P}else{let previousFloor=m.directClueSingles===0&&m.multiCandidatePeople===PEOPLE.length&&m.advancedDeductionCount>=2&&m.materialAdvancedDeductions>=1&&m.advancedDependentPlacements>=1&&m.multiPersonChainPeople>=2&&m.dependencyDepth>=2;if(previousFloor){if(m.multiPersonChainPeople<4)mediumAcceptanceRejectionStats['chain people < 4']++;if(m.advancedDependentPlacements<4)mediumAcceptanceRejectionStats['advanced-dependent placements < 4']++}}"
assert old_build in s
s = s.replace(old_build, new_build, 1)

old_export = "analyzeMediumStructure,mediumAcceptance,classifyMedium,getSearchCallCount"
new_export = "analyzeMediumStructure,mediumAcceptance,classifyMedium,resetMediumAcceptanceRejectionStats,getMediumAcceptanceRejectionStats,getSearchCallCount"
assert old_export in s
s = s.replace(old_export, new_export, 1)

path.write_text(s)
