import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <KeyRound size={26} />
          </div>
          <p className="mt-5 text-sm font-bold text-blue-700">الحساب</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">لا يوجد رمز إعادة تعيين صالح</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            هذه الصفحة لا تقبل تغيير كلمة المرور بدون رمز موثوق صادر من النظام. استخدم تغيير كلمة المرور من الملف الشخصي بعد تسجيل الدخول، أو اطلب من مسؤول النظام إعادة تعيينها من إدارة المستخدمين.
          </p>
          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-right text-sm leading-6 text-blue-900">
            <div className="flex items-center gap-2 font-black"><ShieldCheck size={17} /> الحماية مفعّلة</div>
            <p className="mt-2 text-blue-800/80">لن يتم قبول إعادة تعيين غير مرتبطة بمصادقة أو حساب إداري.</p>
          </div>
          <Link
            to="/login"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
          >
            <ArrowRight size={16} />
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
