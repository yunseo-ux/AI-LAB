import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
for(const file of ['presets','context-outfit'])vm.runInContext(fs.readFileSync(`dress-code-studio/${file}.js`,'utf8'),context);
const engine=context.window.ContextOutfit,presets=context.window.lookPresets,catalog=JSON.parse(fs.readFileSync('dress-code-studio/wardrobe-catalog.json','utf8'));
function create(details,level='statement',scene='travel'){return engine.create({scene,level,details,preset:presets.find(p=>p.scene===scene&&p.level===level)})}
test('all 288 context combinations select valid available garments',()=>{
 let count=0;for(const preset of presets)for(const place of ['indoor','outdoor'])for(const time of ['day','evening'])for(const dressCode of ['yes','no','unknown']){
  const before=JSON.stringify(preset),result=create({place,time,dressCode},preset.level,preset.scene);
  for(const [key,value] of Object.entries(result.outfit))for(const id of Array.isArray(value)?value:[value])assert.ok(catalog[key].some(item=>item.id===id),`${preset.scene}/${preset.level}/${key}/${id}`);
  assert.equal(JSON.stringify(preset),before);assert.equal(result.reasons.length,3);assert.equal(result.outfit.accessory.length,new Set(result.outfit.accessory).size);count++;
 }assert.equal(count,288);
});
test('outdoor evening travel starts with a walking-friendly layered statement look',()=>{
 const result=create({place:'outdoor',time:'evening',dressCode:'yes'});
 assert.equal(result.outfit.top,'turtleneck');assert.equal(result.outfit.outer,'leatherjacket');assert.equal(result.outfit.shoes,'sneakers');assert.equal(result.outfit.bottom,'slacks');assert.ok(result.outfit.accessory.includes('bag'));assert.match(result.reasons.join(' '),/직접 확인/);
});
test('indoor evenings and dress-code notice adapt the initial casual choice',()=>{
 const day=create({place:'indoor',time:'day',dressCode:'no'},'bare');const notice=create({place:'indoor',time:'evening',dressCode:'yes'},'bare');
 assert.equal(day.outfit.outer,'none');assert.equal(day.outfit.shoes,'sneakers');assert.equal(notice.outfit.top,'polo');assert.equal(notice.outfit.bottom,'slacks');assert.equal(notice.outfit.outer,'cardigan');assert.equal(notice.outfit.shoes,'loafers');assert.notEqual(day.key,notice.key);
});
test('unknown dress code is described as uncertain rather than interpreted',()=>{assert.match(create({place:'outdoor',time:'day',dressCode:'unknown'}).reasons.join(' '),/일반적인 참고/)});
