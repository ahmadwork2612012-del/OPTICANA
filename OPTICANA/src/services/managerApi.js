import { resolveMediaUrl } from "../utils/mediaUrl";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const AUTH_KEY = "opticana-manager-auth";

function getSession() {
  try { const raw = window.localStorage.getItem(AUTH_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function saveSession(session) { if (session) window.localStorage.setItem(AUTH_KEY, JSON.stringify(session)); else window.localStorage.removeItem(AUTH_KEY); }
async function request(path, options = {}) {
  const session = getSession();
  const headers = { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined });
  let data = null; try { data = await response.json(); } catch {}
  if (response.status === 401) saveSession(null);
  if (!response.ok || data?.success === false) { const error = new Error(data?.error?.message || data?.message || "تعذر تنفيذ العملية"); error.status=response.status; error.code=data?.error?.code||"API_ERROR"; throw error; }
  return data?.data ?? null;
}
export async function managerLogin(email,password){
  const normalizedEmail=String(email||"").trim().toLowerCase();
  if(normalizedEmail!=="ahmadwork2612012@gmail.com") throw new Error("هذا الحساب غير مصرح له بدخول إدارة المتجر.");
  const result=await request("/auth/login",{method:"POST",body:{email:normalizedEmail,password}});
  if(!["ADMIN","SUPER_ADMIN"].includes(result?.user?.role)) throw new Error("هذا الحساب لا يملك صلاحية إدارة المنتجات.");
  saveSession({token:result.token,user:result.user}); return result.user;
}
export function managerLogout(){saveSession(null)}
export function getManagerSession(){return getSession()}
export async function getManagerProducts(){const products=await request("/admin/products");return Array.isArray(products)?products.map(normalizeProduct):[]}
export async function getManagerCategories(){const categories=await request("/categories/admin");return Array.isArray(categories)?categories:[]}
export async function createManagerProduct(product){return normalizeProduct(await request("/admin/products",{method:"POST",body:buildPayload(product,true)}))}
export async function updateManagerProduct(id,product){return normalizeProduct(await request(`/admin/products/${encodeURIComponent(id)}`,{method:"PATCH",body:buildPayload(product,false)}))}
export async function archiveManagerProduct(id){return request(`/admin/products/${encodeURIComponent(id)}`,{method:"DELETE"})}
export async function createManagerCategory(category){return request("/categories/admin",{method:"POST",body:category})}
export async function deleteManagerCategory(id){return request(`/categories/admin/${encodeURIComponent(id)}`,{method:"DELETE"})}
export async function getManagerReviews(){const reviews=await request("/reviews/admin");return Array.isArray(reviews)?reviews:[]}
export async function updateManagerReviewStatus(id,status,featured=false){return request(`/reviews/admin/${encodeURIComponent(id)}/status`,{method:"PATCH",body:{status,featured}})}
export async function deleteManagerReview(id){return request(`/reviews/admin/${encodeURIComponent(id)}`,{method:"DELETE"})}
export async function getManagerStoreData(){return request("/admin/manager/store-data")}
export async function updateManagerStoreSetting(key,value){return request(`/admin/manager/settings/${encodeURIComponent(key)}`,{method:"PUT",body:{value}})}
export async function updateManagerStoreContent(key,value){return request(`/admin/manager/content/${encodeURIComponent(key)}`,{method:"PUT",body:{value}})}
export async function getManagerRecentOrders(range="24h"){const params=new URLSearchParams({range});const orders=await request(`/admin/manager/orders?${params.toString()}`);return Array.isArray(orders)?orders:[]}
function slugify(value=""){const slug=String(value).trim().toLowerCase().replace(/[^\u0600-\u06FF\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");return slug||`product-${Date.now()}`}
function buildPayload(product,isCreate){
  const images=(Array.isArray(product.images)?product.images:[]).filter(Boolean).map((image,index)=>({url:typeof image==="string"?image:image.url,altText:(typeof image==="object"?image.altText:"")||product.name||"OPTICANA",isPrimary:index===0,sortOrder:index}));
  const payload={sku:String(product.sku||"").trim(),name:String(product.name||"").trim(),nameEn:String(product.nameEn||"").trim()||undefined,slug:slugify(product.slug||product.name),description:String(product.description||"").trim(),descriptionEn:String(product.descriptionEn||"").trim()||undefined,price:Number(product.price),oldPrice:product.oldPrice===""||product.oldPrice==null?null:Number(product.oldPrice),purchasePrice:product.purchasePrice===""||product.purchasePrice==null?null:Number(product.purchasePrice),reorderLevel:Math.max(0,Math.floor(Number(product.reorderLevel||0))),color:String(product.color||"").trim()||undefined,material:String(product.material||"").trim()||undefined,size:String(product.size||"").trim()||undefined,status:product.publish?"PUBLISHED":"DRAFT",showOnStore:product.publish===true,featured:product.featured===true,isNew:product.isNew===true,isSale:product.isSale===true,categoryId:product.categoryId||null,images};
  if(isCreate) payload.initialStock=Math.max(0,Math.floor(Number(product.initialStock||0))); return payload;
}
function normalizeProduct(product){if(!product)return null;return {...product,image:resolveMediaUrl(product.image||product.images?.[0]?.url||null),images:Array.isArray(product.images)?product.images.map(image=>({...image,url:resolveMediaUrl(image.url)})):[],price:Number(product.price||0),stock:Number(product.stock||0),oldPrice:product.oldPrice==null?null:Number(product.oldPrice),purchasePrice:product.purchasePrice==null?null:Number(product.purchasePrice)}}
