import prisma from "../lib/prisma.js";
function serialize(n){return {...n,metadata:n.metadata||{}}}
export async function listNotifications(userId){return (await prisma.notification.findMany({where:{OR:[{userId},{userId:null}]},orderBy:{createdAt:"desc"},take:200})).map(serialize)}
export async function createNotification(input,userId=null){return serialize(await prisma.notification.create({data:{userId:userId||null,title:String(input.title||"إشعار"),message:String(input.message||""),type:String(input.type||"info"),entityType:input.entityType||null,entityId:input.entityId||null,priority:String(input.priority||"normal"),source:String(input.source||"system"),metadata:input.metadata||{}}}))}
export async function markRead(id,userId,read=true){const n=await prisma.notification.findFirst({where:{id,OR:[{userId},{userId:null}]}});if(!n){const e=new Error("Notification not found");e.statusCode=404;e.code="NOTIFICATION_NOT_FOUND";throw e}return serialize(await prisma.notification.update({where:{id},data:{read,readAt:read?new Date():null}}))}
export async function clearRead(userId){await prisma.notification.deleteMany({where:{read:true,OR:[{userId},{userId:null}]}});return {success:true}}

export async function deleteNotification(id,userId){
  const n=await prisma.notification.findFirst({where:{id,OR:[{userId},{userId:null}]}});
  if(!n){const e=new Error("Notification not found");e.statusCode=404;e.code="NOTIFICATION_NOT_FOUND";throw e;}
  await prisma.notification.delete({where:{id}}); return {id};
}
