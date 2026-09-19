import prisma from "../lib/prisma.js";

import {
  comparePassword,
  hashPassword,
} from "../utils/password.js";

import {
  signToken,
} from "../utils/jwt.js";

const ADMINISTRATIVE_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export function assertRoleAssignment(actorRole, targetRole) {
  const normalizedActor = String(actorRole || "STAFF").toUpperCase();
  const normalizedTarget = String(targetRole || "STAFF").toUpperCase();

  if (!ADMINISTRATIVE_ROLES.has(normalizedTarget)) return normalizedTarget;

  if (normalizedActor !== "SUPER_ADMIN") {
    const error = new Error("Only a SUPER_ADMIN can manage administrative roles");
    error.statusCode = 403;
    error.code = "SUPER_ADMIN_REQUIRED";
    throw error;
  }

  return normalizedTarget;
}


export async function createUser({
  name,
  email,
  password,
  role = "STAFF",
  actorRole = "ADMIN",
}) {
  const normalizedEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email:
          normalizedEmail,
      },
    });

  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  const normalizedRole = String(role || "STAFF").toUpperCase();
  const allowedRoles = ["STAFF", "ADMIN", "SUPER_ADMIN"];
  if (!allowedRoles.includes(normalizedRole)) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    error.code = "INVALID_ROLE";
    throw error;
  }
  assertRoleAssignment(actorRole, normalizedRole);

  const passwordHash =
    await hashPassword(
      password
    );

  return prisma.user.create({
    data: {
      name:
        String(
          name || ""
        ).trim(),

      email:
        normalizedEmail,

      passwordHash,

      role: normalizedRole,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}


export async function loginUser({
  email,
  password,
}) {
  const normalizedEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();

  const user =
    await prisma.user.findUnique({
      where: {
        email:
          normalizedEmail,
      },
    });

  if (
    !user ||
    !user.isActive
  ) {
    const error =
      new Error(
        "Invalid email or password"
      );

    error.statusCode = 401;
    error.code =
      "INVALID_CREDENTIALS";

    throw error;
  }

  const passwordMatches =
    await comparePassword(
      password,
      user.passwordHash
    );

  if (!passwordMatches) {
    const error =
      new Error(
        "Invalid email or password"
      );

    error.statusCode = 401;
    error.code =
      "INVALID_CREDENTIALS";

    throw error;
  }

  const token =
    signToken({
      sub: user.id,
      role: user.role,
    });

  return {
    token,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive:
        user.isActive,
    },
  };
}

/* =====================================
   CHANGE PASSWORD (requires current one)
===================================== */

export async function changeUserPassword(
  userId,
  currentPassword,
  newPassword
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  const matches = await comparePassword(
    currentPassword,
    user.passwordHash
  );

  if (!matches) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    error.code = "INVALID_CURRENT_PASSWORD";
    throw error;
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { success: true };
}


export async function listUsers() {
  return prisma.user.findMany({
    select: { id:true, name:true, email:true, role:true, isActive:true, createdAt:true, updatedAt:true },
    orderBy: { createdAt:"desc" },
  });
}

export async function updateUser(userId, input, actorId) {
  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) {
    const e = new Error("User not found");
    e.statusCode = 404;
    e.code = "USER_NOT_FOUND";
    throw e;
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { role: true },
  });
  const actorRole = actor?.role || "STAFF";

  if (actorRole !== "SUPER_ADMIN" && current.role === "SUPER_ADMIN") {
    const e = new Error("Only a SUPER_ADMIN can manage a SUPER_ADMIN account");
    e.statusCode = 403;
    e.code = "SUPER_ADMIN_REQUIRED";
    throw e;
  }

  const data = {};

  if (input.name !== undefined) {
    const name = String(input.name).trim();
    if (!name) {
      const e = new Error("Name is required");
      e.statusCode = 400;
      e.code = "VALIDATION_ERROR";
      throw e;
    }
    data.name = name;
  }

  if (input.email !== undefined) {
    const email = String(input.email).trim().toLowerCase();
    if (!email) {
      const e = new Error("Email is required");
      e.statusCode = 400;
      e.code = "VALIDATION_ERROR";
      throw e;
    }
    if (email !== current.email) {
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (existing && existing.id !== current.id) {
        const e = new Error("Email already exists");
        e.statusCode = 409;
        e.code = "EMAIL_ALREADY_EXISTS";
        throw e;
      }
    }
    data.email = email;
  }

  if (input.role !== undefined) {
    const role = String(input.role).toUpperCase();
    const allowedRoles = ["STAFF", "ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(role)) {
      const e = new Error("Invalid role");
      e.statusCode = 400;
      e.code = "INVALID_ROLE";
      throw e;
    }
    data.role = assertRoleAssignment(actorRole, role);
  }

  if (input.isActive !== undefined) data.isActive = Boolean(input.isActive);
  if (input.password !== undefined) {
    const password = String(input.password);
    if (password.length < 8) {
      const e = new Error("Password must be at least 8 characters");
      e.statusCode = 400;
      e.code = "VALIDATION_ERROR";
      throw e;
    }
    if (actorRole !== "SUPER_ADMIN" && current.role === "SUPER_ADMIN") {
      const e = new Error("Only a SUPER_ADMIN can reset a SUPER_ADMIN password");
      e.statusCode = 403;
      e.code = "SUPER_ADMIN_REQUIRED";
      throw e;
    }
    data.passwordHash = await hashPassword(password);
  }

  if (data.isActive === false && current.id === actorId) {
    const e = new Error("You cannot deactivate your own account");
    e.statusCode = 409;
    e.code = "SELF_DEACTIVATION_NOT_ALLOWED";
    throw e;
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
  });
}



export async function updateOwnProfile(userId, input = {}) {
  const name = String(input.name || "").trim();

  if (!name) {
    const error = new Error("Name is required");
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
