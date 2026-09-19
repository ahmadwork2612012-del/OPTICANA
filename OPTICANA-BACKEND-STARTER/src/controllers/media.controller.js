import {listMedia,createMedia,updateMedia,deleteMedia,setPrimary} from "../services/media.service.js";
export async function list(req,res,next){try{res.json({success:true,data:await listMedia(req.query)})}catch(e){next(e)}}
export async function create(req,res,next){try{res.status(201).json({success:true,data:await createMedia(req.body,req.user.id)})}catch(e){next(e)}}
export async function update(req,res,next){try{res.json({success:true,data:await updateMedia(req.params.id,req.body)})}catch(e){next(e)}}
export async function remove(req,res,next){try{res.json({success:true,data:await deleteMedia(req.params.id)})}catch(e){next(e)}}
export async function primary(req,res,next){try{res.json({success:true,data:await setPrimary(req.params.id)})}catch(e){next(e)}}
