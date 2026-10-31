// import type { Request, Response, NextFunction } from "express";
// import { Prisma } from "../../generated/prisma/client.js";
// import { prisma } from "../db/prisma.js";
// import { AppError } from "../utils/appError.js";

// const TEAM_ROLES = ["MEMBER", "CAPTAIN", "VICE_CAPTAIN"];
// const MEMBERSHIP_STATUSES = ["ACTIVE", "LEFT", "REMOVED"];

// function badId(res: Response): null {
//   res.status(400).json({ success: false, message: "id param is required" });
//   return null;
// }

// export async function addTeamMember(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { teamId, userId, teamRole } = req.body;
//     if (typeof teamId !== "string" || !teamId) {
//       res.status(400)
//       .json({ 
//         success: false, 
//         message: "teamId is required" 
//       });
//       return;
//     }
//     if (typeof userId !== "string" || !userId) {
//       res.status(400)
//       .json({ 
//         success: false, 
//         message: "userId is required" 
//       });
//       return;
//     }
//     if (teamRole !== undefined && !TEAM_ROLES.includes(teamRole)) {
//       res.status(400)
//       .json({ 
//         success: false, 
//         message: "teamRole must be MEMBER, CAPTAIN or VICE_CAPTAIN" 
//       });
//       return;
//     }

//     const team =  await prisma.team.findUnique({ where: { id: teamId } });
//     if (!team) throw new AppError(404, "Team not found");

//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user) throw new AppError(404, "User not found");

//     const existing = await prisma.teamMembership.findFirst({
//       where: { 
//         teamId, userId, status: "ACTIVE"
//       },
//     });
//     if (existing) {
//       res.status(409)
//       .json({ 
//         success: false, 
//         message: "User is already an active member of this team" 
//       });
//       return;
//     }

//     const membership = await prisma.teamMembership.create({
//       data: { teamId, tournamentId: team.tournamentId, userId, teamRole: teamRole ?? "MEMBER" },
//     });
//     res.status(201).json({ success: true, data: membership });
//   } catch (err) { next(err); }
// }

// export async function listTeamMembers(req: Request, res: Response, next: NextFunction) {
//   try {
//     const teamId = typeof req.query.teamId === "string" ? req.query.teamId : undefined;
//     const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;

//     const tournamentId = typeof req.query.tournamentId === "string" ? req.query.tournamentId : undefined;
//     const status = typeof req.query.status === "string" ? req.query.status : undefined;

//     if (status !== undefined && !MEMBERSHIP_STATUSES.includes(status)) {
//       res.status(400)
//       .json({ 
//         success: false, 
//         message: "status must be ACTIVE, LEFT or REMOVED" 
//       });
//       return;
//     }

//     const where: Prisma.TeamMembershipWhereInput = {};
//     if (teamId) where.teamId = teamId;
//     if (userId) where.userId = userId;

//     if (tournamentId) where.tournamentId = tournamentId;
//     if (status) where.status = status as "ACTIVE" | "LEFT" | "REMOVED";

//     const args: Prisma.TeamMembershipFindManyArgs = { orderBy: { joinedAt: "asc" } };

//     if (teamId || userId || tournamentId || status) args.where = where;
//     const memberships = await prisma.teamMembership.findMany(args);

//     res.status(200)
//     .json({ 
//         success: true, 
//         data: memberships 
//         });
//   } catch (err) { 
//     next(err); 
//     }
// }

// export async function getTeamMember(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { id } = req.params;
//     if (typeof id !== "string" || !id) return badId(res);

//     const membership = await prisma.teamMembership.findUnique({
//       where: { id },
//       include: {
//         team: { select: { id: true, name: true } },
//         user: { select: { id: true, fullName: true, email: true } },
//       },
//     });

//     if (!membership) throw new AppError(404, "Team membership not found");
//     res.json({ 
//         success: true, 
//         data: membership });
//   } catch (err) { 
//     next(err); 
//   }
// }

// export async function updateTeamMember(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { id } = req.params;
//     if (typeof id !== "string" || !id) return badId(res);

//     const { teamRole, status } = req.body;
//     if (teamRole !== undefined && !TEAM_ROLES.includes(teamRole)) {
//       res.status(400).json({ success: false, message: "teamRole must be MEMBER, CAPTAIN or VICE_CAPTAIN" });
//       return;
//     }
//     if (status !== undefined && !MEMBERSHIP_STATUSES.includes(status)) {
//       res.status(400).json({ success: false, message: "status must be ACTIVE, LEFT or REMOVED" });
//       return;
//     }
//     const existing = await prisma.teamMembership.findUnique({ where: { id } });
//     if (!existing) throw new AppError(404, "Team membership not found");

//     const data: Prisma.TeamMembershipUpdateInput = {};
//     if (teamRole !== undefined) data.teamRole = teamRole;
//     if (status !== undefined) {
//       data.status = status;
//       data.leftAt = status === "ACTIVE" ? null : new Date();
//     }
    
//     const membership = await prisma.teamMembership.update({ where: { id }, data });
//     res.json({ 
//         success: true, 
//         data: membership 
//     });
//   } catch (err) { 
//     next(err); 
//   }
// }

// export async function removeTeamMember(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { id } = req.params;
//     if (typeof id !== "string" || !id) return badId(res);

//     const existing = await prisma.teamMembership.findUnique({ where: { id } });

//     if (!existing) throw new AppError(404, "Team membership not found");

//     const membership = await prisma.teamMembership.update({
//       where: { id },
//       data: { status: "REMOVED", leftAt: new Date() },
//     });
//     res.json({ 
//         success: true, 
//         data: membership 
//     });
//   } catch (err) { 
//         next(err);
//     }
// }



// SEPARATED THE DB LOGIC WITH SERVICES AND CONTROLLERS


import type { Request, Response, NextFunction } from "express";
import * as teamMembershipService from "../services/teamMembershipService.js";
import { AppError } from "../utils/appError.js";

const TEAM_ROLES = ["MEMBER", "CAPTAIN", "VICE_CAPTAIN"];
const MEMBERSHIP_STATUSES = ["ACTIVE", "LEFT", "REMOVED"];

function validateId(id: unknown): id is string {
  return typeof id === "string" && id.trim().length > 0;
}

export async function addTeamMember(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { teamId, userId, teamRole } = req.body;

    if (!validateId(teamId)) {
      throw new AppError(400, "teamId is required.");
    }

    if (!validateId(userId)) {
      throw new AppError(400, "userId is required.");
    }

    if (teamRole !== undefined && !TEAM_ROLES.includes(teamRole)) {
      throw new AppError(
        400,
        "teamRole must be MEMBER, CAPTAIN or VICE_CAPTAIN.",
      );
    }

    const membership = await teamMembershipService.addTeamMember({
      teamId: teamId.trim(),
      userId: userId.trim(),
      teamRole,
    });

    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
}

export async function listTeamMembers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { teamId, userId, tournamentId, status } = req.query;

    if (
      teamId !== undefined && typeof teamId !== "string" ||
      userId !== undefined && typeof userId !== "string" ||
      tournamentId !== undefined && typeof tournamentId !== "string" ||
      status !== undefined && typeof status !== "string"
    ) {
      throw new AppError(400, "Invalid query parameter.");
    }

    if (
      status !== undefined &&
      !MEMBERSHIP_STATUSES.includes(status)
    ) {
      throw new AppError(
        400,
        "status must be ACTIVE, LEFT or REMOVED.",
      );
    }

    const memberships = await teamMembershipService.listTeamMembers({
  ...(teamId !== undefined ? { teamId } : {}),
  ...(userId !== undefined ? { userId } : {}),
  ...(tournamentId !== undefined ? { tournamentId } : {}),
  ...(status !== undefined
    ? { status: status as "ACTIVE" | "LEFT" | "REMOVED" }
    : {}),
});

    res.status(200).json({ success: true, data: memberships });
  } catch (error) {
    next(error);
  }
}

export async function getTeamMember(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      throw new AppError(400, "Valid membership id is required.");
    }

    const membership = await teamMembershipService.getTeamMember(id);

    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
}

export async function updateTeamMember(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { teamRole, status } = req.body;

    if (!validateId(id)) {
      throw new AppError(400, "Valid membership id is required.");
    }

    if (teamRole !== undefined && !TEAM_ROLES.includes(teamRole)) {
      throw new AppError(
        400,
        "teamRole must be MEMBER, CAPTAIN or VICE_CAPTAIN.",
      );
    }

    if (status !== undefined && !MEMBERSHIP_STATUSES.includes(status)) {
      throw new AppError(
        400,
        "status must be ACTIVE, LEFT or REMOVED.",
      );
    }

    const membership = await teamMembershipService.updateTeamMember(id, {
      teamRole,
      status,
    });

    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
}

export async function removeTeamMember(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      throw new AppError(400, "Valid membership id is required.");
    }

    const membership = await teamMembershipService.removeTeamMember(id);

    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
}
