
import { Prisma, MatchStatus } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/appError.js";

type CreateMatchInput = {
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  venue?: string;
  scheduledAt?: Date;
};

type ListMatchesInput = {
  tournamentId?: string;
  teamId?: string;
  status?: MatchStatus;
};

type UpdateMatchInput = {
  venue?: string | null;
  scheduledAt?: Date | null;
  status?: MatchStatus;
  winnerTeamId?: string | null;
  resultDescription?: string | null;
};

export async function createMatch(input: CreateMatchInput) {
  const { tournamentId, teamAId, teamBId, venue, scheduledAt } = input;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });

  if (!tournament) {
    throw new AppError(404, "Tournament not found");
  }

  const [teamA, teamB] = await Promise.all([
    prisma.team.findUnique({ where: { id: teamAId } }),
    prisma.team.findUnique({ where: { id: teamBId } }),
  ]);

  if (!teamA) {
    throw new AppError(404, "Team A not found");
  }

  if (!teamB) {
    throw new AppError(404, "Team B not found");
  }

  if (
    teamA.tournamentId !== tournamentId ||
    teamB.tournamentId !== tournamentId
  ) {
    throw new AppError(400, "Both teams must belong to this tournament");
  }

  const data: Prisma.MatchUncheckedCreateInput = {
    tournamentId,
    teamAId,
    teamBId,
  };

  if (venue !== undefined) data.venue = venue;
  if (scheduledAt !== undefined) data.scheduledAt = scheduledAt;

  return prisma.match.create({ data });
}

export async function listMatches(input: ListMatchesInput) {
  const where: Prisma.MatchWhereInput = {};

  if (input.tournamentId) {
    where.tournamentId = input.tournamentId;
  }

  if (input.status) {
    where.status = input.status;
  }

  if (input.teamId) {
    where.OR = [
      { teamAId: input.teamId },
      { teamBId: input.teamId },
    ];
  }

  return prisma.match.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getMatch(id: string) {
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      tournament: {
        select: { id: true, name: true },
      },
      teamA: {
        select: { id: true, name: true },
      },
      teamB: {
        select: { id: true, name: true },
      },
      winnerTeam: {
        select: { id: true, name: true },
      },
      innings: {
        orderBy: { inningsNumber: "asc" },
      },
    },
  });

  if (!match) {
    throw new AppError(404, "Match not found");
  }

  return match;
}

export async function updateMatch(
  id: string,
  input: UpdateMatchInput,
) {
  const match = await prisma.match.findUnique({
    where: { id },
  });

  if (!match) {
    throw new AppError(404, "Match not found");
  }

  if (
    input.winnerTeamId !== undefined &&
    input.winnerTeamId !== null &&
    input.winnerTeamId !== match.teamAId &&
    input.winnerTeamId !== match.teamBId
  ) {
    throw new AppError(
      400,
      "winnerTeamId must be one of the two teams in this match",
    );
  }

  const data: Prisma.MatchUncheckedUpdateInput = {};

  if (input.venue !== undefined) data.venue = input.venue;
  if (input.scheduledAt !== undefined) {
    data.scheduledAt = input.scheduledAt;
  }
  if (input.status !== undefined) data.status = input.status;
  if (input.winnerTeamId !== undefined) {
    data.winnerTeamId = input.winnerTeamId;
  }
  if (input.resultDescription !== undefined) {
    data.resultDescription = input.resultDescription;
  }

  return prisma.match.update({
    where: { id },
    data,
  });
}

export async function deleteMatch(id: string) {
  const match = await prisma.match.findUnique({
    where: { id },
  });

  if (!match) {
    throw new AppError(404, "Match not found");
  }

  return prisma.match.delete({
    where: { id },
  });
}
