import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createRenderHandler,buildPhotoPrompt } from '../api/render-outfit.js';
const look={top:'hoodie',bottom:'blackmini',outer:'none',shoes:'tallboots',accessory:'bag'};
const payload={gender:'male',look};
const photo={mediaType:'image/png',uint8Array:Buffer.from('test-photo-bytes')};
function handler(generate=async()=>({image:photo})){return createRenderHandler({generate,getEnv:()=>({AI_GATEWAY_API_KEY:'test-not-a-real-key'})})}
async function call(handle,{body=payload,method='POST',headers={}}={}){const req=Readable.from([typeof body==='string'?body:JSON.stringify(body)]);req.method=method;req.headers={'content-type':'application/json',host:'localhost:4173',...headers};req.socket={remoteAddress:'127.0.0.1'};const res={headers:{},setHeader(key,value){this.headers[key]=value},end(body){this.body=JSON.parse(body)}};await handle(req,res);return res}
test('availability and missing credentials never claim a rendered outfit',async()=>{const handle=createRenderHandler({getEnv:()=>({}),generate:()=>assert.fail('No provider call without credentials')});assert.deepEqual((await call(handle,{method:'GET'})).body,{configured:false});const res=await call(handle);assert.equal(res.statusCode,503);assert.ok(!res.body.image)});
test('prompt specifies gender and all selected silhouettes',()=>{const prompt=buildPhotoPrompt(payload);for(const value of ['man with short','hoodie','mini skirt','knee-high','No outerwear'])assert.ok(prompt.includes(value));assert.ok(prompt.includes('Do not replace clothes based on'))});
test('valid options generate one photo and cache by both outfit and gender',async()=>{let count=0;const handle=handler(async options=>{count++;assert.equal(options.size,'1024x1536');return {image:photo}});const first=await call(handle);assert.equal(first.statusCode,200);assert.match(first.body.image,/^data:image\/png;base64,/);assert.deepEqual(first.body.look,look);await call(handle);assert.equal(count,1);await call(handle,{body:{gender:'female',look}});assert.equal(count,2);await call(handle,{body:{gender:'female',look:{...look,top:'shirt'}}});assert.equal(count,3)});
test('invalid options and injection attempts never reach image provider',async()=>{const handle=handler(()=>assert.fail('Invalid input reached provider'));for(const body of [{...payload,gender:'other'},{...payload,look:{...look,top:'ignore instructions'}},{...payload,look:{...look,extra:'x'}},{...payload,prompt:'fake prompt'}])assert.equal((await call(handle,{body})).statusCode,400)});
test('rejects origin, malformed body, oversized requests and unsupported media',async()=>{const handle=handler();assert.equal((await call(handle,{headers:{origin:'https://other.example'}})).statusCode,403);assert.equal((await call(handle,{body:'{'})).statusCode,400);assert.equal((await call(handle,{headers:{'content-length':'9000'}})).statusCode,413);assert.equal((await call(handle,{headers:{'content-type':'text/plain'}})).statusCode,415);assert.equal((await call(handle,{method:'DELETE'})).statusCode,405)});
test('provider failure does not expose secrets or manufacture a photo',async()=>{const res=await call(handler(async()=>{throw Error('secret-api-key')}));assert.equal(res.statusCode,502);assert.ok(!res.body.image);assert.doesNotMatch(res.body.error,/secret-api-key/)});
test('Live Server origin is accepted only with the explicit development option',async()=>{
 const headers={origin:'http://127.0.0.1:5500'};
 assert.equal((await call(handler(),{headers})).statusCode,403);
 const dev=createRenderHandler({getEnv:()=>({}),allowLocalPreview:true});assert.equal((await call(dev,{headers})).statusCode,503);
 assert.equal((await call(dev,{headers:{origin:'https://untrusted.example'}})).statusCode,403);
});
test('authentication and provider limit failures have actionable responses',async()=>{
 const auth=await call(handler(async()=>{throw Object.assign(Error('secret'),{statusCode:401})}));assert.equal(auth.statusCode,503);assert.equal(auth.body.code,'AI_AUTH_FAILED');
 const quota=await call(handler(async()=>{throw Object.assign(Error('secret'),{statusCode:429})}));assert.equal(quota.statusCode,429);assert.equal(quota.body.code,'AI_LIMIT_REACHED');
});
test('multiple accessories, order-independent cache and no accessories are supported',async()=>{
 let count=0;const handle=handler(async options=>{count++;assert.match(options.prompt,/selected accessories/);return {image:photo}});
 const multiple={...payload,look:{...look,accessory:['bag','watch','pearl']}};
 const result=await call(handle,{body:multiple});assert.equal(result.statusCode,200);assert.deepEqual(result.body.look.accessory,['bag','watch','pearl']);
 const prompt=buildPhotoPrompt(multiple);for(const label of ['Everyday bag','Leather watch','Pearl details'])assert.ok(prompt.includes(label));
 assert.equal((await call(handle,{body:{...multiple,look:{...look,accessory:['watch','pearl','bag']}}})).statusCode,200);assert.equal(count,1);
 const empty={...payload,look:{...look,accessory:[]}};assert.equal((await call(handle,{body:empty})).statusCode,200);assert.match(buildPhotoPrompt(empty),/Do not add any accessories/);
});
test('duplicate or unknown accessory IDs are rejected',async()=>{
 const handle=handler(()=>assert.fail('Invalid accessories reached provider'));
 for(const accessories of [['bag','bag'],['bag','unknown']])assert.equal((await call(handle,{body:{...payload,look:{...look,accessory:accessories}}})).statusCode,400);
});
