import prisma from "../lib/prisma.js";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function serialize(m){return m}

function resolveStoredFile(url) {
  const value = String(url || "");
  const base = String(process.env.MEDIA_BASE_URL || "/uploads").replace(/\/$/, "");
  if (!value.startsWith(`${base}/`)) return null;
  const filename = path.basename(value);
  const configuredDir = process.env.MEDIA_STORAGE_DIR || path.join(process.cwd(), "uploads");
  return path.join(path.resolve(configuredDir), filename);
}

export async function persistDataUrl(value, mimeType="image/jpeg"){
  if(!String(value||"").startsWith("data:")) return value;
  const match=String(value).match(/^data:([^;]+);base64,(.+)$/s);
  if(!match) throw Object.assign(new Error("Invalid data URL"),{statusCode:400,code:"INVALID_MEDIA"});
  const mime=match[1];
  const ext=(mime.split("/")[1]||"bin").replace(/[^a-z0-9]/gi,"").toLowerCase();
  const decodedSize = Math.floor((match[2].length * 3) / 4);
  if (decodedSize > 10 * 1024 * 1024) throw Object.assign(new Error("Media file is too large"),{statusCode:413,code:"MEDIA_TOO_LARGE"});
  const configuredDir = process.env.MEDIA_STORAGE_DIR || path.join(process.cwd(), "uploads");
  const dir=path.resolve(configuredDir);
  await fs.mkdir(dir,{recursive:true});
  const filename=`${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(dir,filename),Buffer.from(match[2],"base64"));
  const publicBase = String(process.env.MEDIA_BASE_URL || "/uploads").replace(/\/$/, "");
  return `${publicBase}/${filename}`;
}

export async function persistNestedMedia(value, mimeType="image/jpeg") {
  if (typeof value === "string") return persistDataUrl(value, mimeType);
  if (Array.isArray(value)) return Promise.all(value.map((item) => persistNestedMedia(item, mimeType)));
  if (value && typeof value === "object") {
    const entries = await Promise.all(Object.entries(value).map(async ([key, child]) => [key, await persistNestedMedia(child, mimeType)]));
    return Object.fromEntries(entries);
  }
  return value;
}

export async function listMedia({folder,entityType,entityId}={}) {
  return (await prisma.media.findMany({where:{...(folder?{folder}:{}),...(entityType?{entityType}:{}),...(entityId?{entityId}:{})},orderBy:{createdAt:"desc"},take:500})).map(serialize);
}
export async function createMedia(input,userId){
  let url=String(input.url||"").trim();
  if(!url) throw Object.assign(new Error("Media URL is required"),{statusCode:400,code:"MEDIA_URL_REQUIRED"});
  url=await persistDataUrl(url,input.mimeType);
  return serialize(await prisma.media.create({data:{name:String(input.name||"صورة"),url,mimeType:input.mimeType||null,size:Math.max(0,Number(input.size||0)),folder:String(input.folder||"general"),entityType:input.entityType||null,entityId:input.entityId||null,isPrimary:Boolean(input.isPrimary),uploadedById:userId||null}}));
}
export async function updateMedia(id,input){
  const current = await prisma.media.findUnique({where:{id}});
  if(!current) throw Object.assign(new Error("Media not found"),{statusCode:404,code:"MEDIA_NOT_FOUND"});
  const data={
    ...(input.name!==undefined?{name:String(input.name)}:{}),
    ...(input.folder!==undefined?{folder:String(input.folder)}:{}),
    ...(input.entityType!==undefined?{entityType:input.entityType||null}:{}),
    ...(input.entityId!==undefined?{entityId:input.entityId||null}:{}),
    ...(input.isPrimary!==undefined?{isPrimary:Boolean(input.isPrimary)}:{}),
  };
  if(input.url!==undefined){
    const nextUrl=await persistDataUrl(String(input.url||""),input.mimeType||current.mimeType||"image/jpeg");
    if(!nextUrl) throw Object.assign(new Error("Media URL is required"),{statusCode:400,code:"MEDIA_URL_REQUIRED"});
    data.url=nextUrl;
    if(input.mimeType!==undefined) data.mimeType=input.mimeType||null;
    if(input.size!==undefined) data.size=Math.max(0,Number(input.size||0));
  }
  const updated=await prisma.media.update({where:{id},data});
  const previousFile = resolveStoredFile(current.url);
  if(previousFile && current.url!==updated.url){
    try{await fs.unlink(previousFile);}catch{}
  }
  return serialize(updated);
}
export async function deleteMedia(id){
  const item=await prisma.media.findUnique({where:{id}});
  if(!item) throw Object.assign(new Error("Media not found"),{statusCode:404,code:"MEDIA_NOT_FOUND"});
  const storedFile = resolveStoredFile(item.url);
  if(storedFile) {
    try{await fs.unlink(storedFile);}catch{}
  }
  await prisma.media.delete({where:{id}}); return {id};
}
export async function setPrimary(id){
  const item=await prisma.media.findUnique({where:{id}});
  if(!item) throw Object.assign(new Error("Media not found"),{statusCode:404,code:"MEDIA_NOT_FOUND"});
  return prisma.$transaction(async tx=>{
    if(item.entityType&&item.entityId!==null) await tx.media.updateMany({where:{entityType:item.entityType,entityId:item.entityId},data:{isPrimary:false}});
    return serialize(await tx.media.update({where:{id},data:{isPrimary:true}}));
  });
}
