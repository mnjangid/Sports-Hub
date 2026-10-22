import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "../middlewares/authMiddleware.js";

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  universityId: string;
};

export async function registerUser(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();

  // Check whether this email already exists.
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  // Never store the original password.
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName.trim(),
        email,
        passwordHash,
        university: {
          connect: { id: input.universityId },
        },
        userRoles: {
          create: {
            role: {
              connect: {
                name: "STUDENT",
              },
            },
          },
        },
      },
      select: {
        id: true,
        universityId: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2025")
    ) {
      throw new Error("INVALID_UNIVERSITY");
    }

    throw error;
  }
}

type LoginInput = {
  email: string;
  password: string;
};


export async function loginUser(input: LoginInput) {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET_NOT_CONFIGURED");
  }

  const roles = user.userRoles.map(
    (userRole) => userRole.role.name,
  );

  const token = jwt.sign(
    {
      userId: user.id,
      universityId: user.universityId,
    },
    jwtSecret,
    { expiresIn: "1h" },
  );

  return {
    token,
    user: {
      id: user.id,
      universityId: user.universityId,
      fullName: user.fullName,
      email: user.email,
      status: user.status,
      roles,
    },
  };
}



export async function getCurrentUser(authUser: AuthTokenPayload) {
  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    include: {
      userRoles: {
        include: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("USER_NOT_FOUND_OR_INACTIVE");
  }

  const roles = user.userRoles.map(
    (userRole) => userRole.role.name,
  );

  return {
    id: user.id,
    universityId: user.universityId,
    fullName: user.fullName,
    email: user.email,
    rollNumber: user.rollNumber,
    department: user.department,
    academicYear: user.academicYear,
    phoneNumber: user.phoneNumber,
    profilePhotoUrl: user.profilePhotoUrl,
    status: user.status,
    createdAt: user.createdAt,
    roles,
  };
}
