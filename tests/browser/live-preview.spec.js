import { test,expect } from '@playwright/test';
test('static Live Server preview needs no API server or credentials',async({page})=>{
 const apiCalls=[],errors=[];
 page.on('request',request=>{if(request.url().includes('/api/'))apiCalls.push(request.url())});page.on('pageerror',error=>errors.push(error.message));
 await page.route('http://127.0.0.1:5500/**',async route=>{
  if(route.request().url().endsWith('/ai-config.js'))return route.fulfill({contentType:'application/javascript',body:'window.StyleAIConfig={enabled:false};'});
  const response=await route.fetch({url:route.request().url().replace(':5500',':4173')});await route.fulfill({response});
 });
 await page.goto('http://127.0.0.1:5500/dress-code-studio/index.html');await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="edit-wardrobe"]').click();await page.locator('[data-action="item"][data-id="hoodie"]').click();
 await expect(page.locator('.look-preview .outfit-board')).toBeVisible();await expect(page.locator('[data-action="generate-photo"]')).toHaveCount(0);
 await page.evaluate(async()=>{await window.RealOutfits.generate({top:'hoodie',bottom:'slacks',outer:'none',shoes:'loafers',accessory:[]},'female');await window.RealOutfits.available({refresh:true})});
 expect(apiCalls).toEqual([]);expect(errors).toEqual([]);
});
