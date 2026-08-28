import { Router } from "express";

import {
  loginUser,
  changeUserPassword,
} from "../services/auth.service.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

/*
  Public authentication
  ======================

  لا يوجد Public Registration.
  إنشاء المستخدمين سيكون من داخل نظام Admin
  في مرحلة User Management لاحقًا.
*/

router.post("/login", rateLimit({ windowMs: 60_000, max: 10, message: "محاولات تسجيل الدخول كثيرة، حاول لاحقًا" }), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error(
        "Email and password are required"
      );

      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";

      throw error;
    }

    const result = await loginUser({
      email,
      password,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});




router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

router.post(
  "/change-password",
  requireAuth,
  async (req, res, next) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        const error = new Error(
          "Current and new password are required"
        );

        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";

        throw error;
      }

      if (
        newPassword.length < 8
      ) {
        const error = new Error(
          "New password must be at least 8 characters"
        );

        error.statusCode = 400;
        error.code = "VALIDATION_ERROR";

        throw error;
      }

      const result =
        await changeUserPassword(
          req.user.id,
          currentPassword,
          newPassword
        );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;