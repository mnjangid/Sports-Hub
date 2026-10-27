
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/appError.js";

type CreateTeamInput = {
  tournamentId: string;
  name: string;
  logoUrl?: string | null;
};

type UpdateTeamInput = {
  name?: string;
  logoUrl?: string | null;
};

function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new AppError(
        409,
        "A team with this name already exists in this tournament.",
      );
    }

    if (error.code === "P2025") {
      throw new AppError(404, "Team not found.");
    }

    if (error.code === "P2003" || error.code === "P2014") {
      throw new AppError(
        409,
        "Team has players or matches. Remove its dependencies first.",
      );
    }
  }

  throw error;
}

export async function createTeam(input: CreateTeamInput) {
  const name = input.name.trim();

  if (!name) {
    throw new AppError(400, "Team name cannot be empty.");
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: input.tournamentId },
    select: { id: true },
  });

  if (!tournament) {
    throw new AppError(404, "Tournament not found.");
  }

  try {
    return await prisma.team.create({
      data: {
        tournamentId: input.tournamentId,
        name,
        logoUrl: input.logoUrl ?? null,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function listTeams(tournamentId?: string) {
  return prisma.team.findMany({
    ...(tournamentId ? { where: { tournamentId } } : {}),
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeam(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });

  if (!team) {
    throw new AppError(404, "Team not found.");
  }

  return team;
}

export async function updateTeam(
  id: string,
  input: UpdateTeamInput,
) {
  const data: Prisma.TeamUpdateInput = {};

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      throw new AppError(400, "Team name cannot be empty.");
    }

    data.name = name;
  }

  if (input.logoUrl !== undefined) {
    data.logoUrl = input.logoUrl;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(400, "Provide at least one field to update.");
  }

  try {
    return await prisma.team.update({
      where: { id },
      data,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteTeam(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          memberships: true,
          matchesAsTeamA: true,
          matchesAsTeamB: true,
          matchesWon: true,
          battingInnings: true,
          bowlingInnings: true,
        },
      },
    },
  });

  if (!team) {
    throw new AppError(404, "Team not found.");
  }

  const counts = team._count;
  const hasDependencies =
    counts.memberships > 0 ||
    counts.matchesAsTeamA > 0 ||
    counts.matchesAsTeamB > 0 ||
    counts.matchesWon > 0 ||
    counts.battingInnings > 0 ||
    counts.bowlingInnings > 0;

  if (hasDependencies) {
    throw new AppError(
      409,
      "Team has players or match history. It cannot be deleted.",
    );
  }

  try {
    return await prisma.team.delete({
      where: { id },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}
