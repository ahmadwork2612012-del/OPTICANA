const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options={}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {"Content-Type":"application/json", ...(options.headers||{})},
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data=null; try { data=await response.json(); } catch {}
  if(!response.ok || data?.success===false) {
    const e=new Error(data?.error?.message || "تعذر تنفيذ العملية");
    e.code=data?.error?.code || "API_ERROR"; throw e;
  }
  return data?.data;
}

function normalizeReview(r){
  return {
    ...r,
    customerName:r?.customer?.name || r?.customerName || "زائر المتجر",
    status:String(r?.status||"PENDING").toLowerCase(),
    featured:r?.featured===true,
    approved:String(r?.status||"").toUpperCase()==="APPROVED",
    isApproved:String(r?.status||"").toUpperCase()==="APPROVED",
    rating:Number(r?.rating||0),
    comment:r?.comment||"",
  };
}

export async function getReviews(){ return []; } // Admin uses its protected API-backed store.
export async function getApprovedReviews(){
  const rows=await request("/reviews");
  return Array.isArray(rows) ? rows.map(normalizeReview) : [];
}
export async function getProductReviews(productId){
  if(!productId) return [];
  const rows=await request(`/reviews/product/${encodeURIComponent(productId)}`);
  return Array.isArray(rows) ? rows.map(normalizeReview) : [];
}
export async function addReview(data){
  const review=await request("/reviews",{method:"POST",body:{
    productId:data.productId,
    rating:Number(data.rating),
    comment:String(data.comment||"").trim(),
  }});
  return normalizeReview(review);
}
export async function getProductRating(productId){
  const reviews=await getProductReviews(productId);
  if(!reviews.length) return {rating:0,count:0};
  return {rating:reviews.reduce((s,r)=>s+Number(r.rating||0),0)/reviews.length,count:reviews.length};
}
export default {getReviews,getApprovedReviews,getProductReviews,addReview,getProductRating};
