import {create} from "zustand";
import apiClient from "../lib/apiClient";
const useReportStore=create((set)=>({summary:null,loading:false,error:null,fetchSummary:async({from,to}={})=>{set({loading:true,error:null});try{const qs=new URLSearchParams();if(from)qs.set("from",from);if(to)qs.set("to",to);const data=await apiClient.get(`/admin/reports/summary${qs.toString()?`?${qs.toString()}`:""}`);set({summary:data,loading:false});return data}catch(e){set({loading:false,error:e});throw e}}}));
export default useReportStore;
