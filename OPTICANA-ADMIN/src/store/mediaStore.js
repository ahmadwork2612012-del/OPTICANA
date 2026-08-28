import {create} from "zustand"; import apiClient from "../lib/apiClient";
export const MEDIA_FOLDERS=["products","repairs","hero","about","banners","categories","general"];
const useMediaStore=create((set,get)=>({
 media:[],loading:false,error:null,
 fetchMedia:async(filters={})=>{set({loading:true,error:null});try{const q=new URLSearchParams();for(const [k,v] of Object.entries(filters)){if(v)q.set(k,v)}const d=await apiClient.get(`/admin/media${q.toString()?`?${q}`:""}`);set({media:Array.isArray(d)?d:[],loading:false});return d||[]}catch(e){set({loading:false,error:e});throw e}},
 addMedia:async(data)=>{const d=await apiClient.post("/admin/media",data);set(s=>({media:[d,...s.media]}));return d},
 updateMedia:async(id,updates)=>{const d=await apiClient.patch(`/admin/media/${id}`,updates);set(s=>({media:s.media.map(x=>x.id===id?d:x)}));return d},
 deleteMedia:async(id)=>{await apiClient.delete(`/admin/media/${id}`);set(s=>({media:s.media.filter(x=>x.id!==id)}));return id},
 deleteManyMedia:async(ids)=>{for(const id of ids) await get().deleteMedia(id)},
 getMediaByEntity:(type,id)=>get().media.filter(x=>x.entityType===type&&String(x.entityId)===String(id)),
 getMediaByFolder:(folder)=>get().media.filter(x=>x.folder===folder),
 setPrimaryMedia:async(id)=>{const d=await apiClient.patch(`/admin/media/${id}/primary`,{});set(s=>({media:s.media.map(x=>x.entityType===d.entityType&&String(x.entityId)===String(d.entityId)?{...x,isPrimary:x.id===d.id}:x)}));return d},
 clearMedia:()=>set({media:[]}),
}));
export default useMediaStore;
