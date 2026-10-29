(() => {
 const order=['top','bottom','outer','shoes','accessory'];
 const slots=['tee','shirt','knit','blouse','polo','turtleneck','creamknit','hoodie','graytank','creambuttonknit','navysweatshirt','stripedshirt','denim','slacks','skirt','brownskirt','cargo','blackwide','blackmini','creamwide','navyskirt','blazer','cardigan','vest','plumecardigan','leatherjacket','pinafore','sneakers','loafers','maryjane','boots','derby','tallboots','pearl','bag','watch','gold','scarf','chain','tie'];
 const cache=new Map(),errors=new Map(),pending=new Map();
 const defaults={female:{top:'shirt',bottom:'slacks',outer:'cardigan',shoes:'maryjane',accessory:'pearl'},male:{top:'shirt',bottom:'slacks',outer:'cardigan',shoes:'loafers',accessory:'watch'}};
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const accessoryIds=look=>Array.isArray(look.accessory)?look.accessory:look.accessory?[look.accessory]:[];
 const key=(look,gender)=>[gender,...order.map(name=>name==='accessory'?[...new Set(accessoryIds(look))].sort().join(','):look[name])].join('|');
 for(const gender of ['female','male'])cache.set(key(defaults[gender],gender),`/dress-code-studio/assets/model-${gender}-v1.png`);
 let serviceState=window.StyleAPI.enabled?'checking':'disabled',serviceMessage=window.StyleAPI.enabled?'':window.StyleAPI.unavailableMessage,availabilityTask;
 function available({refresh=false}={}){
  if(!window.StyleAPI.enabled)return Promise.resolve(false);
  if(availabilityTask&&!refresh)return availabilityTask;
  serviceState=window.StyleAPI.enabled?'checking':'disabled';serviceMessage=window.StyleAPI.enabled?'실사 생성 연결을 확인하고 있어요.':window.StyleAPI.unavailableMessage;
  window.dispatchEvent(new Event('outfit-photo-updated'));
  availabilityTask=window.StyleAPI.isAvailable().then(configured=>{serviceState=configured?'ready':'disabled';serviceMessage=configured?'':window.StyleAPI.unavailableMessage;return configured}).finally(()=>window.dispatchEvent(new Event('outfit-photo-updated')));
  return availabilityTask;
 }
 function thumbnail(item){
  if(item.id==='none')return '<span class="no-outerwear" aria-hidden="true">—</span>';
  const index=slots.indexOf(item.id);if(index<0)throw Error(`Missing photo: ${item.id}`);
  return `<span class="photo-thumb" data-photo-item="${escape(item.id)}" style="--photo-x:${index%8*100/7}%;--photo-y:${Math.floor(index/8)*25}%" aria-hidden="true"></span>`;
 }
 function selector(gender){return `<fieldset class="photo-model-picker"><legend>모델 선택</legend><div role="group" aria-label="실사 모델 선택">${[['female','여성'],['male','남성']].map(([id,label])=>`<button type="button" data-action="model-gender" data-id="${id}" aria-label="${label}" aria-pressed="${gender===id}" class="${gender===id?'selected':''}"><img src="/dress-code-studio/assets/model-${id}-v1.png" alt=""/><span>${label}</span></button>`).join('')}</div></fieldset>`}
 function view(look,gender,items,small=false){
  const signature=key(look,gender),src=cache.get(signature),loading=pending.has(signature),error=errors.get(signature);
  const label=items.filter(item=>item.id!=='none').map(item=>item.name).join(' · ');
  const content=src?`<img class="real-outfit-image" src="${escape(src)}" alt="${gender==='male'?'남성':'여성'} 모델 · ${escape(label)}" decoding="async"/>`:`<div class="photo-outfit-pending"><div class="photo-flatlay">${items.filter(item=>item.id!=='none').map(item=>`<div>${thumbnail(item)}<span>${escape(item.name)}</span></div>`).join('')}</div><p>${loading?'선택한 옷으로 실사 착장을 만들고 있어요.':serviceState==='ready'?'이 조합의 실사 착장을 만들어 보세요.':'선택한 옷 조합'}</p></div>`;
  const ready=serviceState==='ready',checking=serviceState==='checking';
  const buttonAction='generate-photo';
  const buttonLabel=loading?'실사 사진 생성 중…':checking?'실사 생성 연결 확인 중…':ready?'선택한 옷으로 실사 만들기 ↗':window.StyleAPI.unavailableMessage;
  const caption=src?'AI 실사 착장 · 실제 핏은 제품에 따라 달라요.':loading?'사진 생성에는 잠시 시간이 걸릴 수 있어요.':error||serviceMessage||'선택한 옷과 모델을 반영해 새로운 사진을 만들어요.';
  return `<figure class="outfit-art real-outfit ${small?'mini':''}" data-photo-key="${escape(signature)}" data-model="${gender}" data-look="${escape(JSON.stringify(look))}">${content}<figcaption role="status">${escape(caption)}</figcaption>${src||small?'':`<button type="button" class="generate-outfit-photo" data-action="${buttonAction}" ${loading||!ready?'disabled':''}>${buttonLabel}</button>`}</figure>`;
 }
 async function generate(look,gender){
  const signature=key(look,gender);if(cache.has(signature))return cache.get(signature);if(pending.has(signature))return pending.get(signature);
  if(!await available())return null;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),118000);
  const task=(async()=>{errors.delete(signature);const response=await window.StyleAPI.fetch('/api/render-outfit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({look,gender}),signal:controller.signal});const data=await response.json().catch(()=>null);if(!response.ok)throw Error(data?.error||'실사 사진을 생성하지 못했어요. 잠시 후 다시 시도해 주세요.');if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(data?.image||'')||data.gender!==gender||key(data.look||{},gender)!==signature)throw Error('선택한 조합의 사진을 받지 못했어요. 다시 시도해 주세요.');if(cache.size>=12){const entry=[...cache.keys()].find(entry=>!Object.values(defaults).some((look,index)=>key(look,index===0?'female':'male')===entry));if(entry)cache.delete(entry)}cache.set(signature,data.image);return data.image})().catch(error=>{errors.set(signature,error.name==='AbortError'?'사진 생성 시간이 길어졌어요. 다시 시도해 주세요.':error.message);throw error}).finally(()=>{clearTimeout(timer);pending.delete(signature);window.dispatchEvent(new Event('outfit-photo-updated'))});
  pending.set(signature,task);window.dispatchEvent(new Event('outfit-photo-updated'));return task;
 }
 let autoTimer;
 function schedule(){clearTimeout(autoTimer);if(window.StyleAPI.enabled)autoTimer=setTimeout(()=>available(),100)}
 window.addEventListener('style-ai-status',event=>{if(!event.detail.available){availabilityTask=Promise.resolve(false);serviceState='disabled';serviceMessage=window.StyleAPI.unavailableMessage;errors.clear();window.dispatchEvent(new Event('outfit-photo-updated'))}});
 document.addEventListener('click',event=>{const button=event.target.closest('[data-action="generate-photo"]');if(!button)return;const figure=button.closest('[data-photo-key]');generate(JSON.parse(figure.dataset.look),figure.dataset.model).catch(()=>{})});
 window.RealOutfits={key,defaults,thumbnail,selector,view,available,schedule,get:(look,gender)=>cache.get(key(look,gender)),generate};
})();
