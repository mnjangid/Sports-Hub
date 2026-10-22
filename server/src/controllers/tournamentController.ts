import type { Request, Response, NextFunction } from "express";
import {
  getAllTournaments,
  getTournamentById,
  createTournament,
} from "../services/tournamentService.js";
import { TournamentFormat } from "../../generated/prisma/client.js";

export async function getTournaments(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tournaments = await getAllTournaments();

    res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTournamentByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid tournament ID",
      });
      return;
    }

    const tournament = await getTournamentById(id);

    if (!tournament) {
      res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: tournament,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTournamentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      name,
      description,
      sportId,
      createdBy,
      format,
      startDate,
      endDate,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof sportId !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "name and sportId are required",
      });
      return;
    }

    const tournament = await createTournament({
      name: name.trim(),
      sportId,
      createdBy: res.locals.authUser.userId,
      ...(typeof description === "string" && {
        description,
      }),
      ...(typeof format === "string" &&
        Object.values(TournamentFormat).includes(
          format as (typeof TournamentFormat)[keyof typeof TournamentFormat],
        ) && {
          format:
            format as (typeof TournamentFormat)[keyof typeof TournamentFormat],
        }),
      ...(typeof startDate === "string" &&
        !Number.isNaN(Date.parse(startDate)) && {
          startDate: new Date(startDate),
        }),
      ...(typeof endDate === "string" &&
        !Number.isNaN(Date.parse(endDate)) && {
          endDate: new Date(endDate),
        }),
    });

    res.status(201).json({
      success: true,
      message: "Tournament created successfully",
      data: tournament,
    });
  } catch (error) {
    next(error);
  }
}
