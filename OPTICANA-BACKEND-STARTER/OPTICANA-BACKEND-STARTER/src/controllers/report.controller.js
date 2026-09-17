import { getReportSummary } from "../services/report.service.js";
export async function adminReportSummary(req,res,next){try{res.json({success:true,data:await getReportSummary({from:req.query.from||null,to:req.query.to||null})})}catch(e){next(e)}}
