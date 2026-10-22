import type { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/authService.js";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { fullName, email, password, universityId } = req.body;

    // Basic input validation
    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof email !== "string" ||
      !isValidEmail(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8 ||
      typeof universityId !== "string" ||
      !universityId.trim()
    ) {
      res.status(400).json({
        success: false,
        message:
          "Provide a valid full name, email, university ID, and password of at least 8 characters.",
      });
      return;
    }

    const user = await registerUser({
      fullName,
      email,
      password,
      universityId,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_REGISTERED"
    ) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }
    if (error instanceof Error && error.message === "INVALID_UNIVERSITY") {
      res.status(400).json({
        success: false,
        message: "The specified university does not exist.",
      });
      return;
    }

    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !isValidEmail(email.trim()) ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "A valid email and password are required.",
      });
      return;
    }

    const result = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    if (error instanceof Error && error.message === "ACCOUNT_INACTIVE") {
      res.status(403).json({
        success: false,
        message: "This account is inactive.",
      });
      return;
    }

    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = res.locals.authUser;

    const user = await getCurrentUser(authUser);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND_OR_INACTIVE"
    ) {
      res.status(401).json({
        success: false,
        message: "User account not found or inactive.",
      });
      return;
    }

    next(error);
  }
}
