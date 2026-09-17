import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  return (
    <AuthShell
      title="استعادة كلمة المرور"
      description="استعادة كلمة المرور الذاتية بالبريد الإلكتروني غير مفعّلة لأن النظام لا يحتوي مزود بريد أو خدمة رموز استعادة خارجية."
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <ShieldCheck size={25} />
        </div>

        <h2 className="mt-5 text-xl font-black text-slate-900">
          إعادة التعيين تتم من الإدارة
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          يمكن لمسؤول النظام إعادة تعيين كلمة مرور أي مستخدم من صفحة المستخدمين داخل لوحة الإدارة. لن يتم عرض رسالة نجاح وهمية أو إرسال رابط غير موجود.
        </p>

        <Link
          to="/login"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white hover:bg-blue-800"
        >
          <ArrowRight size={16} />
          العودة لتسجيل الدخول
        </Link>
      </div>
    </AuthShell>
  );
}

function AuthShell({ title, description, children }) {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-lg font-black text-white">O</div>
            <div>
              <p className="font-black text-slate-900">OPTICANA</p>
              <p className="text-xs text-slate-400">نظام الإدارة</p>
            </div>
          </div>
          <p className="text-sm font-bold text-blue-700">الحساب</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
