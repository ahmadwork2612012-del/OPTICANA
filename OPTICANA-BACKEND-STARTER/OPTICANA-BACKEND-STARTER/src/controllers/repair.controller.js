import {listRepairs,getRepair,createRepair,updateRepair,deleteRepair} from "../services/repair.service.js";
export async function adminListRepairs(req,res,next){try{res.json({success:true,data:await listRepairs()})}catch(e){next(e)}}
export async function adminGetRepair(req,res,next){try{const data=await getRepair(req.params.id);if(!data){const e=new Error("Repair not found");e.statusCode=404;e.code="REPAIR_NOT_FOUND";throw e}res.json({success:true,data})}catch(e){next(e)}}
export async function adminCreateRepair(req,res,next){try{res.status(201).json({success:true,data:await createRepair(req.body,req.user.id)})}catch(e){next(e)}}
export async function adminUpdateRepair(req,res,next){try{res.json({success:true,data:await updateRepair(req.params.id,req.body,req.user.id)})}catch(e){next(e)}}
export async function adminDeleteRepair(req,res,next){try{res.json({success:true,data:await deleteRepair(req.params.id,req.user.id)})}catch(e){next(e)}}
