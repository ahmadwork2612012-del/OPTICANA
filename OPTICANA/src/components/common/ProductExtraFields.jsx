import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductById } from "../../services/productService";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductExtraFields(){
  const { id } = useParams();
  const { t } = useLanguage();
  const [fields,setFields]=useState([]);
  useEffect(()=>{ let active=true; getProductById(id).then(p=>{ if(active) setFields(Array.isArray(p?.extraFields)?p.extraFields:[]); }).catch(()=>{}); return()=>{active=false}; },[id]);
  if(!fields.length)return null;
  return <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6">
    <div className="rounded-[28px] border border-[#dfe6dc] bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-black text-[#30382e]">{t("مواصفات إضافية")}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(field=><div key={field.id} className="rounded-2xl border border-[#e2e8df] bg-[#f7f9f5] p-4"><p className="text-xs font-black text-[#75806f]">{field.label}</p><p className="mt-2 text-sm font-black text-[#30382e]">{field.value}</p></div>)}
      </div>
    </div>
  </section>;
}
