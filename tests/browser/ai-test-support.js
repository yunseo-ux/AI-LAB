export async function enableAI(page){
 await page.route('**/dress-code-studio/ai-config.js',route=>route.fulfill({contentType:'application/javascript',body:'window.StyleAIConfig={enabled:true};'}));
 await page.route('**/api/render-outfit',async route=>{
  if(route.request().method()==='GET')await route.fulfill({json:{configured:true}});
  else await route.fallback();
 });
}
