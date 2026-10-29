/* Local starting combinations. No weather or dress-code text is inferred. */
(() => {
 const signature=({scene,level,details})=>JSON.stringify([scene,level,details.place,details.time,details.dressCode]);
 function create({scene,level,details,preset}){
  const outfit={...preset.outfit,accessory:Array.isArray(preset.outfit.accessory)?[...preset.outfit.accessory]:[preset.outfit.accessory]};
  const reasons=[],outdoor=details.place==='outdoor',evening=details.time==='evening',notice=details.dressCode==='yes';
  const relaxed=['travel','friends','date'].includes(scene),formal=['interview','firstday','wedding'].includes(scene);
  if(scene==='travel'&&level==='statement')Object.assign(outfit,{top:'turtleneck',bottom:'blackwide',outer:'leatherjacket',shoes:'sneakers',accessory:['scarf','bag']});
  if(outdoor){
   reasons.push('야외 활동을 고려해 이동하기 편한 신발과 걸칠 수 있는 겉옷을 우선했어요.');
   if(relaxed)outfit.shoes='sneakers';
   else if(['maryjane','boots','tallboots'].includes(outfit.shoes))outfit.shoes='loafers';
   if(outfit.outer==='none')outfit.outer=level==='statement'&&!formal?'leatherjacket':formal?'blazer':'cardigan';
   if(scene==='travel'&&['skirt','brownskirt','blackmini','navyskirt'].includes(outfit.bottom))outfit.bottom=level==='bare'?'cargo':'slacks';
   if(scene==='travel'&&!outfit.accessory.includes('bag'))outfit.accessory.push('bag');
  }else{
   reasons.push('실내에서 오래 머물기 편하도록 겹쳐 입는 옷의 무게와 구성을 정리했어요.');
   if(relaxed&&['blazer','leatherjacket'].includes(outfit.outer))outfit.outer=level==='bare'?'none':'cardigan';
   if(scene==='travel'&&outfit.accessory.includes('scarf'))outfit.accessory=outfit.accessory.filter(id=>id!=='scarf');
  }
  if(evening){
   reasons.push(outdoor?'저녁 야외 일정에 활용할 수 있도록 벗고 입기 쉬운 겉옷을 포함했어요.':'저녁 약속에 어울리는 단정한 상의와 신발을 기본으로 골랐어요.');
   if(outfit.outer==='none')outfit.outer=formal||scene==='dinner'?'blazer':'cardigan';
   if(['tee','graytank','hoodie','navysweatshirt'].includes(outfit.top)&&level!=='bare')outfit.top=formal?'shirt':'knit';
   if(!outdoor&&outfit.shoes==='sneakers'&&level!=='bare')outfit.shoes='loafers';
  }else{
   reasons.push('낮 일정에는 선택한 꾸밈 정도를 유지하며 가볍고 편안한 조합으로 시작해요.');
   if(relaxed&&level==='bare'&&!notice){outfit.shoes='sneakers';if(!outdoor)outfit.outer='none'}
  }
  if(notice){
   if(['tee','hoodie','graytank','navysweatshirt'].includes(outfit.top))outfit.top=relaxed?'polo':'shirt';
   if(['denim','cargo','blackwide','creamwide','blackmini'].includes(outfit.bottom))outfit.bottom='slacks';
   if(outfit.outer==='none')outfit.outer=formal||scene==='dinner'?'blazer':'cardigan';
   if(outfit.shoes==='sneakers'&&!(outdoor&&scene==='travel'))outfit.shoes='loafers';
   reasons.push('복장 안내가 있어 단정한 기본 조합으로 시작해요. 구체적인 규정은 행사 안내를 직접 확인해 주세요.');
  }else if(details.dressCode==='unknown'){
   reasons.push('복장 안내를 아직 모르는 상태의 일반적인 참고 조합이에요. 안내 확인 후 자유롭게 수정해 주세요.');
  }else reasons.push('별도 복장 안내가 없어 선택한 상황과 꾸밈 정도를 기준으로 골랐어요.');
  outfit.accessory=[...new Set(outfit.accessory)];
  return {outfit,reasons,key:signature({scene,level,details})};
 }
 window.ContextOutfit={create,signature};
})();
