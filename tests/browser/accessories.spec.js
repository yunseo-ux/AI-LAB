import {test,expect} from '@playwright/test';

test('multiple accessories toggle independently and remain visible in the board',async({page})=>{
 await page.goto('/dress-code-studio/');await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="edit-wardrobe"]').click();await page.locator('[data-action="category"][data-id="accessory"]').click();
 for(const id of ['bag','watch'])await page.locator('[data-action="item"][data-id="'+id+'"]').click();await expect(page.locator('.item-option[aria-pressed=true]')).toHaveCount(3);await expect(page.locator('.look-preview .board-accessories .board-piece')).toHaveCount(3);await expect(page.locator('.picker-foot')).toContainText('7 아이템');
 for(const id of ['pearl','bag','watch'])await page.locator('[data-action="item"][data-id="'+id+'"]').click();await expect(page.locator('.look-preview .board-accessories .board-piece')).toHaveCount(0);await expect(page.locator('.look-preview .board-empty')).toBeVisible();await expect(page.locator('.picker-foot')).toContainText('4 아이템');
 for(const id of ['pearl','bag','watch','gold','scarf','chain','tie'])await page.locator('[data-action="item"][data-id="'+id+'"]').click();await expect(page.locator('.look-preview .board-accessories .board-piece')).toHaveCount(7);await page.locator('[data-action="next"]').click();await expect(page.locator('.review-photo .board-accessories .board-piece')).toHaveCount(7);
});
