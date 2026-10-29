import {test,expect} from '@playwright/test';
async function start(page,scene='wedding'){await page.goto('/dress-code-studio/');await page.locator(`[data-action="scene"][data-id="${scene}"]`).click();await page.locator('[data-action="edit-wardrobe"]').click()}
const ids=page=>page.locator('.look-preview [data-board-item]').evaluateAll(nodes=>nodes.map(node=>node.dataset.boardItem).sort());
test('changing the event context clears previous recommendation approvals',async({page})=>{
 await start(page,'interview');for(const [category,id] of [['top','tee'],['bottom','denim'],['outer','none'],['shoes','sneakers']]){await page.locator(`[data-action="category"][data-id="${category}"]`).click();await page.locator(`[data-action="item"][data-id="${id}"]`).click()}
 await page.locator('[data-action="next"]').click();await page.locator('[data-action="apply"]').first().click();await expect(page.locator('.suggestion.applied')).toHaveCount(1);
 await page.locator('[data-action="back"]').click();await page.locator('[data-action="back"]').click();await page.locator('[data-action="detail"][data-id="outdoor"]').click();await page.locator('[data-action="next"]').click();await page.locator('[data-action="next"]').click();await expect(page.locator('.suggestion.applied')).toHaveCount(0);
});
test('starting point is clear, style does not change clothes, and reload/home preserve the draft',async({page})=>{
 await page.goto('/dress-code-studio/');await expect(page.locator('[data-action="edit-wardrobe"]')).toBeDisabled();await expect(page.getByRole('button',{name:'내 옷 등록',exact:true})).toBeVisible();
 await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="edit-wardrobe"]').click();await page.locator('[data-action="item"][data-id="hoodie"]').click();await page.locator('[data-action="category"][data-id="accessory"]').click();await page.locator('[data-action="item"][data-id="bag"]').click();
 const original=await ids(page);await page.getByRole('button',{name:'남성',exact:true}).click();expect(await ids(page)).toEqual(original);
 await page.reload();expect(await ids(page)).toEqual(original);await expect(page.getByRole('button',{name:'남성',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-action="home"]').click();await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="edit-wardrobe"]').click();expect(await ids(page)).toEqual(original);
 await page.evaluate(()=>sessionStorage.setItem('dress-code-outfit-draft-v1','{"step":5,"outfit":{"top":"missing"}}'));await page.reload();await expect(page.getByRole('heading',{name:'The Occasion.'})).toBeVisible();
});
test('only explicitly applied recommendations appear in review and final board',async({page})=>{
 await start(page,'interview');for(const [category,id] of [['top','tee'],['bottom','denim'],['outer','none'],['shoes','sneakers']]){await page.locator(`[data-action="category"][data-id="${category}"]`).click();await page.locator(`[data-action="item"][data-id="${id}"]`).click()}
 await page.locator('[data-action="next"]').click();const board=()=>page.locator('.review-photo [data-board-item]').evaluateAll(nodes=>nodes.map(node=>node.dataset.boardItem).sort());
 const before=await board();await page.locator('[data-action="compare"][data-id="after"]').click();expect(await board()).toEqual(before);
 const apply=page.locator('[data-action="apply"]').first();const name=await apply.locator('xpath=../..').locator('.suggestion-swap b').textContent();await apply.click();
 await expect(page.locator('[data-action="compare"][data-id="after"]')).toHaveClass('active');await expect(page.locator('.review-photo')).toContainText(name);
 const after=await board();expect(after.filter(id=>!before.includes(id))).toHaveLength(1);
 await page.locator('[data-action="next"]').click();expect(await page.locator('.magazine-cover [data-board-item]').evaluateAll(nodes=>nodes.map(node=>node.dataset.boardItem).sort())).toEqual(after);
 await expect(page.locator('.cover-context')).toContainText(['선택한 변경 적용']);
});
test('mobile shortcuts move between board and garment controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await start(page);
 await page.locator('[data-action="view-picker"]').click();await expect(page.locator('.picker-heading')).toBeInViewport();await page.locator('[data-action="view-board"]').click();await expect(page.locator('.style-selection-help')).toBeInViewport();
 await page.screenshot({path:'test-results/usability-mobile.png',fullPage:true});
});
test('download has busy/success feedback and the registration dialog explains its limits',async({page})=>{
 await start(page);await page.locator('[data-action="next"]').click();await page.locator('[data-action="next"]').click();
 await page.evaluate(()=>{const image=window.OutfitBoard.image;window.OutfitBoard.image=async(...args)=>{await new Promise(resolve=>setTimeout(resolve,400));return image(...args)}});
 const downloading=page.waitForEvent('download');await page.locator('[data-action="save"]').click();await expect(page.locator('[data-action="save"]')).toHaveText('이미지 저장 중…');await downloading;
 await expect(page.locator('.cover-save-status')).toHaveText('PNG 이미지 다운로드를 시작했어요.');await expect(page.locator('[data-action="save"]')).toBeEnabled();
 await page.getByRole('button',{name:'내 옷 등록',exact:true}).click();await expect(page.locator('.closet-intro')).toContainText('코디 보드는 기본 의상 사진을 사용해요.');await expect(page.locator('.closet-analyze')).toBeDisabled();
});
