
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma.js";

type ResourceType = "team" | "membership";

type AuthorizationOptions = {
  resource: ResourceType;
  paramName?: string;
};

export function requireTournamentSportAccess(
  options: AuthorizationOptions,
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const authUser = res.locals.authUser;

      if (!authUser?.userId || !authUser?.universityId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      const paramValue = req.params[options.paramName ?? "id"];
      const id = Array.isArray(paramValue) ? paramValue[0] : paramValue;

      if (typeof id !== "string" || !id.trim()) {
        res.status(400).json({
          success: false,
          message: "A valid resource id is required.",
        });
        return;
      }

      // Resolve the resource to its tournament and sport.
      let sportId: string;
      let universityId: string;

      if (options.resource === "team") {
        const team = await prisma.team.findUnique({
          where: { id },
          select: {
            tournament: {
              select: {
                sportId: true,
                sport: {
                  select: { universityId: true },
                },
              },
            },
          },
        });

        if (!team) {
          res.status(404).json({
            success: false,
            message: "Team not found.",
          });
          return;
        }

        sportId = team.tournament.sportId;
        universityId = team.tournament.sport.universityId;
      } else {
        const membership = await prisma.teamMembership.findUnique({
          where: { id },
          select: {
            team: {
              select: {
                tournament: {
                  select: {
                    sportId: true,
                    sport: {
                      select: { universityId: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!membership) {
          res.status(404).json({
            success: false,
            message: "Team membership not found.",
          });
          return;
        }

        sportId = membership.team.tournament.sportId;
        universityId = membership.team.tournament.sport.universityId;
      }

      // A resource from another university must never be manageable.
      if (universityId !== authUser.universityId) {
        res.status(403).json({
          success: false,
          message: "This resource belongs to another university.",
        });
        return;
      }

      // University admins can manage resources within their university.
      const admin = await prisma.userRole.findFirst({
        where: {
          userId: authUser.userId,
          role: { name: "ADMIN" },
        },
        select: { userId: true },
      });

      if (admin) {
        next();
        return;
      }

      // Coordinators must have an active assignment for this sport.
      const assignment = await prisma.coordinatorAssignment.findFirst({
        where: {
          userId: authUser.userId,
          sportId,
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
  };
}
