import {
  UserRound,
  Mail,
  ShieldCheck,
  LockKeyhole,
  LogOut,
} from "lucide-react";

import {
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore";

function Profile() {
  const navigate =
    useNavigate();

  const user =
    useAuthStore(
      (state) => state.user
    );

  const updateProfile =
    useAuthStore(
      (state) =>
        state.updateProfile
    );

  const changePassword =
    useAuthStore(
      (state) =>
        state.changePassword
    );

  const logout =
    useAuthStore(
      (state) => state.logout
    );

  const [name, setName] =
    useState(
      user?.name || ""
    );

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const handleProfileSave = () => {
    if (!name.trim()) {
      toast.error(
        "أدخل الاسم"
      );
      return;
    }

    updateProfile({
      name: name.trim(),
    });

    toast.success(
      "تم تحديث الملف الشخصي"
    );
  };

  const handlePasswordChange =
    async () => {
      if (!currentPassword) {
        toast.error(
          "أدخل كلمة المرور الحالية"
        );
        return;
      }

      if (
        newPassword.length <
        8
      ) {
        toast.error(
          "كلمة المرور الجديدة يجب أن تحتوي على 8 أحرف على الأقل"
        );
        return;
      }

      const result =
        await changePassword(
          currentPassword,
          newPassword
        );

      if (!result.success) {
        toast.error(
          result.message
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");

      toast.success(
        "تم تغيير كلمة المرور"
      );
    };

  const handleLogout = () => {
    logout();

    toast.success(
      "تم تسجيل الخروج"
    );

    navigate(
      "/login",
      { replace: true }
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      <div>
        <p className="text-sm font-bold text-blue-700">
          الحساب
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-900">
          الملف الشخصي
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          إدارة بيانات حساب مدير النظام وكلمة المرور.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-xl font-black text-white">
            {user.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2 className="font-black text-slate-900">
              {user.name}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {user.email}
            </p>
          </div>

        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <ProfileField
            icon={UserRound}
            label="الاسم"
            value={name}
            onChange={
              setName
            }
          />

          <StaticField
            icon={Mail}
            label="البريد الإلكتروني"
            value={user.email}
          />

          <StaticField
            icon={ShieldCheck}
            label="الدور"
            value="مدير النظام"
          />

        </div>

        <button
          type="button"
          onClick={
            handleProfileSave
          }
          className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
        >
          حفظ البيانات
        </button>

      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
            <LockKeyhole size={19} />
          </div>

          <div>
            <h2 className="font-black text-slate-900">
              تغيير كلمة المرور
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              استخدم كلمة مرور قوية.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">

          <PasswordInput
            label="كلمة المرور الحالية"
            value={
              currentPassword
            }
            onChange={
              setCurrentPassword
            }
          />

          <PasswordInput
            label="كلمة المرور الجديدة"
            value={
              newPassword
            }
            onChange={
              setNewPassword
            }
          />

        </div>

        <button
          type="button"
          onClick={
            handlePasswordChange
          }
          className="mt-5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
        >
          تغيير كلمة المرور
        </button>

      </div>

      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">

        <div>
          <h2 className="font-black text-slate-900">
            تسجيل الخروج
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            إنهاء جلسة الإدارة على هذا الجهاز.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="mt-4 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700"
        >
          <LogOut size={17} />
          تسجيل الخروج
        </button>

      </div>

    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
        <Icon
          size={17}
          className="text-slate-400"
        />

        <input
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full outline-none"
        />
      </div>
    </div>
  );
}

function StaticField({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
        <Icon
          size={17}
          className="text-slate-400"
        />

        <span className="text-sm font-bold text-slate-700">
          {value}
        </span>
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
        <LockKeyhole
          size={17}
          className="text-slate-400"
        />

        <input
          type="password"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full outline-none"
        />
      </div>
    </div>
  );
}

export default Profile;