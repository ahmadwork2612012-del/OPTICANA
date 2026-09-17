import {create} from "zustand";
import apiClient from "../lib/apiClient";

const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};
const statusMap={PENDING:"pending",CONFIRMED:"confirmed",PREPARING:"processing",READY:"shipped",COMPLETED:"completed",CANCELLED:"cancelled"};
const normalize=o=>o?({
 ...o,
 invoiceNumber:o.orderNumber||o.id,
 status:statusMap[o.status]||String(o.status||"").toLowerCase(),
 total:num(o.total), subtotal:num(o.subtotal), discount:num(o.discount),
 paidAmount:num(o.paidAmount), remainingAmount:num(o.remainingAmount),
 paymentStatus:String(o.paymentStatus||"UNPAID").toLowerCase(),
 customerId:o.customerId||o.customer?.id||null,
 customer:o.customer||null,
 source:o.source||"admin",
 items:Array.isArray(o.items)?o.items.map(i=>({...i,quantity:num(i.quantity),unitPrice:num(i.unitPrice),price:num(i.unitPrice),costPrice:num(i.costPrice),purchasePrice:num(i.costPrice),total:num(i.total)})):[],
 createdAt:o.createdAt,updatedAt:o.updatedAt
}):null;
const isSale=o=>String(o?.status||"").toUpperCase()==="COMPLETED" || o?.status==="completed";
const useSalesStore=create((set,get)=>({
 sales:[],loading:false,error:null,
 fetchSales:async()=>{set({loading:true,error:null});try{const d=await apiClient.get("/admin/orders");const sales=(Array.isArray(d)?d:[]).map(normalize).filter(isSale).filter(Boolean);set({sales,loading:false});return sales}catch(e){set({loading:false,error:e});throw e}},
 addSale:async(sale)=>{const d=await apiClient.post("/admin/orders",{customerId:sale.customerId||sale.customer?.id||null,paymentMethod:String(sale.paymentMethod||"CASH").toUpperCase(),discount:num(sale.discount),notes:sale.notes||null,source:"pos",items:(sale.items||[]).map(i=>({productId:i.productId,quantity:Number(i.quantity)}))});const item=normalize(d);set(s=>({sales:[item,...s.sales.filter(x=>x.id!==item.id)].filter(isSale)}));return item},
 updateSale:async(id)=>{const d=await apiClient.get(`/admin/orders/${id}`);const item=normalize(d);set(s=>({sales:s.sales.map(x=>x.id===id?item:x).filter(isSale)}));return item},
 getTodaySales:()=>get().sales.filter(s=>new Date(s.createdAt).toISOString().slice(0,10)===new Date().toISOString().slice(0,10)&&isSale(s)),
 getCustomerSales:(id)=>get().sales.filter(s=>s.customerId===id&&isSale(s)),
 getCustomerSalesTotal:(id)=>get().getCustomerSales(id).reduce((t,s)=>t+s.total,0),
 getCustomerPaidTotal:(id)=>get().getCustomerSales(id).reduce((t,s)=>t+s.paidAmount,0),
 getCustomerRemainingTotal:(id)=>get().getCustomerSales(id).reduce((t,s)=>t+s.remainingAmount,0),
 getUnpaidSales:()=>get().sales.filter(s=>s.remainingAmount>0&&isSale(s)),
 getCustomerUnpaidSales:(id)=>get().sales.filter(s=>s.customerId===id&&s.remainingAmount>0&&isSale(s)),
 getTotalSales:()=>get().sales.filter(isSale).reduce((t,s)=>t+s.total,0),
 clearSales:()=>set({sales:[]}),
}));
export default useSalesStore;
