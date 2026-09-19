import prisma from "../lib/prisma.js";

function serialize(n){return {...n,metadata:n.metadata||{}}}

async function ensureDueDebtNotifications(){
  const now = new Date();
  const orders = await prisma.order.findMany({
    where: {
      dueDate: { lte: now },
      remainingAmount: { gt: 0 },
      status: { not: "CANCELLED" },
      customerId: { not: null },
    },
    select: {
      id: true,
      orderNumber: true,
      remainingAmount: true,
      dueDate: true,
      customer: { select: { id: true, name: true, phone: true } },
    },
    take: 500,
  });

  for (const order of orders) {
    if (!order.customer?.name?.trim() || !order.customer?.phone?.trim()) continue;
    const notificationId = `debt-due-${order.id}`;
    try {
      await prisma.notification.create({
        data: {
          id: notificationId,
          title: "موعد سداد دين عميل",
          message: `حان موعد سداد دين ${order.customer.name} — ${Number(order.remainingAmount || 0).toLocaleString()} ج.م — هاتف: ${order.customer.phone} — الفاتورة: ${order.orderNumber}`,
          type: "debt_due",
          entityType: "order",
          entityId: order.id,
          priority: "high",
          source: "system",
          metadata: { orderNumber: order.orderNumber, customerId: order.customer.id, customerPhone: order.customer.phone, dueDate: order.dueDate },
        },
      });
    } catch (error) {
      if (error?.code !== "P2002") throw error;
    }
  }
}

export async function listNotifications(userId){
  await ensureDueDebtNotifications();
  return (await prisma.notification.findMany({where:{OR:[{userId},{userId:null}]},orderBy:{createdAt:"desc"},take:200})).map(serialize)
}
export async function createNotification(input,userId=null){return serialize(await prisma.notification.create({data:{userId:userId||null,title:String(input.title||"إشعار"),message:String(input.message||""),type:String(input.type||"info"),entityType:input.entityType||null,entityId:input.entityId||null,priority:String(input.priority||"normal"),source:String(input.source||"system"),metadata:input.metadata||{}}}))}
export async function markRead(id,userId,read=true){const n=await prisma.notification.findFirst({where:{id,OR:[{userId},{userId:null}]}});if(!n){const e=new Error("Notification not found");e.statusCode=404;e.code="NOTIFICATION_NOT_FOUND";throw e}return serialize(await prisma.notification.update({where:{id},data:{read,readAt:read?new Date():null}}))}
export async function clearRead(userId){await prisma.notification.deleteMany({where:{read:true,OR:[{userId},{userId:null}]}});return {success:true}}

export async function deleteNotification(id,userId){
  const n=await prisma.notification.findFirst({where:{id,OR:[{userId},{userId:null}]}});
  if(!n){const e=new Error("Notification not found");e.statusCode=404;e.code="NOTIFICATION_NOT_FOUND";throw e;}
  await prisma.notification.delete({where:{id}}); return {id};
}
