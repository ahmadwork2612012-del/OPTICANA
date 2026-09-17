import {create} from "zustand"; import apiClient from "../lib/apiClient";
const normalizeStatus=(s)=>({RECEIVED:"pending",PENDING:"pending",DIAGNOSING:"diagnosing",WAITING:"waiting",IN_PROGRESS:"repairing",READY:"ready",DELIVERED:"completed",COMPLETED:"completed",CANCELLED:"cancelled"})[String(s||"PENDING").toUpperCase()]||String(s||"pending").toLowerCase();
const normalize=(r)=>({...r,status:normalizeStatus(r?.status),estimatedCost:Number(r?.estimatedCost||0),finalCost:Number(r?.finalCost||0),paidAmount:Number(r?.paidAmount||0),cost:Number(r?.cost ?? r?.finalCost ?? r?.estimatedCost ?? 0),remainingAmount:Number(r?.remainingAmount||0),itemType:r?.itemType||"",problem:r?.problem||r?.title||"",diagnosis:r?.diagnosis||"",receivedDate:r?.receivedDate||r?.createdAt||null,dueDate:r?.dueDate||null});
const toPayload=(d)=>({...d,status:d.status?({"pending":"PENDING","diagnosing":"DIAGNOSING","waiting":"WAITING","repairing":"IN_PROGRESS","ready":"READY","completed":"DELIVERED","cancelled":"CANCELLED"}[d.status]||String(d.status).toUpperCase()):undefined});
const useRepairStore=create((set)=>({
 repairs:[], loading:false,error:null,
 fetchRepairs:async()=>{set({loading:true,error:null});try{const data=await apiClient.get("/admin/repairs");const rows=(Array.isArray(data)?data:[]).map(normalize);set({repairs:rows,loading:false});return rows}catch(e){set({loading:false,error:e});throw e}},
 addRepair:async(data)=>{const item=normalize(await apiClient.post("/admin/repairs",toPayload(data)));set(s=>({repairs:[item,...s.repairs]}));return item},
 updateRepair:async(id,data)=>{const item=normalize(await apiClient.patch(`/admin/repairs/${id}`,toPayload(data)));set(s=>({repairs:s.repairs.map(x=>x.id===id?item:x)}));return item},
 deleteRepair:async(id)=>{await apiClient.delete(`/admin/repairs/${id}`);set(s=>({repairs:s.repairs.filter(x=>x.id!==id)}));return id},
 clearRepairs:()=>set({repairs:[]}),
}));
export default useRepairStore;
