import {test,expect} from '@playwright/test';

async function openBoard(page){await page.goto('/dress-code-studio/');await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="edit-wardrobe"]').click();await expect(page.locator('.look-preview .outfit-board')).toBeVisible()}
test('every garment immediately updates the board without API calls',async({page})=>{
 const requests=[],errors=[];page.on('request',req=>{if(req.url().includes('/api/'))requests.push(req.url())});page.on('pageerror',error=>errors.push(error.message));await openBoard(page);
 let count=0;for(const key of ['top','bottom','outer','shoes','accessory']){await page.locator('[data-action="category"][data-id="'+key+'"]').click();const ids=await page.locator('[data-action="item"]').evaluateAll(nodes=>nodes.map(node=>node.dataset.id));for(const id of ids){const option=page.locator('[data-action="item"][data-id="'+id+'"]');const selected=await option.getAttribute('aria-pressed')==='true';await option.click();if(id==='none')await expect(page.locator('.look-preview .board-outer')).toHaveCount(0);else await expect(page.locator('.look-preview [data-board-item="'+id+'"]')).toHaveCount(key==='accessory'&&selected?0:1);count++}}
 expect(count).toBe(41);expect(requests).toEqual([]);expect(errors).toEqual([]);await expect(page.locator('[data-action="generate-photo"]')).toHaveCount(0);
});
test('custom combination persists through review and exports a real PNG board',async({page})=>{
 await openBoard(page);for(const [key,id] of [['top','hoodie'],['bottom','blackmini'],['outer','none'],['shoes','tallboots']]){await page.locator('[data-action="category"][data-id="'+key+'"]').click();await page.locator('[data-action="item"][data-id="'+id+'"]').click()}
 await page.locator('[data-action="category"][data-id="accessory"]').click();await page.locator('[data-action="item"][data-id="bag"]').click();await page.locator('[data-action="item"][data-id="watch"]').click();await page.screenshot({path:'test-results/outfit-board-desktop.png',fullPage:true});
 await page.locator('[data-action="next"]').click();for(const button of await page.locator('[data-action="keep"]').all())await button.click();await page.locator('[data-action="next"]').click();
 for(const id of ['hoodie','blackmini','tallboots','pearl','bag','watch'])await expect(page.locator('.magazine-cover [data-board-item="'+id+'"]')).toHaveCount(1);
 await expect(page.locator('[data-action="save"]')).toBeEnabled();const download=page.waitForEvent('download');await page.locator('[data-action="save"]').click();const file=await download;expect(file.suggestedFilename()).toBe('dress-code-outfit-board.png');await file.saveAs('test-results/outfit-board-export.png');await expect(page.locator('.cover-save-error')).toHaveCount(0);
});
test('mobile board and style choice preserve selections without horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await openBoard(page);await page.locator('[data-action="model-gender"][data-id="male"]').click();await expect(page.locator('.look-preview .board-head')).toContainText('MENSWEAR');await page.locator('[data-action="item"][data-id="stripedshirt"]').click();await expect(page.locator('.look-preview [data-board-item="stripedshirt"]')).toBeVisible();await page.locator('.look-preview').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/outfit-board-mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
