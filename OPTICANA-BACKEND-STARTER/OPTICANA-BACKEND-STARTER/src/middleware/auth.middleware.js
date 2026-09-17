import prisma from "../lib/prisma.js";

import {
  verifyToken,
} from "../utils/jwt.js";


/* =========================================================
   REQUIRE AUTH
========================================================= */

export async function requireAuth(
  req,
  res,
  next
) {
  try {
    const header =
      req.headers.authorization || "";


    if (
      !header.startsWith(
        "Bearer "
      )
    ) {
      const error =
        new Error(
          "Authentication required"
        );

      error.statusCode = 401;
      error.code =
        "AUTH_REQUIRED";

      throw error;
    }


    const token =
      header
        .slice(7)
        .trim();


    if (!token) {
      const error =
        new Error(
          "Authentication required"
        );

      error.statusCode = 401;
      error.code =
        "AUTH_REQUIRED";

      throw error;
    }


    /*
      Verify the JWT signature first.
    */

    const payload =
      verifyToken(token);


    if (
      !payload?.sub
    ) {
      const error =
        new Error(
          "Invalid authentication token"
        );

      error.statusCode = 401;
      error.code =
        "INVALID_TOKEN";

      throw error;
    }


    /*
      IMPORTANT:

      Do not trust the role stored inside
      the JWT forever.

      Read the current user from PostgreSQL
      so:
      - deactivated users lose access
      - changed roles take effect
      - deleted users lose access
    */

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            String(
              payload.sub
            ),
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });


    if (!user) {
      const error =
        new Error(
          "User not found"
        );

      error.statusCode = 401;
      error.code =
        "USER_NOT_FOUND";

      throw error;
    }


    if (
      user.isActive !== true
    ) {
      const error =
        new Error(
          "User account is inactive"
        );

      error.statusCode = 401;
      error.code =
        "ACCOUNT_INACTIVE";

      throw error;
    }


    /*
      req.user now contains the CURRENT
      database state, not stale JWT role data.
    */

    req.user = {
      id:
        user.id,

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,

      isActive:
        user.isActive,
    };


    next();
  } catch (error) {
    error.statusCode =
      error.statusCode || 401;

    error.code =
      error.code ||
      "INVALID_TOKEN";

    next(error);
  }
}


/* =========================================================
   REQUIRE ROLE
========================================================= */

export function requireRole(
  ...allowedRoles
) {
  return function (
    req,
    res,
    next
  ) {
    if (!req.user) {
      const error =
        new Error(
          "Authentication required"
        );

      error.statusCode = 401;
      error.code =
        "AUTH_REQUIRED";

      return next(error);
    }


    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      const error =
        new Error(
          "You do not have permission to perform this action"
        );

      error.statusCode = 403;
      error.code =
        "FORBIDDEN";

      return next(error);
    }


    next();
  };
}