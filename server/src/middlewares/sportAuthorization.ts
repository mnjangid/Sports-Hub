
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma.js";

export async function requireSportAssignment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authUser = res.locals.authUser;

    if (!authUser?.userId || !authUser?.universityId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const sportId = req.body?.sportId;

    if (typeof sportId !== "string" || !sportId.trim()) {
      res.status(400).json({
        success: false,
        message: "A valid sportId is required.",
      });
      return;
    }

    // First, verify that this sport belongs to the user's university.
    const sport = await prisma.sport.findFirst({
      where: {
        id: sportId,
        universityId: authUser.universityId,
      },
      select: { id: true },
    });

    if (!sport) {
      res.status(404).json({
        success: false,
        message: "Sport not found in your university.",
      });
      return;
    }

    // University admins can manage all sports within their own university.
    const isAdmin = await prisma.userRole.findFirst({
      where: {
        userId: authUser.userId,
        role: { name: "ADMIN" },
      },
      select: { userId: true },
    });

    if (isAdmin) {
      next();
      return;
    }

    // Coordinators need an active assignment for this sport.
    const assignment = await prisma.coordinatorAssignment.findFirst({
      where: {
        userId: authUser.userId,
        sportId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (!assignment) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to manage this sport.",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
