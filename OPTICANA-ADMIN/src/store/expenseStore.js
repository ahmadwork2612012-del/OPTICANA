import {create} from "zustand"; import apiClient from "../lib/apiClient";
const useExpenseStore=create((set)=>({
  expenses:[], loading:false,error:null,
  fetchExpenses:async()=>{set({loading:true,error:null});try{const data=await apiClient.get("/admin/expenses");set({expenses:Array.isArray(data)?data:[],loading:false});return data||[]}catch(e){set({loading:false,error:e});throw e}},
  addExpense:async(expense)=>{const data=await apiClient.post("/admin/expenses",expense);set(s=>({expenses:[data,...s.expenses]}));return data},
  updateExpense:async(id,updates)=>{const data=await apiClient.patch(`/admin/expenses/${id}`,updates);set(s=>({expenses:s.expenses.map(x=>x.id===id?data:x)}));return data},
  deleteExpense:async(id)=>{await apiClient.delete(`/admin/expenses/${id}`);set(s=>({expenses:s.expenses.filter(x=>x.id!==id)}));return id},
}));
export default useExpenseStore;
