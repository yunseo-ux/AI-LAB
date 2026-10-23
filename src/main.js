const occasions = [
  { id: "wedding", title: "寃고샎???섍컼", en: "A Wedding", note: "異뺥븯???먮━???댁슱由щ뒗 ?⑥젙??" },
  { id: "interview", title: "硫댁젒 쨌 誘명똿", en: "The Interview", note: "泥レ씤?곸쓣 留뚮뱶???좊ː??洹좏삎" },
  { id: "firstday", title: "泥?異쒓렐", en: "A New Beginning", note: "?몄븞?④낵 ?꾨줈?섏뀛?먰븿 ?ъ씠" },
  { id: "dinner", title: "????쎌냽", en: "An Evening Out", note: "遺꾩쐞湲곕? ?뷀븯???묒? ?뺣룉" },
  { id: "date", title: "?곗씠??", en: "A Date", note: "媛蹂띿?留??ㅻ젅???쎌냽??" },
  { id: "travel", title: "?ы뻾 쨌 ?섎뱾??", en: "Travel & Explore", note: "?ㅻ옒 嫄몄뼱???몄븞??洹좏삎" },
  { id: "friends", title: "移쒓뎄 紐⑥엫", en: "With Friends", note: "?몄븞?⑥뿉 痍⑦뼢 ????" },
  { id: "culture", title: "?곌레 쨌 裕ㅼ?而?", en: "Theatre & Musical", note: "?ㅻ옒 ?됱븘???명븯怨?臾대? 遺꾩쐞湲곗뿉???댁슱由щ뒗 猷?" },
];
const wardrobe = {
  top: [
    { id: "tee", name: "肄붾컻??洹몃옒????", en: "Graphic Cotton Tee", formal: 1, color: "#244b88" },
    { id: "shirt", name: "釉붾（ ?ㅽ듃?쇱씠???붿툩", en: "Oversized Stripe Shirt", formal: 3, color: "#8eaec7" },
    { id: "knit", name: "?щ젅?ㅽ듃 耳?대툝 ?덊듃", en: "Cable Knit Sweater", formal: 2, color: "#3e5b49" },
  ],
  bottom: [
    { id: "denim", name: "?ㅽ겕 ?곕떂", en: "Dark Denim", formal: 1, color: "#55534c" },
    { id: "slacks", name: "?꾩씠蹂대━ ?뚮━痢??ъ툩", en: "Pleated Wide Trousers", formal: 3, color: "#e4ddc9" },
    { id: "skirt", name: "踰꾧굔???덊떞 ?ㅼ빱??", en: "Satin Midi Skirt", formal: 3, color: "#742c3d" },
  ],
  outer: [
    { id: "none", name: "?꾩슦???놁씠", en: "No outerwear", formal: 0, color: "transparent" },
    { id: "fieldjacket", name: "?щ━釉??꾨뱶 ?ы궥", en: "Utility Field Jacket", formal: 2, color: "#65694e" },
    { id: "trench", name: "?뚰봽???몃젋移?", en: "Soft Trench", formal: 2, color: "#b6a78f" },
  ],
  shoes: [
    { id: "sneakers", name: "罹붾쾭???ㅻ땲而ㅼ쫰", en: "Canvas Sneakers", formal: 1, color: "#eee9dc" },
    { id: "maryjane", name: "踰꾧굔??硫붾━?쒖씤", en: "Mary Jane Flats", formal: 3, color: "#742c3d" },
    { id: "heels", name: "?덈뜑 ?듯겢遺痢?", en: "Leather Ankle Boots", formal: 3, color: "#252522" },
  ],
};
const categories = { top: ["Top", "01"], bottom: ["Bottom", "02"], outer: ["Outerwear", "03"], shoes: ["Shoes", "04"] };
const defaults = { top: "tee", bottom: "denim", outer: "none", shoes: "sneakers" };
const labels = { wedding: "寃고샎???섍컼", interview: "硫댁젒 諛?以묒슂??誘명똿", firstday: "泥?異쒓렐", dinner: "寃⑹떇 ?덈뒗 ????쎌냽", date: "?곗씠??", travel: "?ы뻾 쨌 ?섎뱾??", friends: "移쒓뎄 紐⑥엫", culture: "Theatre & Musical" };
const state = { screen: "home", step: 1, occasion: null, details: { place: "indoor", time: "evening", mood: "effortless", dressCode: false }, outfit: { ...defaults }, category: "top", after: false, decisions: {} };
const app = document.querySelector("#app");
const icon = {
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m6 6-6-6 6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
};
const item = id => Object.values(wardrobe).flat().find(x => x.id === id);
const items = (look = state.outfit) => Object.entries(look).map(([key,id]) => ({ key, ...item(id) }));
function assess(look = state.outfit) {
  const all = items(look), avg = all.reduce((s,x) => s + x.formal,0)/all.length;
  let target = ({ wedding:2.55, interview:2.8, firstday:2.45, dinner:2.5, date:2.05, travel:1.45, friends:1.75, culture:2.25 }[state.occasion] || 2.4);
  if(state.details.place === "outdoor") target -= .12;
  if(state.details.time === "day") target -= .08;
  if(state.details.mood === "bare") target -= .55;
  if(state.details.mood === "maximal") target += .55;
  if(state.details.dressCode === "yes") target = Math.max(target,2.85);
  const gap = target - avg;
  const status = gap > .62 ? "More formal would help" : gap > .22 ? "A little more polished" : gap < -.76 ? "A touch too formal" : "Naturally in context";
  const verdict = gap > .62 ? "A SMALL REFINEMENT" : gap > .22 ? "A TOUCH MORE POLISHED" : gap < -.76 ? "A LITTLE MORE RELAXED" : "RIGHT IN CONTEXT";
  const reasons=[];
  if(look.top==="tee") reasons.push("?곗뀛痢좎쓽 罹먯＜?쇳븳 ?몄긽???됱궗??寃⑹떇怨?議곌툑 李⑥씠 ?⑸땲??");
  if(look.bottom==="denim") reasons.push("?곕떂???꾩껜 猷⑹쓣 ?몄븞??諛⑺뼢?쇰줈 ?대걣?댁슂.");
  if(look.shoes==="sneakers") reasons.push("罹붾쾭???ㅻ땲而ㅼ쫰媛 ?꾩껜 ?몄긽???몄븞??諛⑺뼢?쇰줈 ?대걣?댁슂.");
  if(!reasons.length) reasons.push("?좏깮???먮━??遺꾩쐞湲곗? ?섏긽 ?ㅻ（?ｌ씠 ???댁슱由쎈땲??");
  let suggestions=[];
  if(gap>.22){
    if(look.top==="tee") suggestions.push({key:"top",from:"tee",to:"shirt",reason:"?곸쓽瑜?諛붽씀硫?猷⑹쓽 ?몄긽???먯뿰?ㅻ읇寃??뺣룉?쇱슂."});
    if(look.shoes==="sneakers") suggestions.push({key:"shoes",from:"sneakers",to:"maryjane",reason:"踰꾧굔??硫붾━?쒖씤??猷⑹뿉 ?좊챸???ъ씤?몄? ?⑥젙?⑥쓣 ?뷀빀?덈떎."});
    if(look.bottom==="denim") suggestions.push({key:"bottom",from:"denim",to:"slacks",reason:"?ㅽ겕 ?곕떂???좎??대룄 醫뗭?留??щ옓?ㅻ뒗 ?쒖링 ?덉젙?곸씠?먯슂."});
    if(look.outer==="none") suggestions.push({key:"outer",from:"none",to:"trench",reason:"濡??몃젋移섍? ?ㅻ（?ｌ쓣 ?뺣룉?섎㈃???ㅻⅨ 臾대뱶瑜??뷀빀?덈떎."});
  } else if(gap<-.76) suggestions=[{key:"outer",from:look.outer,to:"none",reason:"?꾩슦?곕? ?쒖뼱?대㈃ 猷⑹씠 ?쒓껐 ?몄븞?댁쭛?덈떎."}];
  else suggestions=[{key:"outer",from:look.outer,to:look.outer==="trench"?"fieldjacket":"trench",reason:"?μ냼???곕씪 ?ㅻⅨ ?ㅻ（?ｌ쓽 ?꾩슦?곕줈 遺꾩쐞湲곕? 諛붽퓭 蹂댁꽭??"}];
  return {avg,target,gap,status,verdict,reasons,suggestions:suggestions.slice(0,2),uncertain:state.details.dressCode==="yes"||state.details.mood==="unknown"||state.details.dressCode==="unknown"};
}
function header(){return '<header class="site-header"><a href="#" class="wordmark" data-action="home">DRESS CODE<span>짰</span></a><div class="header-center">THE INTERACTIVE STYLE STUDIO</div><button class="menu-button" data-action="menu" aria-label="硫붾돱">'+icon.menu+'</button></header>'}
function observe(){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(x=>observer.observe(x))}
function loadAsset(file,done){
 const name=file.split("/").pop(),paths=[file,"/public/"+name,"./public/"+name,"./"+name];
 const probe=new Image();let index=0;
 probe.onload=()=>done(probe.src);
 probe.onerror=()=>{index++;if(index<paths.length)probe.src=paths[index]};
 probe.src=paths[0];
}
function setImageAssets(){
 document.querySelectorAll('img[src="/dress-code-hero-wide.svg"]').forEach(x=>{x.src="/dress-code-hero-fixed.png"});
 document.querySelectorAll('img[src="/editorial-hero.svg"]').forEach(x=>{x.src="/dress-code-hero.png"});
 document.querySelectorAll(".detail-photo img").forEach(x=>{if(state.occasion)x.src="/occasion-"+state.occasion+".png"});
 document.querySelectorAll('img[src="/look.svg"]').forEach(x=>{
   const row=x.closest(".occasion-row");
   const tile=x.closest(".look-tile");
   const occasionId=row?.dataset.id||(["wedding","interview","firstday"][Number(tile?.className.match(/tile-(\d)/)?.[1])-1]);
   x.src=occasionId?"/occasion-"+occasionId+".png":"/dress-code-lookbook.png";
 });
 document.querySelectorAll(".look-tile").forEach(tile=>{
   const number=Number(tile.className.match(/tile-(\d)/)?.[1])-1;
   const id=tile.dataset.id||occasions[number]?.id;
   const image=tile.querySelector("img");
   if(image&&id)image.src="/occasion-"+id+".png";
 });
 document.querySelectorAll(".wardrobe-item").forEach(button=>{
   const swatch=button.querySelector(".swatch"),idx=wardrobe[state.category].findIndex(x=>x.id===button.dataset.id);
   if(!swatch||idx<0)return;
   const file="/wardrobe-"+state.category+".png";
   swatch.style.backgroundImage="url('"+file+"')";
   swatch.style.backgroundSize="300% 100%";
   swatch.style.backgroundPosition=(idx*50)+"% center";
   swatch.classList.toggle("no-image",button.dataset.id==="none");
   if(button.dataset.id!=="none"&&swatch.dataset.asset!==file){swatch.dataset.asset=file;loadAsset(file,url=>{swatch.style.backgroundImage="url('"+url+"')"})}
 });
 document.querySelectorAll("#app img").forEach(image=>{
   if(image.dataset.assetResolved)return;
   image.dataset.assetResolved="pending";
   const filename=image.getAttribute("src")?.split("/").pop();
   if(!filename||!filename.includes(".")){image.dataset.assetResolved="skip";return}
   loadAsset("/"+filename,url=>{image.src=url;image.dataset.assetResolved="done"});
 });
}
function setLookbookCaptions(){
 const captions={interview:"?좊ː媛?쨌 ?⑥젙???뚯씪?щ쭅",dinner:"踰꾧굔???ㅼ빱??쨌 釉붾씪?곗뒪"};
 document.querySelectorAll(".look-tile").forEach((tile,index)=>{
   const occasion=occasions.find(item=>item.id===tile.dataset.id)||occasions[index];
   if(occasion){tile.dataset.id=occasion.id;tile.dataset.action="pick-occasion";tile.setAttribute("aria-label",occasion.title+" ?곹솴?쇰줈 ?쒖옉")}
   if(!tile.dataset.clickBound){tile.dataset.clickBound="true";tile.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();chooseOccasion(tile.dataset.id)})}
   const caption=captions[occasion?.id];
   if(caption){const subtitle=tile.querySelector(".tile-sub");if(subtitle)subtitle.textContent=caption;}
   if(!document.querySelector(".more-occasion-grid")&&index>=4)tile.hidden=true;
 });
 const moreLink=document.querySelector(".lookbook-heading .text-link");
 if(moreLink){moreLink.href="#occasion";moreLink.dataset.action="more-occasions";moreLink.innerHTML="THE MORE "+icon.arrow;moreLink.setAttribute("aria-label","紐⑤뱺 ?곹솴 ?좏깮?섍린");if(!moreLink.dataset.clickBound){moreLink.dataset.clickBound="true";moreLink.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();start();window.scrollTo({top:0,behavior:"smooth"})})}}
}
function home(){
 const selected=occasions.find(x=>x.id===state.occasion),scene=selected||occasions[0];
 app.innerHTML=header()+'<main class="studio-home"><div class="studio-meta"><span>THE EDITORIAL STUDIO / 01??5</span><span>CHOOSE A SCENE TO BEGIN</span></div><section class="studio-intro"><div><p class="eyebrow">A PERSONAL STYLE, IN CONTEXT</p><h1>The Occasion<span>.</span></h1><p>?대뼡 ?λ㈃???꾪븳 猷⑹쓣 ?꾩꽦?좉퉴??</p></div><span class="studio-index">01 <i></i> 05</span></section><div class="studio-workspace"><section class="studio-chooser"><div class="studio-chooser-head"><span>?ㅻ뒛???곹솴</span><small>SCENE / '+String(occasions.length).padStart(2,"0")+'</small></div><div class="studio-occasion-grid">'+occasions.map((o,i)=>'<button class="studio-occasion '+(state.occasion===o.id?"active":"")+'" data-action="studio-occasion" data-id="'+o.id+'" aria-pressed="'+(state.occasion===o.id)+'"><span class="studio-occasion-no">0'+(i+1)+'</span><img class="studio-occasion-thumb" src="/occasion-'+o.id+'.png" alt="" loading="lazy"><span><b>'+o.title+'</b><small>'+o.note+'</small></span><span class="studio-occasion-arrow">'+icon.arrow+'</span></button>').join("")+'</div><div class="studio-level"><div class="studio-chooser-head"><span>袁몃컝 ?뺣룄</span><small>YOUR STYLING LEVEL</small></div><div class="studio-level-options">'+[["bare","EFFORTLESS","Easy"],["effortless","REFINED","Classic"],["maximal","STATEMENT","Bold"]].map(([id,en,ko])=>'<button data-action="studio-mood" data-id="'+id+'" class="'+(state.details.mood===id?"active":"")+'"><small>'+en+'</small><b>'+ko+'</b></button>').join("")+'</div></div><button class="button button-dark studio-continue" data-action="begin" '+(!state.occasion?"disabled":"")+'>?λ㈃ ?뺥븯怨?怨꾩냽?섍린 '+icon.arrow+'</button></section><section class="studio-cover" data-mood="'+state.details.mood+'" style="--scene:url(/occasion-'+scene.id+'.png)"><img src="/occasion-'+scene.id+'.png" alt="'+scene.title+' ?ㅽ????먮뵒?좊━???꾨━酉?><div class="studio-cover-shade"></div><div class="studio-cover-top"><span>FIG. 01 / THE OCCASION EDIT</span><span>SEOUL 쨌 2026</span></div><div class="studio-cover-copy"><p class="eyebrow">'+(selected?selected.en.toUpperCase():"YOUR STYLE, YOUR SCENE")+'</p><h2>'+(selected?selected.title:"The Art of<br>Dressing Right.")+'</h2><p>'+(selected?selected.note:"?곹솴怨?痍⑦뼢??怨⑤씪 ?섎쭔???⑥뀡 ?먮뵒?좊━?쇱쓣 ?쒖옉??蹂댁꽭??")+'</p></div><span class="studio-cover-side">PERSONAL STYLE, CONSIDERED</span><div class="studio-live-note"><i></i><span>LIVE EDIT / '+(selected?selected.en.toUpperCase():"PREVIEW")+'</span><span>'+({bare:"Bare",effortless:"Classic",maximal:"Statement"}[state.details.mood])+'</span></div></section></div><footer class="studio-foot"><span>?곹솴怨?痍⑦뼢???좏깮?섎㈃ ?꾨━酉곌? 諛붾줈 諛붾앸땲??</span></footer></main><div class="menu-overlay" hidden><button data-action="home">THE STUDIO</button><button data-action="menu-close">CLOSE 횞</button></div>';
 setImageAssets();
}function title(en,ko,desc){if(en==="The Details."){ko="?ㅻ뒛? ?쇰쭏??袁몃ŉ 蹂쇨퉴??";desc="?몄븞?⑤????뺤떎???ㅽ??쇰쭅源뚯?, ?먰븯??遺꾩쐞湲곕? 怨⑤씪 二쇱꽭??"}return '<div class="section-title"><p class="eyebrow">0'+state.step+' / '+en.toUpperCase()+'</p><h1>'+en+'</h1><p class="title-ko">'+ko+'</p>'+(desc?'<p class="title-description">'+desc+'</p>':"")+'</div>'}
function stepOne(){return title("The Occasion.","?대뼡 ?먮━??媛?섏슂?","癒쇱? ?ㅻ뒛???λ㈃???좏깮??二쇱꽭??")+'<div class="occasion-list">'+occasions.map((o,i)=>'<button class="occasion-row '+(state.occasion===o.id?"selected":"")+'" data-action="occasion" data-id="'+o.id+'"><span class="occasion-n">0'+(i+1)+'</span><span class="occasion-copy"><strong>'+o.title+'</strong><small>'+o.note+'</small></span><span class="occasion-en">'+o.en+'</span><span class="row-arrow">'+icon.arrow+'</span></button>').join("")+'</div><div class="step-footer"><span>?먰븯???곹솴???좏깮?섎㈃ ?ㅼ쓬 ?④퀎濡??대룞?댁슂.</span><span>08 OCCASIONS</span></div>'}
function group(label,en,key,opts){
 if(key==="mood"){
  label="袁몃컝 ?뺣룄";en="YOUR STYLING LEVEL";
  opts=[["bare","EFFORTLESS","Easy","Comfortable and simple"],["effortless","REFINED","Classic","Polished and composed"],["maximal","STATEMENT","Dress up","A little more expressive"]];
 }
 return '<div class="detail-group '+(key==="mood"?"mood-group":"")+'"><div class="detail-label"><span>'+en+'</span><b>'+label+'</b></div><div class="choice-pills">'+opts.map(([id,name,hint,detail])=>'<button class="'+(state.details[key]===id?"active":"")+'" data-action="detail" data-key="'+key+'" data-id="'+id+'">'+(key==="mood"?'<small class="mood-level">'+name+'</small><span>'+hint+'</span><small class="mood-description">'+detail+'</small>':'<span>'+name+'</span>'+(hint?'<small>'+hint+'</small>':""))+'</button>').join("")+'</div></div>'
}
function stepTwo(){
 return title("The Details.","Choose the setting","Tell us about the place, time and dress code.")+
 '<div class="details-layout"><div class="detail-photo"><img src="/editorial-hero.svg" alt="A softly lit editorial setting"><span>THE SETTING / A MATTER OF CONTEXT</span></div><div class="detail-fields">'+
 group("Place","THE SETTING","place",[["indoor","Indoors"],["outdoor","Outdoors"]])+
 group("Time","THE HOUR","time",[["day","Day"],["evening","Evening"]])+
 group("Mood","THE TONE","mood",[["casual","Casual"],["smart","Polished"],["formal","Formal"],["unknown","Not sure"]])+
 '<div class="detail-group dresscode-group"><div class="detail-label"><span>THE DRESS CODE</span><b>Is there a dress code?</b></div><div class="choice-pills">'+
 [["no","No"],["yes","Yes"],["unknown","Not sure"]].map(([id,name])=>'<button class="'+(state.details.dressCode===id?"active":"")+'" data-action="detail" data-key="dressCode" data-id="'+id+'">'+name+'</button>').join("")+
 '</div><p class="context-note">'+(state.details.dressCode==="yes"?"Follow the event guidance first.":state.details.dressCode==="unknown"?"We will use general guidance for now.":"If an event has a dress code, follow it first.")+
 '</p></div></div></div><div class="step-footer"><span>Set the context, then continue to the wardrobe.</span><button class="button button-dark" data-action="next">Continue '+icon.arrow+'</button></div>';
}
function stepThree(){
 const top=item(state.outfit.top),bottom=item(state.outfit.bottom),outer=item(state.outfit.outer),shoe=item(state.outfit.shoes);
 return title("Your Personal Style.","?ㅻ뒛 ?낃퀬 ?띠? ?룹쓣 怨⑤씪 二쇱꽭??","留덉쓬???쒕뒗 ?꾩씠?쒖쓣 ?좏깮???섎쭔??議고빀??留뚮뱾??蹂댁꽭??")+'<div class="styling-layout"><div class="styling-preview"><div class="preview-top"><span>YOUR LOOK / 01</span><span>'+(labels[state.occasion]||"?ㅻ뒛???먮━")+'</span></div><div class="model-frame"><div class="model-halo"></div><div class="model-head"></div><div class="model-neck"></div><div class="model-top" style="--garment:'+top.color+'"></div><div class="model-arms"></div><div class="model-outer" style="--outer:'+(outer.id==="none"?"transparent":outer.color)+'"></div><div class="model-bottom" style="--trouser:'+bottom.color+'"></div><div class="model-shoes" style="--shoe:'+shoe.color+'"></div></div><div class="selected-items">'+items().map(x=>'<span>'+x.name+'</span>').join("")+'</div><p class="preview-caption">YOUR COMBINATION, IN CONTEXT.</p></div><div class="wardrobe-panel"><div class="wardrobe-head"><span>THE WARDROBE</span><span>?좏깮???꾩씠??<b>4</b></span></div><div class="category-tabs">'+Object.entries(categories).map(([key,[name,num]])=>'<button class="'+(state.category===key?"active":"")+'" data-action="category" data-id="'+key+'"><small>'+num+'</small>'+name+'</button>').join("")+'</div><div class="item-list">'+wardrobe[state.category].map(x=>'<button class="wardrobe-item '+(state.outfit[state.category]===x.id?"chosen":"")+'" data-action="item" data-id="'+x.id+'"><span class="swatch" style="--swatch:'+x.color+'"></span><span><b>'+x.name+'</b><small>'+x.en+'</small></span><span class="item-check">'+(state.outfit[state.category]===x.id?icon.check:"")+'</span></button>').join("")+'</div><div class="wardrobe-note"><span>STYLE NOTE</span><p>醫뗭븘?섎뒗 ?룹쓣 以묒떖?쇰줈<br>?섎㉧吏瑜??뷀빐 蹂댁꽭??</p></div></div></div><div class="step-footer"><button class="quiet-link" data-action="reset">泥섏쓬 議고빀?쇰줈 ?섎룎由ш린</button><button class="button button-dark" data-action="next">??議고빀 ?댄렣蹂닿린 '+icon.arrow+'</button></div>'
}
function review(){
 const a=assess(),look={...state.outfit};
 a.suggestions.forEach(s=>{if(state.decisions[s.key]==="apply")look[s.key]=s.to});
 const after={...state.outfit};
 a.suggestions.forEach(s=>{if(state.decisions[s.key]==="apply")after[s.key]=s.to});
 const current=items(look);
 return title("The Verdict.","Your look, in context.","A small adjustment can bring the outfit closer to the occasion.")+
 '<div class="result-editorial"><div class="result-image"><div class="result-image-overlay"><span>YOUR LOOK / 01</span><span>'+(labels[state.occasion]||"Today")+'</span></div><div class="mini-model"><div class="mini-head"></div><div class="mini-body" style="--garment:'+item(look.top).color+';--trouser:'+item(look.bottom).color+';--outer:'+(look.outer==="none"?"transparent":item(look.outer).color)+'"></div><div class="mini-legs" style="--trouser:'+item(look.bottom).color+'"></div></div><span class="result-image-caption">FIG. 01 / PERSONAL STYLE, CONSIDERED</span></div><div class="verdict-panel"><p class="eyebrow">THE STYLE VERDICT</p><h2>'+a.status+'</h2><p class="verdict-en">'+a.verdict+'</p><p class="reason">'+a.reasons.join(" ")+'</p><div class="review-items"><span>YOUR SELECTED LOOK</span>'+current.map(x=>'<div><b>'+x.name+'</b><small>'+x.en+'</small></div>').join("")+'</div></div></div>'+
 '<div class="recommendation"><div class="recommendation-head"><p class="eyebrow">KEEP & CHANGE</p><h3>A gentle refinement</h3><p>Your chosen outfit stays as you selected it. Apply only the changes you want.</p></div><div class="suggestion-list">'+a.suggestions.map((s,i)=>'<div class="suggestion"><span class="suggestion-no">0'+(i+1)+'</span><span class="swap-from"><small>KEEP / CHANGE</small><b>'+item(s.from).name+'</b></span><span class="swap-arrow">'+icon.arrow+'</span><span class="swap-to"><small>CONSIDER</small><b>'+item(s.to).name+'</b></span><p>'+s.reason+'</p></div>').join("")+'</div></div>'+
 '<div class="before-after"><div class="ba-head"><div><p class="eyebrow">BEFORE & AFTER</p><h3>Compare your outfit</h3></div><div class="ba-toggle"><button class="'+(!state.after?"active":"")+'" data-action="compare" data-id="before">BEFORE</button><button class="'+(state.after?"active":"")+'" data-action="compare" data-id="after">AFTER</button></div></div><div class="ba-pair"><div><span>01 / YOUR CHOICE</span><p>'+items(state.outfit).filter(x=>x.id!=="none").map(x=>x.name).join(" · ")+'</p></div><span class="ba-separator">'+icon.arrow+'</span><div><span>02 / APPLIED CHANGES</span><p>'+items(after).filter(x=>x.id!=="none").map(x=>x.name).join(" · ")+'</p></div></div></div><div class="result-actions"><button class="button button-outline" data-action="edit">'+icon.back+' Edit outfit</button></div><p class="result-disclaimer">Check any dress code provided by your venue or host.</p>';
}
function finalLook(){const a=assess(),look={...state.outfit};if(state.after)a.suggestions.forEach(s=>{if(state.decisions[s.key]==="apply")look[s.key]=s.to});return look}
function cover(){
 const look=finalLook(),selected=occasions.find(x=>x.id===state.occasion);
 return '<section class="cover-stage"><div class="cover-stage-head"><span>THE EDITORIAL / FINAL PLATE</span><span>05 / SAVE YOUR LOOK</span></div><article class="magazine-cover"><img src="/occasion-'+state.occasion+'.png" alt="'+(selected?.title||"Your occasion")+' editorial"><div class="magazine-wash"></div><div class="magazine-masthead"><span>DRESS<br>CODE</span><small>PERSONAL STYLE JOURNAL<br>VOL. 01 / SEOUL 2026</small></div><div class="magazine-title"><p>THE OCCASION EDIT</p><h1>Wear<br>it <em>your way.</em></h1><span>'+(selected?.en||"YOUR OCCASION").toUpperCase()+' / '+(state.details.place==="outdoor"?"OUTDOOR":"INDOOR")+'</span></div><div class="magazine-foot"><div><small>YOUR LOOK</small><p>'+items(look).filter(x=>x.id!=="none").map(x=>x.name).join(" · ")+'</p></div><div><small>STYLE NOTE</small><p>'+assess().status+'</p></div></div><span class="magazine-number">01</span></article><div class="cover-caption"><div><p class="eyebrow">A LOOK, MADE BY YOU</p><p>Your selections, composed as a personal fashion cover.</p></div><div class="cover-actions"><button class="button button-outline" data-action="back">'+icon.back+' Previous step</button><button class="button button-dark" data-action="save">'+icon.download+' Save cover image</button><button class="button button-outline" data-action="start">Start over</button></div></div></section>';
}
function render({scrollToTop=false}={}){
 const previousScroll=window.scrollY;
 if(state.screen==="home"){home();return}
 const body=state.step===1?stepOne():state.step===2?stepTwo():state.step===3?stepThree():state.step===5?cover():review();
 app.innerHTML=header()+'<main class="app-page"><div class="app-topline"><button class="back-button" data-action="'+(state.step===1?"home":"back")+'">'+icon.back+'<span>'+(state.step===1?"泥섏쓬?쇰줈":"?댁쟾 ?④퀎")+'</span></button><div class="step-track"><span>YOUR STYLE JOURNAL</span><b><i style="width:'+(state.step/5*100)+'%"></i></b></div><span class="step-count">0'+state.step+' <small>/ 05</small></span></div><div class="steps-content">'+body+'</div></main><footer class="site-footer"><span>DRESS CODE짰</span><span>THE INTERACTIVE STYLE STUDIO</span><span>AI LAB / 2026</span></footer>';
 setImageAssets();
 if(state.step===4){
   document.querySelector(".result-actions")?.insertAdjacentHTML("beforeend",'<button class="button button-dark" data-action="next">異붿쿇 諛섏쁺??理쒖쥌 猷?蹂닿린 '+icon.arrow+'</button>');
 }
 if(state.step===5){
   document.querySelector(".recommendation")?.remove();
   document.querySelector(".before-after")?.remove();
   const actions=document.querySelector(".result-actions");
   actions?.insertAdjacentHTML("afterbegin",'<button class="button button-outline" data-action="back">'+icon.back+' 異붿쿇 ?ㅼ떆 蹂닿린</button>');
   actions?.insertAdjacentHTML("beforeend",'<button class="button button-outline" data-action="start">泥섏쓬遺???ㅼ떆</button>');
 }
 if(state.step>=4){
   if(state.step===4&&(state.details.dressCode==="yes"||state.details.dressCode==="unknown"||state.details.mood==="unknown")){
     const reason=document.querySelector(".reason");
     if(reason) reason.textContent="?좏깮???뺣낫留뚯쑝濡쒕뒗 ?됱궗??吏?뺣맂 湲곗????????놁뼱?? ?꾨옒 ?댁슜? ?쇰컲?곸씤 李멸퀬 ?섍껄?대ŉ, 珥덈??μ씠???꾩옣 ?덈궡瑜?癒쇱? ?뺤씤??二쇱꽭??";
   }
   document.querySelectorAll(".suggestion").forEach((row,index)=>{
     const suggestion=assess().suggestions[index]; if(!suggestion)return;
     const actions=document.createElement("div"); actions.className="suggestion-actions";
     const choice=state.decisions[suggestion.key];
     actions.innerHTML='<button data-action="apply" data-id="'+suggestion.key+'">'+(choice==="apply"?"Applied":"Apply change")+'</button><button data-action="keep" data-id="'+suggestion.key+'">'+(choice==="keep"?"Keeping current":"Keep current")+'</button>';
     row.append(actions);
   });
 }
 if(scrollToTop)window.scrollTo({top:0,behavior:"smooth"});
 else window.scrollTo({top:previousScroll,left:0,behavior:"instant"})
}
function start(){state.screen="home";state.step=1;state.occasion=null;state.details={place:"indoor",time:"evening",mood:"effortless",dressCode:"no"};state.outfit={...defaults};state.category="top";state.after=false;state.decisions={};home()}
function chooseOccasion(id){state.screen="flow";state.step=2;state.occasion=id;state.details={place:"indoor",time:"evening",mood:"effortless",dressCode:"no"};state.outfit={...defaults};state.category="top";state.after=false;state.decisions={};render({scrollToTop:true})}
function next(){if(state.step===1&&!state.occasion){document.querySelector(".occasion-list")?.classList.add("nudge");setTimeout(()=>document.querySelector(".occasion-list")?.classList.remove("nudge"),400);return}if(state.step<3)state.step++;else if(state.step===3){state.step=4;state.after=false}else if(state.step===4){state.step=5;state.after=true}render({scrollToTop:true})}
function back(){if(state.step===5){state.step=4;state.after=false}else if(state.step===2){state.screen="home";home();return}else if(state.step>1)state.step--;else state.screen="home";render({scrollToTop:true})}
async function save(){
 const a=assess(),look=finalLook(),canvas=document.createElement("canvas");canvas.width=1000;canvas.height=1400;const c=canvas.getContext("2d");
 const img=await new Promise(resolve=>{let settled=false;const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);resolve(value)};const timer=setTimeout(()=>finish(null),4000);loadAsset("/occasion-"+(state.occasion||"wedding")+".png",url=>{const photo=new Image();photo.onload=()=>finish(photo);photo.onerror=()=>finish(null);photo.src=url})});
 c.fillStyle="#786e62";c.fillRect(0,0,1000,1400);if(img){const scale=Math.max(1000/img.width,1400/img.height),cropW=1000/scale,cropH=1400/scale;c.drawImage(img,(img.width-cropW)/2,(img.height-cropH)/2,cropW,cropH,0,0,1000,1400)}
 const shade=c.createLinearGradient(0,0,0,1400);shade.addColorStop(0,"rgba(35,27,22,.25)");shade.addColorStop(.28,"rgba(35,27,22,0)");shade.addColorStop(.59,"rgba(35,27,22,.05)");shade.addColorStop(1,"rgba(35,27,22,.82)");c.fillStyle=shade;c.fillRect(0,0,1000,1400);
 c.fillStyle="#fffdf6";c.textAlign="left";c.font="600 38px sans-serif";c.fillText("DRESS",66,82);c.fillText("CODE",66,122);c.textAlign="right";c.font="500 16px sans-serif";c.fillText("PERSONAL STYLE JOURNAL",934,78);c.fillText("VOL. 01 쨌 SEOUL 2026",934,105);
 c.textAlign="left";c.font="500 17px sans-serif";c.fillText("THE OCCASION EDIT",78,435);c.font="italic 300 126px Georgia, serif";c.fillText("Wear it",72,560);c.fillText("your way.",72,682);c.font="500 17px sans-serif";c.fillText((labels[state.occasion]||"?ㅻ뒛???먮━").toUpperCase()+" / "+(state.details.place==="outdoor"?"OUTDOOR":"INDOOR"),78,733);
 c.strokeStyle="rgba(255,255,255,.72)";c.lineWidth=1;c.beginPath();c.moveTo(72,1180);c.lineTo(928,1180);c.stroke();c.textAlign="left";c.font="500 15px sans-serif";c.fillText("YOUR LOOK",78,1220);c.fillText("STYLE NOTE",590,1220);c.font="400 22px sans-serif";const outfitLine=items(look).filter(x=>x.id!=="none").map(x=>x.name).join(" 쨌 ");c.fillText(outfitLine.slice(0,40),78,1260);c.font="400 18px sans-serif";c.fillText(state.after?"?묒? 蹂?붾줈 ?먮━? 洹좏삎??留욎톬?댁슂.":a.status,590,1260);c.font="500 13px sans-serif";c.fillText("STYLE IS PERSONAL. CONTEXT MATTERS.",78,1345);c.textAlign="right";c.fillText("01",922,1345);
 canvas.toBlob(blob=>{if(!blob)return;const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="dress-code-editorial-cover.png";link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)},"image/png")
}document.addEventListener("click",e=>{
 const el=e.target.closest("[data-action]");if(!el)return;const {action,id,key}=el.dataset;
 if(action==="more-occasions"){e.preventDefault();start();window.scrollTo({top:0,behavior:"smooth"})}
 else if(action==="back-home"){e.preventDefault();state.screen="home";home();requestAnimationFrame(()=>document.querySelector(".lookbook")?.scrollIntoView({behavior:"smooth"}))}
 else if(action==="pick-occasion"){e.preventDefault();chooseOccasion(id)}
 else if(action==="start"){e.preventDefault();start()}else if(action==="home"){e.preventDefault();state.screen="home";home();window.scrollTo({top:0,behavior:"smooth"})}else if(action==="studio-occasion"){state.occasion=id;home()}else if(action==="studio-mood"){state.details.mood=id;home()}else if(action==="begin"){state.screen="flow";state.step=1;next()}else if(action==="menu-close"){const m=document.querySelector(".menu-overlay");if(m)m.hidden=true}
 else if(action==="next")next();else if(action==="back")back();else if(action==="edit"){state.step=3;state.after=false;state.decisions={};render({scrollToTop:true})}
 else if(action==="occasion"){if(state.occasion!==id){state.details={place:"indoor",time:"evening",mood:"effortless",dressCode:"no"};state.after=false;state.decisions={}}state.occasion=id;state.step=2;render({scrollToTop:true})}else if(action==="category"){state.category=id;render()}else if(action==="item"){state.outfit[state.category]=id;state.after=false;state.decisions={};render()}
 else if(action==="detail"){
   state.details[key]=id;state.after=false;state.decisions={};
   const group=el.closest(".detail-group");
   group?.querySelectorAll('[data-action="detail"]').forEach(button=>{
     const selected=button.dataset.id===id;
     button.classList.toggle("active",selected);
     button.setAttribute("aria-pressed",String(selected));
   });
   if(key==="dressCode"){
     const note=document.querySelector(".context-note");
     if(note)note.textContent=id==="yes"?"?됱궗 ?덈궡媛 ?쇰컲?곸씤 湲곗?蹂대떎 ?곗꽑?댁슂. ?덈궡 臾멸뎄瑜??뺤씤??二쇱꽭??":id==="unknown"?"?덈궡瑜??뺤씤?섍린 ?꾧퉴吏??李멸퀬?⑹쑝濡쒕쭔 ?댄렣蹂쇨쾶??":"怨듭떇 ?덈궡媛 ?덈떎硫??몄젣??洹?湲곗????곗꽑??二쇱꽭??";
   }
 }else if(action==="compare"){state.after=id==="after";render()}else if(action==="save")save()
 else if(action==="apply"){state.decisions[id]="apply";el.textContent="Recommendation applied";const keep=el.closest(".suggestion-actions")?.querySelector('[data-action="keep"]');if(keep)keep.textContent="?꾩옱?濡??좎?"}
 else if(action==="keep"){state.decisions[id]="keep";el.textContent="Keep current";const apply=el.closest(".suggestion-actions")?.querySelector('[data-action="apply"]');if(apply)apply.textContent="??蹂寃??곸슜"}
 else if(action==="reset"){state.outfit={...defaults};state.decisions={};render()}else if(action==="manifesto"){document.querySelector("#manifesto")?.scrollIntoView({behavior:"smooth"});document.querySelector(".menu-overlay")?.setAttribute("hidden","")}
 else if(action==="menu"){const m=document.querySelector(".menu-overlay");if(m)m.hidden=!m.hidden}
});
document.addEventListener("change",e=>{if(e.target.matches('[data-action="dresscode"]'))state.details.dressCode=e.target.checked});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const m=document.querySelector(".menu-overlay");if(m)m.hidden=true}});
home();
