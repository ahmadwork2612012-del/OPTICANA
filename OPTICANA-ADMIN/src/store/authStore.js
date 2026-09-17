import { create } from "zustand";
import { persist } from "zustand/middleware";

import apiClient from "../lib/apiClient";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      rememberMe: true,

      /* =========================
         LOGIN (REAL API)
      ========================= */

      login: async (email, password, rememberMe = true) => {
        set({ isLoading: true });

        try {
          const result = await apiClient.post("/auth/login", {
            email: email?.trim().toLowerCase(),
            password,
          });

          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            rememberMe,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });

          return {
            success: false,
            message:
              error.message ||
              "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
          };
        }
      },

      /* =========================
         LOGOUT
      ========================= */

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      /* =========================
         PASSWORD
      ========================= */

      changePassword: async (currentPassword, newPassword) => {
        try {
          await apiClient.post("/auth/change-password", {
            currentPassword,
            newPassword,
          });

          return {
            success: true,
            message: "تم تغيير كلمة المرور بنجاح.",
          };
        } catch (error) {
          return {
            success: false,
            message: error.message || "حدث خطأ أثناء تغيير كلمة المرور.",
          };
        }
      },

      getCurrentUser: () => get().user,
    }),
    {
      name: "opticana-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);

export default useAuthStore;

