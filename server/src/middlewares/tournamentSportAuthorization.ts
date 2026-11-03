import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma.js";
import type { ScoreEvent } from "../../generated/prisma/browser.js";

type ResourceType = "team" | "membership" | "match" | "innings" | "scoreEvent";

type AuthorizationOptions = {
  resource: ResourceType;
  paramName?: string;
  source?: "params" | "body";
  fieldName?: string;
};

export function requireTournamentSportAccess(options: AuthorizationOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = res.locals.authUser;

      if (!authUser?.userId || !authUser?.universityId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      const source = options.source ?? "params";
      const fieldName = options.fieldName ?? options.paramName ?? "id";

      const rawId =
        source === "body" ? req.body?.[fieldName] : req.params[fieldName];

      const id = Array.isArray(rawId) ? rawId[0] : rawId;
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
      } else if (options.resource === "membership") {
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
      } else if (options.resource === "match") {
        // New match logic
        if (source === "body" && fieldName === "tournamentId") {
          const tournament = await prisma.tournament.findUnique({
            where: { id },
            select: {
              sportId: true,
              sport: {
                select: { universityId: true },
              },
            },
          });

          if (!tournament) {
            res.status(404).json({
              success: false,
              message: "Tournament not found.",
            });
            return;
          }

          sportId = tournament.sportId;
          universityId = tournament.sport.universityId;
        } else {
          const match = await prisma.match.findUnique({
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

          if (!match) {
            res.status(404).json({
              success: false,
              message: "Match not found.",
            });
            return;
          }

          sportId = match.tournament.sportId;
          universityId = match.tournament.sport.universityId;
        }
      } else if (options.resource === "innings") {
        // New innings logic
        if (source === "body" && fieldName === "matchId") {
          const match = await prisma.match.findUnique({
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

          if (!match) {
            res.status(404).json({
              success: false,
              message: "Match not found.",
            });
            return;
          }

          sportId = match.tournament.sportId;
          universityId = match.tournament.sport.universityId;
        } else {
          const innings = await prisma.innings.findUnique({
            where: { id },
            select: {
              match: {
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

          if (!innings) {
            res.status(404).json({
              success: false,
              message: "Innings not found.",
            });
            return;
          }

          sportId = innings.match.tournament.sportId;
          universityId = innings.match.tournament.sport.universityId;
        }
      } else if (options.resource === "scoreEvent") {
        const scoreEvent = await prisma.scoreEvent.findUnique({
          where: { id },
          select: {
            innings: {
              select: {
                match: {
                  select: {
                    tournament: {
                      select: {
                        sportId: true,
                        sport: {
                          select: {
                            universityId: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!scoreEvent) {
          res.status(404).json({
            success: false,
            message: "Score event not found.",
          });
          return;
        }

        sportId = scoreEvent.innings.match.tournament.sportId;
        universityId = scoreEvent.innings.match.tournament.sport.universityId;
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid resource type.",
        });
        return;
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

export async function requireTeamSportAccess(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authUser = res.locals.authUser;
    const { teamId } = req.body;

    if (!authUser?.userId || !authUser?.universityId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (typeof teamId !== "string" || !teamId.trim()) {
      res.status(400).json({
        success: false,
        message: "A valid teamId is required.",
      });
      return;
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        tournament: {
          select: {
            sportId: true,
            sport: {
              select: {
                universityId: true,
              },
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

    const { sportId, sport } = team.tournament;

    if (sport.universityId !== authUser.universityId) {
      res.status(403).json({
        success: false,
        message: "This team belongs to another university.",
      });
      return;
    }

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

    const assignment = await prisma.coordinatorAssignment.findFirst({
      where: {
        userId: authUser.userId,
        sportId,
        status: "ACTIVE",
        sport: { universityId: authUser.universityId },
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
