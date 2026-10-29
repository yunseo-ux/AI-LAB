(() => {
 const links=[...document.querySelectorAll('.brief-toc a[href^="#"]')];
 const entries=links.map(link=>({link,section:document.getElementById(link.hash.slice(1))})).filter(entry=>entry.section);
 if(!entries.length)return;
 let frame=0;
 function update(){
  frame=0;
  const readingLine=Math.min(180,Math.max(100,innerHeight*.2));
  let current=entries[0];
  for(const entry of entries){if(entry.section.getBoundingClientRect().top<=readingLine)current=entry;else break}
  if(scrollY>0&&scrollY+innerHeight>=document.documentElement.scrollHeight-3)current=entries[entries.length-1];
  for(const entry of entries){if(entry===current)entry.link.setAttribute('aria-current','location');else entry.link.removeAttribute('aria-current')}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('hashchange',schedule);addEventListener('load',schedule);
 document.fonts?.ready.then(schedule);schedule();
})();
