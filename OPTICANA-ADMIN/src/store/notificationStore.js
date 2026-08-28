import {create} from "zustand"; import apiClient from "../lib/apiClient";
const useNotificationStore=create((set,get)=>({
 notifications:[],loading:false,error:null,
 fetchNotifications:async()=>{set({loading:true,error:null});try{const d=await apiClient.get("/admin/notifications");set({notifications:Array.isArray(d)?d:[],loading:false});return d||[]}catch(e){set({loading:false,error:e});throw e}},
 addNotification:async(n)=>{const d=await apiClient.post("/admin/notifications",n);set(s=>({notifications:[d,...s.notifications]}));return d},
 markAsRead:async(id)=>{const d=await apiClient.patch(`/admin/notifications/${id}/read`,{});set(s=>({notifications:s.notifications.map(x=>x.id===id?d:x)}));return d},
 markAsUnread:async(id)=>{const d=await apiClient.patch(`/admin/notifications/${id}/unread`,{});set(s=>({notifications:s.notifications.map(x=>x.id===id?d:x)}));return d},
 markAllAsRead:async()=>{const current=get().notifications.filter(x=>!x.read);for(const n of current) await get().markAsRead(n.id)},
 deleteNotification:async(id)=>{await apiClient.delete(`/admin/notifications/${id}`);set(s=>({notifications:s.notifications.filter(x=>x.id!==id)}));},
 clearReadNotifications:async()=>{await apiClient.delete("/admin/notifications/read");set(s=>({notifications:s.notifications.filter(x=>!x.read)}))},
 getUnreadCount:()=>get().notifications.filter(x=>!x.read).length,
 getRecentNotifications:()=>[...get().notifications].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)),
 getAllNotifications:()=>[...get().notifications].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)),
 clearNotifications:()=>set({notifications:[]}),
}));
export default useNotificationStore;
