
import type { Request, Response, NextFunction } from "express";
import { assignCoordinatorToSport } from "../services/coordinatorAssignmentService.js";

export async function assignCoordinator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authUser = res.locals.authUser;
    const { userId, sportId } = req.body;

    if (
      typeof userId !== "string" ||
      !userId.trim() ||
      typeof sportId !== "string" ||
      !sportId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Valid userId and sportId are required.",
      });
      return;
    }

    const assignment = await assignCoordinatorToSport({
      userId: userId.trim(),
      sportId: sportId.trim(),
      assignedBy: authUser.userId,
      universityId: authUser.universityId,
    });

    res.status(201).json({
      success: true,
      message: "Coordinator assigned successfully.",
      data: assignment,
    });
  } catch (error) {
    if (error instanceof Error) {
      const knownErrors: Record<string, { status: number; message: string }> = {
        TARGET_USER_NOT_FOUND: {
          status: 404,
          message: "Active user not found in your university.",
        },
        SPORT_NOT_FOUND: {
          status: 404,
          message: "Active sport not found in your university.",
        },
        ACTIVE_ASSIGNMENT_ALREADY_EXISTS: {
          status: 409,
          message: "This user is already assigned to this sport.",
        },
        COORDINATOR_ROLE_NOT_CONFIGURED: {
          status: 500,
          message: "Coordinator role is not configured.",
        },
      };

      const knownError = knownErrors[error.message];

      if (knownError) {
        res.status(knownError.status).json({
          success: false,
          message: knownError.message,
        });
        return;
      }
    }

    next(error);
  }
}
