import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore";

function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const login =
    useAuthStore(
      (state) => state.login
    );

  const isLoading =
    useAuthStore(
      (state) => state.isLoading
    );

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(true);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error(
        "أدخل البريد الإلكتروني"
      );
      return;
    }

    if (!password) {
      toast.error(
        "أدخل كلمة المرور"
      );
      return;
    }

    const result =
      await login(
        email,
        password,
        rememberMe
      );

    if (!result.success) {
      toast.error(
        result.message
      );
      return;
    }

    toast.success(
      "تم تسجيل الدخول بنجاح"
    );

    const destination =
      location.state?.from || "/";

    navigate(
      destination,
      { replace: true }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

          {/* BRAND */}

          <div className="hidden min-h-[680px] flex-col justify-between bg-blue-700 p-10 text-white lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-blue-700">
                  O
                </div>

                <div>
                  <p className="text-xl font-black">
                    OPTICANA
                  </p>

                  <p className="text-xs text-blue-100">
                    نظام الإدارة
                  </p>
                </div>
              </div>

              <div className="mt-20 max-w-md">
                <p className="text-sm font-bold text-blue-100">
                  منصة الإدارة
                </p>

                <h1 className="mt-3 text-5xl font-black leading-tight">
                    سجل الدخول
                  <br />
                  
                </h1>

                <p className="mt-6 leading-7 text-blue-100">
                  إدارة المنتجات والمبيعات
                  والمخزون والعملاء
                  والمحل من مكان واحد.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-blue-100">
              <ShieldCheck size={18} />
              بيئة إدارة آمنة
            </div>
          </div>

          {/* FORM */}

          <div className="flex min-h-[680px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">

              <div className="mb-8 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-lg font-black text-white">
                    O
                  </div>

                  <div>
                    <p className="font-black text-slate-900">
                      OPTICANA
                    </p>

                    <p className="text-xs text-slate-400">
                      نظام الإدارة
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm font-bold text-blue-700">
                مرحبًا بعودتك
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                تسجيل الدخول
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                سجل الدخول للوصول إلى لوحة إدارة OPTICANA.
              </p>

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-8 space-y-5"
              >

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    البريد الإلكتروني
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                    <Mail
                      size={18}
                      className="text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target
                            .value
                        )
                      }
                      placeholder="admin@opticana.local"
                      className="w-full outline-none"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    كلمة المرور
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
                    <LockKeyhole
                      size={18}
                      className="text-slate-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target
                            .value
                        )
                      }
                      placeholder="••••••••"
                      className="w-full outline-none"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={
                        rememberMe
                      }
                      onChange={(event) =>
                        setRememberMe(
                          event.target
                            .checked
                        )
                      }
                      className="h-4 w-4 accent-blue-700"
                    />

                    تذكرني
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-bold text-blue-700 hover:text-blue-800"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3.5 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
                <p className="font-black text-slate-700">
                  حساب Frontend التجريبي
                </p>

                <p>
                  البريد:{" "}
                  admin@opticana.local
                </p>

                <p>
                  كلمة المرور:{" "}
                  Admin@12345
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;