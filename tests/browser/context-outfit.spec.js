import {test,expect} from '@playwright/test';
async function context(page,level='statement'){await page.goto('/dress-code-studio/');await page.locator('[data-action="scene"][data-id="travel"]').click();await page.locator(`[data-action="level"][data-id="${level}"]`).click();await page.locator('[data-action="next"]').click()}
const selected=page=>page.locator('.look-preview [data-board-item]').evaluateAll(nodes=>nodes.map(node=>node.dataset.boardItem).sort());
test('place, hour and notice preselect the first board with no API call',async({page})=>{
 const api=[];page.on('request',request=>{if(request.url().includes('/api/'))api.push(request.url())});await context(page);
 for(const [key,id] of [['place','outdoor'],['time','evening'],['dressCode','yes']])await page.locator(`[data-action="detail"][data-key="${key}"][data-id="${id}"]`).click();await page.locator('[data-action="next"]').click();
 for(const id of ['turtleneck','slacks','leatherjacket','sneakers','bag','scarf'])await expect(page.locator(`.look-preview [data-board-item="${id}"]`)).toHaveCount(1);
 await expect(page.locator('.context-start-note')).toContainText('야외 · 저녁 · 복장 안내 있음');await expect(page.locator('.context-start-note')).toContainText('직접 확인');
 expect(api).toEqual([]);
});
test('custom clothes survive unchanged context and reload; changed context and reset use the new starting combination',async({page})=>{
 await context(page,'bare');await page.locator('[data-action="next"]').click();await page.locator('[data-action="item"][data-id="blouse"]').click();const customized=await selected(page);
 await page.locator('[data-action="back"]').click();await page.locator('[data-action="next"]').click();expect(await selected(page)).toEqual(customized);await page.reload();expect(await selected(page)).toEqual(customized);
 await page.locator('[data-action="back"]').click();await page.locator('[data-action="detail"][data-key="time"][data-id="evening"]').click();await page.locator('[data-action="detail"][data-key="dressCode"][data-id="yes"]').click();await page.locator('[data-action="next"]').click();
 const initial=await selected(page);expect(initial).toContain('polo');expect(initial).toContain('loafers');expect(initial).not.toContain('blouse');
 await page.locator('[data-action="item"][data-id="hoodie"]').click();await page.locator('[data-action="reset"]').click();expect(await selected(page)).toEqual(initial);
});
