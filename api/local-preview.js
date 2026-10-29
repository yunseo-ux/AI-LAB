export function isLocalPreviewOrigin(origin){
 try{const url=new URL(origin);return url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)&&url.port==='5500'}catch{return false}
}
export function isAllowedOrigin(origin,host,allowLocalPreview=false){
 try{return new URL(origin).host===host||(allowLocalPreview&&isLocalPreviewOrigin(origin))}catch{return false}
}
