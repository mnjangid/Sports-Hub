// import type { Request, Response, NextFunction } from "express";
// import { Prisma } from "../../generated/prisma/client.js";
// import { prisma } from "../db/prisma.js";
// import { AppError } from "../utils/appError.js";

// function badId(res: Response): null {
//   res.status(400)
//   .json({ 
//     success: false, 
//     message: "id param is required" 
//     });
//   return null;
// }

// export async function createTeam(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { tournamentId, name, logoUrl } = req.body;
//     if (typeof tournamentId !== "string" || !tournamentId) {
//       res.status(400)
//       .json({ success: false, 
//         message: "tournamentId is required" 
//         });
//       return;
//     }
//     if (!name || typeof name !== "string") {
//       res.status(400)
//       .json({ 
//         success: false, 
//         message: "name is required and should be a string" 
//       });
//       return;
//     }
//     const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });

//     if (!tournament) throw new AppError(404, "Tournament not found");

//     const team = await prisma.team.create({ data: { 
//         tournamentId, name, logoUrl 
//     } });

//     res.status(201).json({ success: true, data: team });

//   } catch (err) {
//     if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
//       res.status(409).json({ success: false, message: "A team with this name already exists in this tournament" });
//       return;
//     }
//     next(err);
//   }
// }

// export async function listTeams(req: Request, res: Response, next: NextFunction) {
//   try {
//     const rawTournamentId = req.query.tournamentId;

//     const tournamentId = typeof rawTournamentId === "string" ? rawTournamentId : undefined;
//     const args: Prisma.TeamFindManyArgs = { orderBy: { createdAt: "desc" } };

//     if (tournamentId) args.where = { tournamentId };
//     const teams = await prisma.team.findMany(args);
//     res.status(200).json({ 
//         success: true, 
//         data: teams 
//     });
//   } catch (err) { 
//     next(err); 
// }
// }

// export async function getTeam(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { id } = req.params;
//     if (typeof id !== "string" || !id) return badId(res);

//     const team = await prisma.team.findUnique({
//       where: { id },
//       include: {
//         tournament: { select: { id: true, name: true } },
//         _count: { select: { memberships: true } },
//       },
//     });

//     if (!team) throw new AppError(404, "Team not found");
//     res.json({ success: true, data: team });
//   } catch (err) { next(err); }
// }

// export async function updateTeam(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { id } = req.params;
//     if (typeof id !== "string" || !id) return badId(res);

//     const { name, logoUrl } = req.body;
//     const data: Prisma.TeamUpdateInput = {};
//     if (name !== undefined) data.name = name;
//     if (logoUrl !== undefined) data.logoUrl = logoUrl;

//     const team = await prisma.team.update({ where: { id }, data });
//     res.json({ success: true, data: team });
//   } catch (err) {
//     if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
//       res.status(409).json({ 
//         success: false, 
//         message: "A team with this name already exists in this tournament" 
//       });
//       return;
//     }
//     next(err);
//   }
// }


// export async function deleteTeam(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { id } = req.params;
//     if (typeof id !== "string" || !id) return badId(res);

//     const team = await prisma.team.findUnique({ where: { id } });
//     if (!team) throw new AppError(404, "Team not found");

//     await prisma.team.delete({ where: { id } });
//     res.json({ success: true, message: "Team deleted" });
//   } catch (err) {
//     if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2003" || err.code === "P2014")) {
//       res.status(409).json({ success: false, message: "Team has players or matches — remove them first" });
//       return;
//     }
//     next(err);
//   }
// }


// SEPARATED THE DB LOGIC WITH THE CONTROLLER 
import type { Request, Response, NextFunction } from "express";
import * as teamService from "../services/teamService.js";
import { AppError } from "../utils/appError.js";

function badId(res: Response) {
  res.status(400).json({
    success: false,
    message: "id param is required",
  });
}

export async function createTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { tournamentId, name, logoUrl } = req.body;

    if (typeof tournamentId !== "string" || !tournamentId.trim()) {
      throw new AppError(400, "tournamentId is required");
    }

    if (typeof name !== "string" || !name.trim()) {
      throw new AppError(400, "name is required and should be a non-empty string");
    }

    if (
      logoUrl !== undefined &&
      logoUrl !== null &&
      typeof logoUrl !== "string"
    ) {
      throw new AppError(400, "logoUrl must be a string or null");
    }

    const team = await teamService.createTeam({
      tournamentId: tournamentId.trim(),
      name,
      logoUrl,
    });

    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function listTeams(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const rawTournamentId = req.query.tournamentId;
    const tournamentId =
      typeof rawTournamentId === "string" ? rawTournamentId : undefined;

    const teams = await teamService.listTeams(tournamentId);

    res.status(200).json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

export async function getTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      badId(res);
      return;
    }

    const team = await teamService.getTeam(id);

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function updateTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      badId(res);
      return;
    }

    const { name, logoUrl } = req.body;

    if (name !== undefined && typeof name !== "string") {
      throw new AppError(400, "name must be a string");
    }

    if (
      logoUrl !== undefined &&
      logoUrl !== null &&
      typeof logoUrl !== "string"
    ) {
      throw new AppError(400, "logoUrl must be a string or null");
    }

    const team = await teamService.updateTeam(id, { name, logoUrl });

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function deleteTeam(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !id.trim()) {
      badId(res);
      return;
    }

    await teamService.deleteTeam(id);

    res.status(200).json({
      success: true,
      message: "Team deleted",
    });
  } catch (err) {
    next(err);
  }
}
