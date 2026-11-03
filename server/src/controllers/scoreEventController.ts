import type { Request, Response } from "express";
import {
  createScoreEvent,
  updateScoreEvent,
} from "../services/scoreEventService.js";

export async function createScoreEventController(req: Request, res: Response) {
  try {
    const result = await createScoreEvent(req.body);

    return res.status(201).json({
      success: true,
      message: "Score event created successfully.",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function correctScoreEventController(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid score event ID.",
      });
    }
    const authUser = res.locals.authUser;

    if (!authUser?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await updateScoreEvent(id, authUser.userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Score event corrected successfully.",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}
