
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

    const tournamentId = req.body?.tournamentId;

    if (
      typeof tournamentId !== "string" ||
      !tournamentId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "A valid tournamentId is required.",
      });
      return;
    }

    // Resolve the tournament's sport and verify university ownership.
    const tournament = await prisma.tournament.findFirst({
      where: {
        id: tournamentId,
        sport: {
          universityId: authUser.universityId,
        },
      },
      select: {
        sportId: true,
      },
    });

    if (!tournament) {
      res.status(404).json({
        success: false,
        message: "Tournament not found in your university.",
      });
      return;
    }

    // Admins can manage all sports in their own university.
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
        sportId: tournament.sportId,
        status: "ACTIVE",
        sport: {
          universityId: authUser.universityId,
        },
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
