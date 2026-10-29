import {test,expect} from '@playwright/test';
test('project entry separates the brief and working content',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/');
 await expect(page.getByRole('heading',{name:/Right for the moment/})).toBeVisible();
 await page.getByRole('link',{name:'기획서 보기',exact:true}).click();await expect(page).toHaveURL(/\/plan\/index.html/);
 await expect(page.getByRole('navigation',{name:'기획서 목차'}).getByRole('link')).toHaveCount(9);
 await page.getByRole('navigation',{name:'기획서 목차'}).getByRole('link',{name:'05 핵심 기능'}).click();await expect(page).toHaveURL(/#features$/);await expect(page.locator('#features h2')).toBeInViewport();
 await page.getByRole('navigation',{name:'프로젝트 메뉴'}).getByRole('link',{name:'콘텐츠 체험'}).click();await expect(page).toHaveURL(/\/dress-code-studio\/index.html/);
 await page.locator('[data-action="scene"][data-id="wedding"]').click();await page.locator('[data-action="edit-wardrobe"]').click();await expect(page.locator('.look-preview .outfit-board')).toBeVisible();
 await page.getByRole('link',{name:'프로젝트 소개로 돌아가기'}).click();await expect(page).toHaveURL(/\/$/);
 await page.getByRole('link',{name:'콘텐츠 체험하기',exact:true}).click();await expect(page.locator('.look-preview .outfit-board')).toBeVisible();expect(errors).toEqual([]);
});
test('project and brief work on mobile with no horizontal overflow or API calls',async({page})=>{
 await page.setViewportSize({width:390,height:844});const api=[];page.on('request',request=>{if(request.url().includes('/api/'))api.push(request.url())});
 await page.goto('/');await expect(page.getByRole('link',{name:'기획서 보기',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/project-mobile.png',fullPage:true});
 await page.getByRole('link',{name:'기획서 보기',exact:true}).click();await expect(page.locator('#scope')).toContainText('API');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(api).toEqual([]);
});
test('project entry has two cards and an editorial design on desktop',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');await expect(page.locator('.project-card')).toHaveCount(2);const left=await page.locator('.project-card').nth(0).boundingBox(),right=await page.locator('.project-card').nth(1).boundingBox();expect(Math.abs(left.y-right.y)).toBeLessThan(2);expect(right.x).toBeGreaterThan(left.x+left.width);await page.screenshot({path:'test-results/project-desktop.png',fullPage:true});
});
