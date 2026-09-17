import prisma from "../lib/prisma.js";
import { recordPayment, reversePayment } from "./payment.service.js";
import { writeAudit } from "./audit.service.js";

const METHODS = new Set(["CASH","WHATSAPP","CARD","ONLINE","OTHER"]);

function error(message, code, statusCode=400) {
  const e = new Error(message); e.code=code; e.statusCode=statusCode; return e;
}

function normalize(data) {
  const amount=Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw error("Expense amount must be greater than zero","INVALID_AMOUNT");
  const title=String(data.title ?? data.description ?? "").trim();
  const category=String(data.category||"general").trim();
  if (!title) throw error("Expense title is required","TITLE_REQUIRED");
  const paymentMethod=String(data.paymentMethod||"CASH").toUpperCase();
  if (!METHODS.has(paymentMethod)) throw error("Invalid payment method","INVALID_PAYMENT_METHOD");
  return { title, category, amount: Math.round(amount*100)/100, paymentMethod, notes:data.notes?String(data.notes).trim():null, source:String(data.source||"admin").trim() };
}

function serialize(e) {
  return { ...e, description:e.title, amount:Number(e.amount), payments: e.payments?.map(p=>({id:p.id,amount:Number(p.amount),method:p.method,type:p.type,reversedPaymentId:p.reversedPaymentId,createdAt:p.createdAt})) || [] };
}

async function nextNumber(tx) {
  const prefix=`EXP-${new Date().toISOString().slice(0,10).replaceAll("-","")}-`;
  const last=await tx.expense.findFirst({where:{expenseNumber:{startsWith:prefix}},orderBy:{expenseNumber:"desc"},select:{expenseNumber:true}});
  return `${prefix}${String(Number(last?.expenseNumber?.split("-").pop()||0)+1).padStart(3,"0")}`;
}

export async function listExpenses() {
  return (await prisma.expense.findMany({include:{payments:true},orderBy:{createdAt:"desc"},take:500})).map(serialize);
}

export async function getExpense(id) {
  const e=await prisma.expense.findUnique({where:{id},include:{payments:true}});
  return serialize(e);
}

export async function createExpense(input, userId=null) {
  const data=normalize(input);
  return prisma.$transaction(async tx=>{
    let created=null;
    for(let attempt=0;attempt<5;attempt++){
      try {
        created=await tx.expense.create({data:{...data,expenseNumber:await nextNumber(tx)}});
        break;
      } catch(e) {
        if(e?.code!=="P2002" || attempt===4) throw e;
      }
    }
    if (data.amount>0) {
      await recordPayment({tx,amount:data.amount,type:"EXPENSE_PAYMENT",method:data.paymentMethod,source:data.source,expenseId:created.id,createdById:userId,note:`Expense ${created.expenseNumber}`});
    }
    const after=await tx.expense.findUnique({where:{id:created.id},include:{payments:true}});
    await tx.notification.create({data:{title:"مصروف جديد",message:`تم تسجيل مصروف ${after.title} بقيمة ${Number(after.amount).toFixed(2)}`,type:"expense",entityType:"expense",entityId:after.id,source:"system"}});
    await writeAudit({tx,userId,action:"CREATE",entityType:"EXPENSE",entityId:created.id,after:after});
    return serialize(after);
  });
}

export async function updateExpense(id,input,userId=null) {
  const before=await prisma.expense.findUnique({where:{id},include:{payments:true}});
  if(!before) throw error("Expense not found","EXPENSE_NOT_FOUND",404);
  const patch=normalize({...before,...input});
  if(Number(patch.amount)!==Number(before.amount)) throw error("Paid expenses cannot change amount; create an adjustment instead","EXPENSE_AMOUNT_IMMUTABLE",409);
  const after=await prisma.expense.update({where:{id},data:patch,include:{payments:true}});
  await writeAudit({userId,action:"UPDATE",entityType:"EXPENSE",entityId:id,before,after});
  return serialize(after);
}

export async function deleteExpense(id,userId=null) {
  return prisma.$transaction(async tx=>{
    const before=await tx.expense.findUnique({where:{id},include:{payments:true}});
    if(!before) throw error("Expense not found","EXPENSE_NOT_FOUND",404);
    for(const p of before.payments.filter(p=>Number(p.amount)>0 && !p.reversedPaymentId)) {
      await reversePayment({tx,originalPaymentId:p.id,createdById:userId,source:"admin",note:`Delete expense ${before.expenseNumber}`});
    }
    await tx.expense.delete({where:{id}});
    await writeAudit({tx,userId,action:"DELETE",entityType:"EXPENSE",entityId:id,before});
    return {id};
  });
}
