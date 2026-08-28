import prisma from "../lib/prisma.js";

import {
  comparePassword,
  hashPassword,
} from "../utils/password.js";

import {
  signToken,
} from "../utils/jwt.js";


export async function createUser({
  name,
  email,
  password,
  role = "STAFF",
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
    const error =
      new Error(
        "Email already exists"
      );

    error.statusCode = 409;
    error.code =
      "EMAIL_ALREADY_EXISTS";

    throw error;
  }

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

      role,
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
  const current=await prisma.user.findUnique({where:{id:userId}});
  if(!current){const e=new Error("User not found");e.statusCode=404;e.code="USER_NOT_FOUND";throw e;}
  const data={};
  if(input.name!==undefined) data.name=String(input.name).trim();
  if(input.email!==undefined) data.email=String(input.email).trim().toLowerCase();
  if(input.role!==undefined) data.role=String(input.role).toUpperCase();
  if(input.isActive!==undefined) data.isActive=Boolean(input.isActive);
  if(input.password) data.passwordHash=await hashPassword(String(input.password));
  const allowedRoles=["STAFF","ADMIN","SUPER_ADMIN"];
  if(data.role && !allowedRoles.includes(data.role)){const e=new Error("Invalid role");e.statusCode=400;e.code="INVALID_ROLE";throw e;}
  if(data.isActive===false && current.id===actorId){const e=new Error("You cannot deactivate your own account");e.statusCode=409;e.code="SELF_DEACTIVATION_NOT_ALLOWED";throw e;}
  return prisma.user.update({where:{id:userId},data,select:{id:true,name:true,email:true,role:true,isActive:true,createdAt:true,updatedAt:true}});
}
