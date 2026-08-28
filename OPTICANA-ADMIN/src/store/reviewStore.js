import {create} from "zustand"; import apiClient from "../lib/apiClient";
const normalize=(r)=>({...r,customerName:r?.customer?.name||r?.customerName||"عميل",productName:r?.product?.name||r?.productName||"",status:(String(r?.status||"PENDING").toUpperCase()==="REJECTED"?"hidden":String(r?.status||"PENDING").toLowerCase()),featured:r?.featured===true,rating:Number(r?.rating||0)});
const useReviewStore=create((set,get)=>({
 reviews:[],loading:false,error:null,
 fetchReviews:async()=>{set({loading:true,error:null});try{const data=await apiClient.get("/reviews/admin");const reviews=(Array.isArray(data)?data:[]).map(normalize);set({reviews,loading:false});return reviews}catch(e){set({loading:false,error:e});throw e}},
 addReview:async(review)=>{const data=await apiClient.post("/reviews",review);const item=normalize(data);set(s=>({reviews:[item,...s.reviews]}));return item},
 updateReview:async(id,updates)=>{const data=await apiClient.patch(`/reviews/admin/${id}/status`,{status:(String(updates.status||"PENDING").toLowerCase()==="hidden"?"REJECTED":String(updates.status||"PENDING").toUpperCase()),featured:updates.featured});const item=normalize(data);set(s=>({reviews:s.reviews.map(x=>x.id===id?item:x)}));return item},
 deleteReview:async(id)=>{await apiClient.delete(`/reviews/admin/${id}`);set(s=>({reviews:s.reviews.filter(x=>x.id!==id)}));},
 approveReview:(id)=>get().updateReview(id,{status:"approved"}),
 hideReview:(id)=>get().updateReview(id,{status:"rejected"}),
 toggleFeatured:(id)=>{const item=get().reviews.find(x=>x.id===id);return item?get().updateReview(id,{status:item.status,featured:!item.featured}):null},
 clearReviews:()=>set({reviews:[]}),
}));
export default useReviewStore;
