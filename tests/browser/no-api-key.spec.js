import { test,expect } from '@playwright/test';
import path from 'node:path';
import { enableAI } from './ai-test-support.js';
for(const failure of ['network','server-error'])test(`generation ${failure} ends loading, disables AI and preserves other controls`,async({page})=>{
 await enableAI(page);let posts=0;
 await page.route('**/api/render-outfit',async route=>{if(route.request().method()==='GET')return route.fulfill({json:{configured:true}});posts++;return failure==='network'?route.abort():route.fulfill({status:502,json:{error:'Provider unavailable'}})});
 await page.goto('/dress-code-studio/');await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="edit-wardrobe"]').click();await page.locator('[data-action="item"][data-id="hoodie"]').click();
 await page.evaluate(()=>window.RealOutfits.generate({top:'hoodie',bottom:'slacks',outer:'none',shoes:'loafers',accessory:[]},'female').catch(()=>{}));
 await expect(page.locator('.look-preview .outfit-board')).toBeVisible();await expect(page.locator('.look-preview [data-board-item=hoodie]')).toHaveCount(1);
 await page.locator('[data-action="item"][data-id="knit"]').click();await page.locator('[data-action="next"]').click();await page.getByRole('button',{name:/내 옷 (AI 분석|등록)/}).click();
 await expect(page.locator('.closet-analyze')).toBeDisabled();await expect(page.locator('#closet-file')).toBeEnabled();await expect(page.locator('#closet-form')).toHaveAttribute('aria-busy','false');expect(posts).toBe(1);
});
test('no key: every page, model choice, multiple accessories, save and buttons remain usable without API requests',async({page})=>{
 const apiCalls=[],errors=[];page.on('request',req=>{if(req.url().includes('/api/'))apiCalls.push(req.url())});page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/dress-code-studio/');await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="next"]').click();
 await page.locator('[data-action="detail"][data-id="outdoor"]').click();await page.locator('[data-action="next"]').click();await page.getByRole('button',{name:'남성',exact:true}).click();
 await expect(page.locator('.look-preview .board-head')).toContainText('MENSWEAR');
 await page.locator('[data-action="category"][data-id="accessory"]').click();await page.locator('[data-action="item"][data-id="bag"]').click();await page.locator('[data-action="item"][data-id="watch"]').click();
 await expect(page.locator('.item-option[aria-pressed=true]')).toHaveCount(3);await expect(page.locator('.generate-outfit-photo')).toHaveCount(0);
 await page.locator('[data-action="next"]').click();await page.locator('[data-action="compare"][data-id="after"]').click();await page.locator('[data-action="next"]').click();await expect(page.locator('[data-action="save"]')).toBeEnabled();
 await page.locator('[data-action="back"]').click();await page.locator('[data-action="back"]').click();await page.locator('[data-action="reset"]').click();
 await page.getByRole('button',{name:/내 옷 (AI 분석|등록)/}).click();await page.locator('#closet-file').setInputFiles(path.resolve('dress-code-studio/assets/model-female-v1.png'));
 await expect(page.locator('.closet-analyze')).toBeDisabled();await expect(page.locator('.closet-save')).toBeEnabled();
 await page.locator('.closet-save').click();await expect(page.locator('.closet-saved-item')).toHaveCount(1);
 await page.locator('#closet-form').evaluate(form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 await expect(page.locator('#closet-form')).toHaveAttribute('aria-busy','false');await expect(page.locator('.closet-results')).toBeEmpty();
 await page.getByRole('button',{name:'내 옷 분석 닫기'}).click();await page.locator('[data-action="home"]').click();
 await expect(page.getByRole('heading',{name:'The Occasion.'})).toBeVisible();expect(apiCalls).toEqual([]);expect(errors).toEqual([]);
});
for(const failure of ['missing-key','network','invalid-response','timeout'])test(`API status ${failure} settles once and never blocks normal interactions`,async({page})=>{
 await enableAI(page);let checks=0,posts=0;
 await page.route('**/api/render-outfit',async route=>{
  if(route.request().method()!=='GET'){posts++;return route.abort()}
  checks++;
  if(failure==='network')return route.abort();
  if(failure==='invalid-response')return route.fulfill({contentType:'text/html',body:'<!doctype html><p>Static page</p>'});
  if(failure==='timeout'){await new Promise(resolve=>setTimeout(resolve,3500));return route.fulfill({json:{configured:true}}).catch(()=>{})}
  return route.fulfill({json:{configured:false}});
 });
 await page.goto('/dress-code-studio/');await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="edit-wardrobe"]').click();await page.locator('[data-action="item"][data-id="hoodie"]').click();
 await page.getByRole('button',{name:/내 옷 (AI 분석|등록)/}).click();await expect(page.locator('.closet-status')).toContainText('현재 지원되지 않는 기능입니다.',{timeout:6000});await page.getByRole('button',{name:'내 옷 분석 닫기'}).click();
 for(const id of ['shirt','polo','knit'])await page.locator(`[data-action="item"][data-id="${id}"]`).click();
 await page.evaluate(async()=>{for(let i=0;i<3;i++)await window.RealOutfits.available({refresh:true});await window.RealOutfits.generate({top:'hoodie',bottom:'slacks',outer:'none',shoes:'loafers',accessory:[]},'female')});
 await page.getByRole('button',{name:/내 옷 (AI 분석|등록)/}).click();await expect(page.locator('.closet-analyze')).toBeDisabled();await expect(page.locator('.closet-status')).toContainText('현재 지원되지 않는 기능입니다.');
 expect(checks).toBe(1);expect(posts).toBe(0);
});
