import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/appError.js";

const MATCH_STATUSES = ["SCHEDULED", "LIVE", "COMPLETED", "POSTPONED", "CANCELLED", "ABANDONED"];

function badId(res: Response): null {
  res.status(400).json({ success: false, message: "id param is required" });
  return null;
}

export async function createMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { tournamentId, teamAId, teamBId, venue, scheduledAt } = req.body;

    if (typeof tournamentId !== "string" || !tournamentId) {
      res.status(400).json({ success: false, message: "tournamentId is required" });
      return;
    }

    if (typeof teamAId !== "string" || !teamAId) {
      res.status(400).json({ success: false, message: "teamAId is required" });
      return;
    }

    if (typeof teamBId !== "string" || !teamBId) {
      res.status(400).json({ success: false, message: "teamBId is required" });
      return;
    }


    if (teamAId === teamBId) {
      res.status(400).json({ success: false, message: "A team cannot play against itself" });
      return;
    }


    if (venue !== undefined && typeof venue !== "string") {
      res.status(400).json({ success: false, message: "venue should be a string" });
      return;
    }

    
    let scheduledDate: Date | undefined;
    if (scheduledAt !== undefined) {
      scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        res.status(400).json({ success: false, message: "scheduledAt must be a valid date" });
        return;
      }
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) throw new AppError(404, "Tournament not found");

    const teamA = await prisma.team.findUnique({ where: { id: teamAId } });

    if (!teamA) throw new AppError(404, "Team A not found");

    const teamB = await prisma.team.findUnique({ where: { id: teamBId } });
    if (!teamB) throw new AppError(404, "Team B not found");

    if (teamA.tournamentId !== tournamentId || teamB.tournamentId !== tournamentId) {
      res.status(400).json({ success: false, message: "Both teams must belong to this tournament" });
      return;
    }

    const data: Prisma.MatchUncheckedCreateInput = { tournamentId, teamAId, teamBId };


    if (venue !== undefined) data.venue = venue;
    if (scheduledDate !== undefined) data.scheduledAt = scheduledDate;

    const match = await prisma.match.create({ data });
    res.status(201).json({ success: true, data: match });
  } catch (err) { next(err); }
}

export async function listMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const tournamentId = typeof req.query.tournamentId === "string" ? req.query.tournamentId : undefined;
    const teamId = typeof req.query.teamId === "string" ? req.query.teamId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    if (status !== undefined && !MATCH_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: "status must be SCHEDULED, LIVE, COMPLETED, POSTPONED, CANCELLED or ABANDONED" });
      return;
    }

    const where: Prisma.MatchWhereInput = {};
    if (tournamentId) where.tournamentId = tournamentId;
    if (status) where.status = status as "SCHEDULED" | "LIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED" | "ABANDONED";
    if (teamId) where.OR = [{ teamAId: teamId }, { teamBId: teamId }];

    const args: Prisma.MatchFindManyArgs = { orderBy: { scheduledAt: "asc" } };
    if (tournamentId || status || teamId) args.where = where;

    const matches = await prisma.match.findMany(args);
    res.status(200).json({ success: true, data: matches });
  } catch (err) { next(err); }
}



export async function getMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        tournament: { select: { id: true, name: true } },
        teamA: { select: { id: true, name: true } },
        teamB: { select: { id: true, name: true } },
        winnerTeam: { select: { id: true, name: true } },
        innings: { orderBy: { inningsNumber: "asc" } },
      },
    });
    if (!match) throw new AppError(404, "Match not found");
    res.json({ success: true, data: match });
  } catch (err) { next(err); }
}



export async function updateMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError(404, "Match not found");

    const { venue, scheduledAt, status, winnerTeamId, resultDescription } = req.body;

    if (status !== undefined && !MATCH_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: "status must be SCHEDULED, LIVE, COMPLETED, POSTPONED, CANCELLED or ABANDONED" });
      return;
    }
    if (venue !== undefined && venue !== null && typeof venue !== "string") {
      res.status(400).json({ success: false, message: "venue should be a string" });
      return;
    }
    if (resultDescription !== undefined && resultDescription !== null && typeof resultDescription !== "string") {
      res.status(400).json({ success: false, message: "resultDescription should be a string" });
      return;
    }

    
    if (winnerTeamId !== undefined && winnerTeamId !== null && winnerTeamId !== match.teamAId && winnerTeamId !== match.teamBId) {
      res.status(400).json({ success: false, message: "winnerTeamId must be one of the two teams in this match" });
      return;
    }

    const data: Prisma.MatchUpdateInput = {};
    if (venue !== undefined) data.venue = venue;
    if (status !== undefined) data.status = status;
    if (winnerTeamId !== undefined) data.winnerTeam = winnerTeamId;
    if (resultDescription !== undefined) data.resultDescription = resultDescription;
    if (scheduledAt !== undefined) {
      if (scheduledAt === null) {
        data.scheduledAt = null;
      } else {
        const parsed = new Date(scheduledAt);
        if (isNaN(parsed.getTime())) {
          res.status(400).json({ success: false, message: "scheduledAt must be a valid date" });
          return;
        }
        data.scheduledAt = parsed;
      }
    }

    const updated = await prisma.match.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}



export async function deleteMatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError(404, "Match not found");


    await prisma.match.delete({ where: { id } });
    res.json({ success: true, message: "Match deleted" });
  } catch (err) {

    if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2003" || err.code === "P2014")) {
      res.status(409).json({ success: false, message: "Match has innings — delete them first" });
      return;
    }
    
    next(err);
  }
}
