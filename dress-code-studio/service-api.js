(() => {
 const localPreview=location.protocol==='http:'&&['127.0.0.1','localhost'].includes(location.hostname)&&location.port==='5500';
 const base=localPreview?'http://127.0.0.1:5173':'';
 const enabled=window.StyleAIConfig?.enabled===true;
 const unavailableMessage='현재 지원되지 않는 기능입니다.';
 let available=false,checked=!enabled,checkTask;
 function disable(){available=false;checked=true;window.dispatchEvent(new CustomEvent('style-ai-status',{detail:{available:false}}))}
 async function isAvailable(){
  if(checked)return available;
  return checkTask??=fetch(base+'/api/render-outfit',{signal:AbortSignal.timeout(3000)}).then(async response=>{
   if(!response.ok)return false;
   const data=await response.json();return data.configured===true;
  }).catch(()=>false).then(value=>{available=value;checked=true;window.dispatchEvent(new CustomEvent('style-ai-status',{detail:{available}}));return available});
 }
 const disabledResponse=()=>new Response(JSON.stringify({configured:false,error:unavailableMessage,code:'AI_DISABLED'}),{status:503,headers:{'Content-Type':'application/json'}});
 async function request(path,options={}){
  const aiRequest=['/api/render-outfit','/api/analyze-outfit'].includes(path);
  if(aiRequest&&!await isAvailable())return disabledResponse();
  try{
   const response=await fetch(base+path,options);
   if(aiRequest&&(response.status>=500||[401,403,404,405,429].includes(response.status))){disable();return disabledResponse()}
   return response;
  }catch(error){
   if(error.name==='AbortError'&&options.signal?.aborted)throw error;
   if(aiRequest){disable();return disabledResponse()}
   throw error;
  }
 }
 window.StyleAPI={fetch:request,isAvailable,enabled,unavailableMessage};
})();
