import { listExpenses,getExpense,createExpense,updateExpense,deleteExpense } from "../services/expense.service.js";
export async function adminListExpenses(req,res,next){try{res.json({success:true,data:await listExpenses()})}catch(e){next(e)}}
export async function adminGetExpense(req,res,next){try{const data=await getExpense(req.params.id);if(!data){const e=new Error("Expense not found");e.statusCode=404;e.code="EXPENSE_NOT_FOUND";throw e}res.json({success:true,data})}catch(e){next(e)}}
export async function adminCreateExpense(req,res,next){try{res.status(201).json({success:true,data:await createExpense(req.body,req.user.id)})}catch(e){next(e)}}
export async function adminUpdateExpense(req,res,next){try{res.json({success:true,data:await updateExpense(req.params.id,req.body,req.user.id)})}catch(e){next(e)}}
export async function adminDeleteExpense(req,res,next){try{res.json({success:true,data:await deleteExpense(req.params.id,req.user.id)})}catch(e){next(e)}}
