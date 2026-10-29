import { defineConfig, loadEnv } from 'vite';
import { cpSync, writeFileSync } from 'node:fs';
import { createAnalyzeHandler } from './api/analyze-outfit.js';
import { createRenderHandler } from './api/render-outfit.js';
import { isLocalPreviewOrigin } from './api/local-preview.js';

export default defineConfig(({ mode }) => {
 const env=loadEnv(mode,process.cwd(),'');
 const clientConfig=()=>`window.StyleAIConfig=${JSON.stringify({enabled:Boolean((process.env.AI_GATEWAY_API_KEY??env.AI_GATEWAY_API_KEY)||(process.env.VERCEL_OIDC_TOKEN??env.VERCEL_OIDC_TOKEN))})};`;
 const localHandler=createAnalyzeHandler({getEnv:()=>({...env,...process.env}),allowLocalPreview:true});
 const photoHandler=createRenderHandler({getEnv:()=>({...env,...process.env}),allowLocalPreview:true});
 const middleware=server=>{
  server.middlewares.use('/dress-code-studio/ai-config.js',(req,res)=>{res.setHeader('Content-Type','application/javascript; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(clientConfig())});
  server.middlewares.use('/api',(req,res,next)=>{
   if(isLocalPreviewOrigin(req.headers.origin)){
    res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Vary','Origin');
    if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.statusCode=204;res.end();return}
   }
   next();
  });
  server.middlewares.use('/api/analyze-outfit',(req,res)=>localHandler(req,res));
  server.middlewares.use('/api/render-outfit',(req,res)=>photoHandler(req,res));
 };
 return {
  server:{host:'127.0.0.1',port:5173,strictPort:true},
  plugins:[{
   name:'dress-code-analysis',
   configureServer:middleware,
   configurePreviewServer:middleware,
   closeBundle(){cpSync('dress-code-studio','dist/dress-code-studio',{recursive:true});cpSync('project','dist/project',{recursive:true});cpSync('plan','dist/plan',{recursive:true});writeFileSync('dist/dress-code-studio/ai-config.js',clientConfig())},
  }],
 };
});
