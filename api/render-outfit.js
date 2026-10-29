import { createGateway, generateImage } from 'ai';
import { z } from 'zod';
import { isAllowedOrigin } from './local-preview.js';
import catalog from '../dress-code-studio/wardrobe-catalog.json' with { type:'json' };

export const maxDuration=120;
const accessoryId=z.enum(catalog.accessory.map(item=>item.id));
const accessorySelection=z.union([accessoryId,z.array(accessoryId).max(catalog.accessory.length).refine(ids=>new Set(ids).size===ids.length)]);
export const outfitSchema=z.object({
 gender:z.enum(['female','male']),
 look:z.object(Object.fromEntries(Object.entries(catalog).map(([key,items])=>[key,key==='accessory'?accessorySelection:z.enum(items.map(item=>item.id))]))).strict(),
}).strict();
const send=(res,status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data))};
export function buildPhotoPrompt({gender,look}){
 const garments=Object.entries(look).flatMap(([key,value])=>{const ids=key==='accessory'?(Array.isArray(value)?value:[value]):[value];if(!ids.length)return ['accessories: none. Do not add any accessories.'];return ids.map(id=>{const item=catalog[key].find(item=>item.id===id);return `${key}: ${item.en} (${item.name}), color ${item.color}`})}).join('\n');
 return `Produce one photorealistic full-body fashion studio photograph of an adult Korean ${gender==='male'?'man with short natural dark hair':'woman with long natural dark brown hair'}, about 28 years old. Natural face, healthy realistic human proportions. Standing relaxed with arms at sides. Plain warm light-beige studio backdrop, soft diffused natural light, subtle floor shadow. Head and ALL footwear fully visible with 8% margins, portrait 2:3 composition. Premium ecommerce fashion photography with genuine-looking cloth texture, seams, folds and skin detail. NOT illustration, drawing, cartoon, mannequin, collage, split screen, text, labels or watermark. Dress the model in EXACTLY these selected garments and ALL selected accessories; change silhouettes, necklines, sleeve lengths, hem lengths and details, not just colors:\n${garments}\nIf outer is none, do NOT add a jacket, coat or cardigan. A skirt must visibly be a skirt with the specified length and pleats, not trousers. A hoodie needs a hood, drawstrings and kangaroo pocket. A sleeveless top must not gain sleeves. Button-front knit is sleeveless ivory knit. Blue striped shirt needs distinct vertical stripes and collar. Keep visible clothing construction true to the selected garments. Boots must have the specified ankle or knee-high height. Include every selected accessory together, and do not add unselected accessories. Do not replace clothes based on the model's gender. Wear layers naturally; all garments and footwear should be visible. These are fictional adult catalog models.`;
}
export function createRenderHandler({generate=generateImage,getEnv=()=>process.env,allowLocalPreview=false}={}){
 const cache=new Map(),pending=new Map(),limits=new Map();
 return async function renderOutfit(req,res){
  const env=getEnv(),configured=Boolean(env.AI_GATEWAY_API_KEY);
  if(req.method==='GET')return send(res,200,{configured});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return send(res,405,{error:'실사 미리보기는 POST 요청으로 이용해 주세요.'})}
  if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'선택한 의상을 다시 확인해 주세요.'});
  if(req.headers.origin&&!isAllowedOrigin(req.headers.origin,req.headers.host,allowLocalPreview))return send(res,403,{error:'이 사이트에서 미리보기를 요청해 주세요.'});
  if(!configured)return send(res,503,{error:'실사 착장 생성이 아직 연결되지 않았어요. 기본 남성·여성 사진과 옷 선택은 사용할 수 있어요.'});
  try{
   if(Number(req.headers['content-length'])>8192)return send(res,413,{error:'요청 데이터가 너무 커요.'});
   let body=req.body;
   if(body===undefined){const chunks=[];let size=0;for await(const chunk of req){size+=Buffer.byteLength(chunk);if(size>8192)return send(res,413,{error:'요청 데이터가 너무 커요.'});chunks.push(Buffer.from(chunk))}body=Buffer.concat(chunks).toString('utf8')}
   if(typeof body==='string'){if(Buffer.byteLength(body)>8192)return send(res,413,{error:'요청 데이터가 너무 커요.'});body=JSON.parse(body)}
   const parsed=outfitSchema.safeParse(body);if(!parsed.success)return send(res,400,{error:'모델과 의상 옵션을 다시 선택해 주세요.'});
   const input=parsed.data,modelId=env.OUTFIT_IMAGE_MODEL||'openai/gpt-image-2.5-sunburst';
   const key=JSON.stringify([modelId,input.gender,...Object.keys(catalog).map(key=>key==='accessory'?[...(Array.isArray(input.look.accessory)?input.look.accessory:[input.look.accessory])].sort():input.look[key])]);
   if(cache.has(key))return send(res,200,{image:cache.get(key),gender:input.gender,look:input.look});
   if(pending.has(key))return send(res,200,{image:await pending.get(key),gender:input.gender,look:input.look});
   const now=Date.now();for(const [ip,entry] of limits)if(entry.until<=now)limits.delete(ip);
   const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0].trim();const entry=limits.get(ip)||{count:0,until:now+60000};
   if(entry.count>=4||pending.size>=2||(!limits.has(ip)&&limits.size>=5000)){res.setHeader('Retry-After','60');return send(res,429,{error:'실사 사진을 만들고 있어요. 잠시 후 다시 시도해 주세요.'})}
   entry.count++;limits.set(ip,entry);
   const task=(async()=>{
    const gateway=createGateway({apiKey:env.AI_GATEWAY_API_KEY});
    const {image}=await generate({model:gateway.image(modelId),prompt:buildPhotoPrompt(input),size:'1024x1536',maxRetries:0,abortSignal:AbortSignal.timeout(110000)});
    if(!image||!['image/png','image/jpeg','image/webp'].includes(image.mediaType))throw Error('Invalid generated image');
    const bytes=image.uint8Array;if(!bytes?.length||bytes.length>8*1024*1024)throw Error('Invalid image size');
    const url=`data:${image.mediaType};base64,${Buffer.from(bytes).toString('base64')}`;
    if(cache.size>=6)cache.delete(cache.keys().next().value);cache.set(key,url);return url;
   })();
   pending.set(key,task);
   try{return send(res,200,{image:await task,gender:input.gender,look:input.look})}finally{pending.delete(key)}
  }catch(error){
   if([401,403].includes(error.statusCode))return send(res,503,{error:'실사 생성 인증을 확인해야 해요. 서비스 연결을 확인해 주세요.',code:'AI_AUTH_FAILED'});
   if(error.statusCode===429)return send(res,429,{error:'이미지 생성 서비스의 이용 한도에 도달했어요. 이용 한도를 확인한 뒤 다시 시도해 주세요.',code:'AI_LIMIT_REACHED'});
   if(error instanceof SyntaxError)return send(res,400,{error:'선택한 옵션을 읽지 못했어요. 다시 시도해 주세요.'});
   if(error.name==='TimeoutError'||error.name==='AbortError')return send(res,504,{error:'사진 생성 시간이 길어졌어요. 다시 시도해 주세요.'});
   console.error('Outfit photo failed:',error.name);return send(res,502,{error:'실사 사진을 만들지 못했어요. 잠시 후 다시 시도해 주세요.'});
  }
 };
}
export default createRenderHandler();
