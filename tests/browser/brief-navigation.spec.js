import {test,expect} from '@playwright/test';
test('brief menu highlights the section being read on scroll, click and deep links',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/plan/index.html');
 const active=page.locator('.brief-toc a[aria-current="location"]');await expect(active).toHaveAttribute('href','#background');
 for(const id of ['audience','principles','journey','features','design','scope','validation']){
  await page.evaluate(id=>scrollTo(0,document.getElementById(id).getBoundingClientRect().top+scrollY-110),id);
  await expect(active).toHaveCount(1);await expect(active).toHaveAttribute('href','#'+id);
 }
 await page.locator('.brief-toc a[href="#features"]').click();await expect(active).toHaveAttribute('href','#features');
 await page.goto('/plan/index.html#design');await expect(active).toHaveAttribute('href','#design');
 await page.evaluate(()=>scrollTo(0,0));await expect(active).toHaveAttribute('href','#background');
});
