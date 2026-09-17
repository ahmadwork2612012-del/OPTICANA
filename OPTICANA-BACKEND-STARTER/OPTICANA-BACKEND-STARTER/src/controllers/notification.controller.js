import {listNotifications,createNotification,markRead,clearRead,deleteNotification} from "../services/notification.service.js";
export async function list(req,res,next){try{res.json({success:true,data:await listNotifications(req.user.id)})}catch(e){next(e)}}
export async function create(req,res,next){try{res.status(201).json({success:true,data:await createNotification(req.body,req.body.userId||null)})}catch(e){next(e)}}
export async function read(req,res,next){try{res.json({success:true,data:await markRead(req.params.id,req.user.id,true)})}catch(e){next(e)}}
export async function unread(req,res,next){try{res.json({success:true,data:await markRead(req.params.id,req.user.id,false)})}catch(e){next(e)}}
export async function clear(req,res,next){try{res.json({success:true,data:await clearRead(req.user.id)})}catch(e){next(e)}}

export async function remove(req,res,next){try{res.json({success:true,data:await deleteNotification(req.params.id,req.user.id)})}catch(e){next(e)}}
