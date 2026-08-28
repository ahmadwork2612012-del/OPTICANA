import { useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../lib/apiClient";
import useAuthStore from "../store/authStore";

const ROLES = ["STAFF", "ADMIN", "SUPER_ADMIN"];

export default function Users() {
  const currentUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const canManage =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "SUPER_ADMIN";

  const sorted = useMemo(
    () =>
      [...users].sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      ),
    [users]
  );

  const load = async () => {
    setLoading(true);

    try {
      setUsers(
        (await apiClient.get("/admin/users")) || []
      );
    } catch (e) {
      toast.error(
        e.message ||
          "تعذر تحميل المستخدمين"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      toast.error(
        "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل"
      );
      return;
    }

    try {
      const u = await apiClient.post(
        "/admin/users",
        form
      );

      setUsers((x) => [u, ...x]);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "STAFF",
      });

      toast.success(
        "تم إنشاء المستخدم"
      );
    } catch (e) {
      toast.error(
        e.message ||
          "تعذر إنشاء المستخدم"
      );
    }
  };

  const toggle = async (u) => {
    try {
      const next =
        await apiClient.patch(
          `/admin/users/${u.id}`,
          {
            isActive:
              !u.isActive,
          }
        );

      setUsers((xs) =>
        xs.map((x) =>
          x.id === u.id
            ? next
            : x
        )
      );

      toast.success(
        "تم تحديث حالة المستخدم"
      );
    } catch (e) {
      toast.error(
        e.message ||
          "تعذر تحديث المستخدم"
      );
    }
  };

  const changeRole = async (
    u,
    role
  ) => {
    try {
      const next =
        await apiClient.patch(
          `/admin/users/${u.id}`,
          { role }
        );

      setUsers((xs) =>
        xs.map((x) =>
          x.id === u.id
            ? next
            : x
        )
      );

      toast.success(
        "تم تحديث الصلاحية"
      );
    } catch (e) {
      toast.error(
        e.message ||
          "تعذر تحديث الصلاحية"
      );
    }
  };

  const resetPasswordForUser =
    async (e) => {
      e.preventDefault();

      if (
        !resetTarget ||
        resetPassword.length < 8
      ) {
        toast.error(
          "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل"
        );
        return;
      }

      setResetLoading(true);

      try {
        await apiClient.patch(
          `/admin/users/${resetTarget.id}`,
          {
            password:
              resetPassword,
          }
        );

        setResetTarget(null);
        setResetPassword("");

        toast.success(
          "تم إعادة تعيين كلمة مرور المستخدم"
        );
      } catch (e) {
        toast.error(
          e.message ||
            "تعذر إعادة تعيين كلمة المرور"
        );
      } finally {
        setResetLoading(false);
      }
    };

  if (!canManage) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center font-bold text-red-600">
        ليس لديك صلاحية إدارة المستخدمين.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
          <ShieldCheck size={15} />
          إدارة المستخدمين
        </div>

        <h1 className="text-3xl font-black text-slate-900">
          المستخدمون والصلاحيات
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          إدارة الحسابات والأدوار وحالة الوصول وكلمات المرور من قاعدة البيانات.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          onSubmit={create}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-black">
            إضافة مستخدم
          </h2>

          {[
            ["name", "text", "الاسم"],
            [
              "email",
              "email",
              "البريد الإلكتروني",
            ],
            [
              "password",
              "password",
              "كلمة المرور (8 أحرف على الأقل)",
            ],
          ].map(
            ([
              key,
              type,
              placeholder,
            ]) => (
              <input
                key={key}
                required
                value={form[key]}
                type={type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]:
                      e.target.value,
                  })
                }
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
              />
            )
          )}

          <select
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r}>
                {r}
              </option>
            ))}
          </select>

          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-black text-white">
            <Plus size={18} />
            إنشاء المستخدم
          </button>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">
              جاري التحميل...
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              لا يوجد مستخدمون.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sorted.map((u) => (
                <div
                  key={u.id}
                  className="grid min-w-max gap-3 p-5 md:grid-cols-[minmax(220px,1fr)_180px_110px_130px_130px] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-black text-slate-800">
                      {u.name}
                    </p>

                    <p className="break-all text-xs text-slate-400">
                      {u.email}
                    </p>
                  </div>

                  <select
                    value={u.role}
                    disabled={
                      u.id ===
                      currentUser?.id
                    }
                    onChange={(e) =>
                      changeRole(
                        u,
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option
                        key={r}
                      >
                        {r}
                      </option>
                    ))}
                  </select>

                  <span
                    className={`rounded-lg px-3 py-2 text-center text-xs font-black ${
                      u.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {u.isActive
                      ? "نشط"
                      : "موقوف"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setResetTarget(u)
                    }
                    className="flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600"
                  >
                    <KeyRound size={14} />
                    كلمة مرور
                  </button>

                  <button
                    type="button"
                    disabled={
                      u.id ===
                      currentUser?.id
                    }
                    onClick={() =>
                      toggle(u)
                    }
                    className="flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 disabled:opacity-40"
                  >
                    {u.isActive ? (
                      <UserX size={14} />
                    ) : (
                      <UserCheck size={14} />
                    )}

                    {u.isActive
                      ? "تعطيل"
                      : "تفعيل"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {resetTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={
              resetPasswordForUser
            }
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-xl font-black text-slate-900">
              إعادة تعيين كلمة المرور
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              المستخدم:{" "}
              {resetTarget.email}
            </p>

            <input
              autoFocus
              required
              minLength={8}
              type="password"
              value={resetPassword}
              onChange={(e) =>
                setResetPassword(
                  e.target.value
                )
              }
              placeholder="كلمة المرور الجديدة"
              className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setResetTarget(null);
                  setResetPassword("");
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
              >
                إلغاء
              </button>

              <button
                disabled={
                  resetLoading
                }
                className="flex-1 rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {resetLoading
                  ? "جارٍ الحفظ..."
                  : "تحديث كلمة المرور"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}