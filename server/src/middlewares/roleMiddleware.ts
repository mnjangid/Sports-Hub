
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma.js";

export function requireRole(...allowedRoles: string[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authUser = res.locals.authUser;

      if (!authUser?.userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: authUser.userId,
          role: {
            name: {
              in: allowedRoles,
            },
          },
        },
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      if (userRoles.length === 0) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource.",
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
