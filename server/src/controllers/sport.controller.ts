import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/appError.js";

function badId(res: Response): null {
  res.status(400).json({ success: false, message: "id param is required" });
  return null;
}

export async function createSport(req: Request, res: Response, next: NextFunction) {
  try {
    const { universityId, name, description } = req.body;
    if (typeof universityId !== "string" || !universityId) {
      res.status(400).json({ success: false, message: "universityId is required" });
      return;
    }
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, message: "name is required and should be a string" });
      return;
    }
    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) throw new AppError(404, "University not found");
    const sport = await prisma.sport.create({ data: { universityId, name, description } });
    res.status(201).json({ success: true, data: sport });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ success: false, message: "A sport with this name already exists in this university" });
      return;
    }
    next(err);
  }
}



export async function listSports(req: Request, res: Response, next: NextFunction) {
  try {
    const rawUniversityId = req.query.universityId;
    const universityId = typeof rawUniversityId === "string" ? rawUniversityId : undefined;
    const rawStatus = req.query.status;
    const status = typeof rawStatus === "string" ? rawStatus : undefined;
    if (status !== undefined && status !== "ACTIVE" && status !== "INACTIVE") {
      res.status(400).json({ success: false, message: "status must be ACTIVE or INACTIVE" });
      return;
    }
    const where: Prisma.SportWhereInput = {};
    if (universityId) where.universityId = universityId;
    if (status) where.status = status;
    const args: Prisma.SportFindManyArgs = { orderBy: { createdAt: "desc" } };
    if (universityId || status) args.where = where;
    const sports = await prisma.sport.findMany(args);
    res.status(200).json({ success: true, data: sports });
  } catch (err) { 
        next(err); 
    }
}



export async function getSport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);
    const sport = await prisma.sport.findUnique({
      where: { id },
      include: { university: { select: { id: true, name: true } } },
    });
    if (!sport) throw new AppError(404, "Sport not found");
    res.json({ success: true, data: sport });
  } catch (err) { 
        next(err); 
    }
}





export async function updateSport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);
    const { name, description, status } = req.body;
    const data: Prisma.SportUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    const sport = await prisma.sport.update({ where: { id }, data });
    res.json({ success: true, data: sport });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(409).json({ success: false, message: "A sport with this name already exists in this university" });
      return;
    }
    next(err);
  }
}

export async function deactivateSport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) return badId(res);
    const sport = await prisma.sport.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    res.json({ success: true, data: sport });
  } catch (err) { next(err); }
}
