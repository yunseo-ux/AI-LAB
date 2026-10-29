(() => {
 const slots=['tee','shirt','knit','blouse','polo','turtleneck','creamknit','hoodie','graytank','creambuttonknit','navysweatshirt','stripedshirt','denim','slacks','skirt','brownskirt','cargo','blackwide','blackmini','creamwide','navyskirt','blazer','cardigan','vest','plumecardigan','leatherjacket','pinafore','sneakers','loafers','maryjane','boots','derby','tallboots','pearl','bag','watch','gold','scarf','chain','tie'];
 const labels={top:'상의',bottom:'하의',outer:'아우터',shoes:'신발',accessory:'액세서리'};
 // Actual row edges in the existing 1586 × 992 product atlas.
 const rows=[0,205/992,412/992,614/992,805/992,1];
 const bounds={top:[.32,.12,.36,.26],bottom:[.32,.39,.36,.35],outer:[.025,.23,.285,.36],shoes:[.31,.76,.38,.17]};
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function pieces(items){return items.filter(item=>item.id!=='none')}
 function thumbnail(item){const index=slots.indexOf(item.id),row=Math.floor(index/8),height=rows[row+1]-rows[row];return `<span class="photo-thumb" data-photo-item="${escape(item.id)}" style="--photo-x:${index%8*100/7}%;--photo-y:${rows[row]/(1-height)*100}%;background-size:800% ${100/height}%" aria-hidden="true"></span>`}
 function view(look,gender,items,small=false){
  const chosen=pieces(items),accessories=chosen.filter(item=>item.key==='accessory');
  const piece=item=>`<div class="board-piece board-${item.key}" data-board-item="${escape(item.id)}"><div class="board-product">${thumbnail(item)}</div><span>${escape(item.name)}</span></div>`;
  return `<figure class="outfit-board ${small?'mini':''}" aria-label="선택한 옷의 코디 보드"><div class="board-canvas"><div class="board-head"><span>DRESS CODE / THE PERSONAL EDIT</span><span>${gender==='male'?'MENSWEAR':'WOMENSWEAR'}</span></div><p class="board-title">Your outfit, together.</p>${chosen.filter(item=>item.key!=='accessory').map(piece).join('')}<div class="board-accessories">${accessories.map(piece).join('')}${accessories.length?'':'<span class="board-empty">액세서리 없이</span>'}</div><div class="board-foot"><span>MY OUTFIT / ${String(chosen.length).padStart(2,'0')} ITEMS</span><span>선택한 옷으로 완성한 코디</span></div></div><figcaption>옷을 선택하면 조합이 바로 바뀌어요.<button class="board-jump" data-action="view-picker">옷 선택으로 이동 ↓</button></figcaption></figure>`;
 }
 let atlas;
 function loadAtlas(){return atlas??=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{atlas=null;reject(Error('옷 사진을 읽지 못했어요. 다시 시도해 주세요.'))};img.src='/dress-code-studio/assets/wardrobe-photo-atlas-v1.png'})}
 async function image(look,gender,items,{scene='MY OUTFIT'}={}){
  const source=await loadAtlas();if(document.fonts)await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=1250;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fbf8f1';ctx.fillRect(0,0,1000,1250);ctx.fillStyle='#432a23';ctx.font='600 24px sans-serif';ctx.fillText('DRESS CODE',42,52);ctx.textAlign='right';ctx.font='400 14px sans-serif';ctx.fillText(gender==='male'?'MENSWEAR':'WOMENSWEAR',958,52);ctx.textAlign='left';ctx.font='italic 36px Georgia, serif';ctx.fillText('Your outfit, together.',42,108);ctx.font='400 15px sans-serif';ctx.fillStyle='#7c7267';ctx.fillText(scene,42,139);
  const chosen=pieces(items),accessories=chosen.filter(item=>item.key==='accessory');
  function draw(item,[x,y,w,h],accessory=false){
   const index=slots.indexOf(item.id);if(index<0)throw Error('등록되지 않은 옷이에요.');
   x*=1000;y*=1250;w*=1000;h*=1250;const size=Math.min(w,h-30);
   const row=Math.floor(index/8);ctx.drawImage(source,index%8*source.naturalWidth/8,rows[row]*source.naturalHeight,source.naturalWidth/8,(rows[row+1]-rows[row])*source.naturalHeight,x+(w-size)/2,y+(h-30-size)/2,size,size);
   ctx.textAlign='center';ctx.fillStyle='#65594e';ctx.font=`400 ${accessory?12:14}px sans-serif`;
   const text=item.name;let line='',lines=[];for(const char of text){if(ctx.measureText(line+char).width>w-4){lines.push(line);line=char}else line+=char}if(line)lines.push(line);lines.slice(0,2).forEach((line,i)=>ctx.fillText(line,x+w/2,y+h-15+i*16));ctx.textAlign='left';
  }
  for(const item of chosen.filter(item=>item.key!=='accessory'))draw(item,bounds[item.key]);
  accessories.forEach((item,i)=>draw(item,[.715+(i%2)*.135,.19+Math.floor(i/2)*.16,.125,.15],true));
  ctx.strokeStyle='#d2c8b9';ctx.beginPath();ctx.moveTo(42,1192);ctx.lineTo(958,1192);ctx.stroke();ctx.fillStyle='#7c7267';ctx.font='400 14px sans-serif';ctx.fillText(`MY OUTFIT / ${String(chosen.length).padStart(2,'0')} ITEMS`,42,1224);ctx.textAlign='right';ctx.fillText('선택한 옷으로 완성한 코디',958,1224);
  return canvas.toDataURL('image/png');
 }
 window.OutfitBoard={view,image};
})();
