import { createServer } from 'vite';
export default async function setup(){
 const originals={AI_GATEWAY_API_KEY:process.env.AI_GATEWAY_API_KEY,VERCEL_OIDC_TOKEN:process.env.VERCEL_OIDC_TOKEN};
 // Browser tests must never spend real generation credits.
 process.env.AI_GATEWAY_API_KEY='';process.env.VERCEL_OIDC_TOKEN='';
 const server=await createServer({server:{host:'127.0.0.1',port:4173,strictPort:true}});
 await server.listen();
 return async()=>{await server.close();for(const [key,value] of Object.entries(originals)){if(value===undefined)delete process.env[key];else process.env[key]=value}};
}
