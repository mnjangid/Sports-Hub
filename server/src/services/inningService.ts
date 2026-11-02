
import { Prisma, InningsStatus } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/appError.js";

type CreateInningsInput = {
  matchId: string;
  inningsNumber: number;
  battingTeamId: string;
  bowlingTeamId: string;
};

type ListInningsInput = {
  matchId?: string;
  status?: InningsStatus;
};

type UpdateInningsInput = {
  totalRuns?: number;
  wickets?: number;
  totalBalls?: number;
  status?: InningsStatus;
};

export async function createInnings(input: CreateInningsInput) {
  const {
    matchId,
    inningsNumber,
    battingTeamId,
    bowlingTeamId,
  } = input;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new AppError(404, "Match not found");
  }

  const pairOk =
    (battingTeamId === match.teamAId &&
      bowlingTeamId === match.teamBId) ||
    (battingTeamId === match.teamBId &&
      bowlingTeamId === match.teamAId);

  if (!pairOk) {
    throw new AppError(
      400,
      "Batting and bowling teams must be the two teams playing this match",
    );
  }

  return prisma.innings.create({
    data: {
      matchId,
      inningsNumber,
      battingTeamId,
      bowlingTeamId,
    },
  });
}

export async function listInnings(input: ListInningsInput) {
  const where: Prisma.InningsWhereInput = {};

  if (input.matchId) {
    where.matchId = input.matchId;
  }

  if (input.status) {
    where.status = input.status;
  }

  return prisma.innings.findMany({
    where,
    orderBy: {
      inningsNumber: "asc",
    },
  });
}

export async function getInnings(id: string) {
  const innings = await prisma.innings.findUnique({
    where: { id },
    include: {
      match: {
        select: {
          id: true,
          status: true,
          venue: true,
          scheduledAt: true,
        },
      },
      battingTeam: {
        select: { id: true, name: true },
      },
      bowlingTeam: {
        select: { id: true, name: true },
      },
      _count: {
        select: { scoreEvents: true },
      },
    },
  });

  if (!innings) {
    throw new AppError(404, "Innings not found");
  }

  return innings;
}

export async function updateInnings(
  id: string,
  input: UpdateInningsInput,
) {
  const innings = await prisma.innings.findUnique({
    where: { id },
  });

  if (!innings) {
    throw new AppError(404, "Innings not found");
  }

  const data: Prisma.InningsUncheckedUpdateInput = {};

  if (input.totalRuns !== undefined) {
    data.totalRuns = input.totalRuns;
  }

  if (input.wickets !== undefined) {
    data.wickets = input.wickets;
  }

  if (input.totalBalls !== undefined) {
    data.totalBalls = input.totalBalls;
  }

  if (input.status !== undefined) {
    data.status = input.status;
  }

  return prisma.innings.update({
    where: { id },
    data,
  });
}

export async function deleteInnings(id: string) {
  const innings = await prisma.innings.findUnique({
    where: { id },
  });

  if (!innings) {
    throw new AppError(404, "Innings not found");
  }

  return prisma.innings.delete({
    where: { id },
  });
}
