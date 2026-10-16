import type { Request, Response, NextFunction } from "express";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/appError.js";

export async function createUniversity(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, logoUrl, description } = req.body;
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, message: "name is required and should be a string" });
      return;
    }
    const university = await prisma.university.create({ data: { name, logoUrl, description } });
    res.status(201).json({ success: true, data: university });
  } catch (err) { next(err); }
}

export async function listUniversities(req: Request, res: Response, next: NextFunction) {
  try {
    const rawStatus = req.query.status;
    const status = typeof rawStatus === "string" ? rawStatus : undefined;
    if (status !== undefined && status !== "ACTIVE" && status !== "INACTIVE") {
      res.status(400).json({ success: false, message: "status must be ACTIVE or INACTIVE" });
      return;
    }
    const args: Prisma.UniversityFindManyArgs = { orderBy: { createdAt: "desc" } };
    if (status) args.where = { status };
    const universities = await prisma.university.findMany(args);
    res.status(200).json({ success: true, data: universities });
  } catch (err) { next(err); }
}

export async function getUniversity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) {
      res.status(400).json({ success: false, message: "id param is required" });
      return;
    }
    const university = await prisma.university.findUnique({ where: { id } });
    if (!university) throw new AppError(404, "University not found");
    res.json({ success: true, data: university });
  } catch (err) { next(err); }
}

export async function updateUniversity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) {
      res.status(400).json({ success: false, message: "id param is required" });
      return;
    }
    const { name, logoUrl, description, status } = req.body;
    const data: Prisma.UniversityUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (logoUrl !== undefined) data.logoUrl = logoUrl;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    const university = await prisma.university.update({ where: { id }, data });
    res.json({ success: true, data: university });
  } catch (err) { next(err); }
}

export async function deactivateUniversity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !id) {
      res.status(400).json({ success: false, message: "id param is required" });
      return;
    }
    const university = await prisma.university.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    res.json({ success: true, data: university });
  } catch (err) { next(err); }
}
