import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/appError.js";

const INNINGS_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "DECLARED"];

function badId(res: Response): null {
  res.status(400).json({ success: false, message: "id param is required" });
  return null;
}

export async function createInnings(req: Request, res: Response, next: NextFunction) {
  try {
    const { matchId, inningsNumber, battingTeamId, bowlingTeamId } = req.body;

    if (typeof matchId !== "string" || !matchId) {
      res.status(400).json({ success: false, message: "matchId is required" });
      return;
    }

    if (typeof battingTeamId !== "string" || !battingTeamId) {
      res.status(400).json({ success: false, message: "battingTeamId is required" });
      return;
    }

    if (typeof bowlingTeamId !== "string" || !bowlingTeamId) {
      res.status(400).json({ success: false, message: "bowlingTeamId is required" });
      return;
    }

    if (typeof inningsNumber !== "number" || !Number.isInteger(inningsNumber) || inningsNumber < 1) {
      res.status(400).json({ success: false, message: "inningsNumber must be a positive integer" });
      return;
    }

    if (battingTeamId === bowlingTeamId) {
      res.status(400).json({ success: false, message: "Batting and bowling teams cannot be the same" });
      return;
    }


    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new AppError(404, "Match not found");

    const pairOk =
      (battingTeamId === match.teamAId && bowlingTeamId === match.teamBId) ||
      (battingTeamId === match.teamBId && bowlingTeamId === match.teamAId);
    

    if (!pairOk) {
      res.status(400).json({ success: false, message: "Batting and bowling teams must be the two teams playing this match" });
      return;
    }

    const innings = await prisma.innings.create({
      data: { matchId, inningsNumber, battingTeamId, bowlingTeamId },
    });
    res.status(201).json({ success: true, data: innings });
  } catch (err) {

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ success: false, message: "This match already has an innings with that number" });
      return;
    }
    next(err);
  }
}

export async function listInnings(req: Request, res: Response, next: NextFunction) {
  try {
    const matchId = typeof req.query.matchId === "string" ? req.query.matchId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    if (status !== undefined && !INNINGS_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: "status must be NOT_STARTED, IN_PROGRESS, COMPLETED or DECLARED" });
      return;
    }

    const where: Prisma.InningsWhereInput = {};
    if (matchId) where.matchId = matchId;
    if (status) where.status = status as "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DECLARED";

    const args: Prisma.InningsFindManyArgs = { orderBy: { inningsNumber: "asc" } };
    if (matchId || status) args.where = where;

    const innings = await prisma.innings.findMany(args);
    res.status(200).json({ success: true, data: innings });
  } catch (err) { next(err); }
}

export async function getInnings(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);
    const innings = await prisma.innings.findUnique({
      where: { id },
      include: {
        match: { select: { id: true, status: true, venue: true, scheduledAt: true } },
        battingTeam: { select: { id: true, name: true } },
        bowlingTeam: { select: { id: true, name: true } },
        _count: { select: { scoreEvents: true } },
      },
    });
    if (!innings) throw new AppError(404, "Innings not found");
    res.json({ success: true, data: innings });
  } catch (err) { next(err); }
}

export async function updateInnings(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);

    const { totalRuns, wickets, totalBalls, status } = req.body;

    if (totalRuns !== undefined && (!Number.isInteger(totalRuns) || totalRuns < 0)) {
      res.status(400).json({ success: false, message: "totalRuns must be a non-negative integer" });
      return;
    }
    if (wickets !== undefined && (!Number.isInteger(wickets) || wickets < 0 || wickets > 10)) {
      res.status(400).json({ success: false, message: "iwckets must be an integer between 0 and 10" });
      return;
    }
    if (totalBalls !== undefined && (!Number.isInteger(totalBalls) || totalBalls < 0)) {
      res.status(400).json({ success: false, message: "totalBalls must be a non-negative integer" });
      return;
    }
    if (status !== undefined && !INNINGS_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: "status must be NOT_STARTED, IN_PROGRESS, COMPLETED or DECLARED" });
      return;
    }

    const data: Prisma.InningsUpdateInput = {};
    if (totalRuns !== undefined) data.totalRuns = totalRuns;
    if (wickets !== undefined) data.wickets = wickets;
    if (totalBalls !== undefined) data.totalBalls = totalBalls;
    if (status !== undefined) data.status = status;

    const innings = await prisma.innings.update({ where: { id }, data });
    res.json({ success: true, data: innings });
  } catch (err) { next(err); }
}


export async function deleteInnings(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);

    const innings = await prisma.innings.findUnique({ where: { id } });
    if (!innings) throw new AppError(404, "Innings not found");

    await prisma.innings.delete({ where: { id } });
    res.json({ success: true, message: "Innings deleted" });

  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && (err.code === "P2003" || err.code === "P2014")) {
      res.status(409).json({ success: false, message: "Innings has score events — it cannot be deleted" });
      return;
    }
    next(err);
  }
  
}
