import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/appError.js";

const TEAM_ROLES = ["MEMBER", "CAPTAIN", "VICE_CAPTAIN"] as const;
const MEMBERSHIP_STATUSES = ["ACTIVE", "LEFT", "REMOVED"] as const;

type TeamRole = (typeof TEAM_ROLES)[number];
type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

type AddTeamMemberInput = {
  teamId: string;
  userId: string;
  teamRole?: TeamRole;
};

type UpdateTeamMemberInput = {
  teamRole?: TeamRole;
  status?: MembershipStatus;
};

function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new AppError(
        409,
        "A conflicting team membership or captain assignment already exists.",
      );
    }

    if (error.code === "P2025") {
      throw new AppError(404, "Team membership or team not found.");
    }

    if (error.code === "P2003" || error.code === "P2014") {
      throw new AppError(409, "This change conflicts with related records.");
    }
  }

  throw error;
}

export async function addTeamMember(input: AddTeamMemberInput) {
  const team = await prisma.team.findUnique({
    where: { id: input.teamId },
    select: {
      id: true,
      tournamentId: true,
      tournament: {
        select: {
          sport: {
            select: {
              universityId: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw new AppError(404, "Team not found.");
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      universityId: true,
      status: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError(400, "This user account is not active.");
  }

  if (user.universityId !== team.tournament.sport.universityId) {
    throw new AppError(
      403,
      "User and team must belong to the same university.",
    );
  }

  const existingMembership = await prisma.teamMembership.findFirst({
    where: {
      tournamentId: team.tournamentId,
      userId: user.id,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (existingMembership) {
    throw new AppError(
      409,
      "User is already an active member of a team in this tournament.",
    );
  }

  if (existingMembership) {
    throw new AppError(409, "User is already an active member of this team.");
  }

  const teamRole = input.teamRole ?? "MEMBER";

  if (teamRole === "CAPTAIN") {
    const existingCaptain = await prisma.teamMembership.findFirst({
      where: {
        teamId: team.id,
        status: "ACTIVE",
        teamRole: "CAPTAIN",
      },
      select: { id: true },
    });

    if (existingCaptain) {
      throw new AppError(409, "This team already has an active captain.");
    }
  }

  try {
    return await prisma.teamMembership.create({
      data: {
        teamId: team.id,
        tournamentId: team.tournamentId,
        userId: user.id,
        teamRole,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function listTeamMembers(filters: {
  teamId?: string;
  userId?: string;
  tournamentId?: string;
  status?: MembershipStatus;
}) {
  const where: Prisma.TeamMembershipWhereInput = {};

  if (filters.teamId) where.teamId = filters.teamId;
  if (filters.userId) where.userId = filters.userId;
  if (filters.tournamentId) where.tournamentId = filters.tournamentId;
  if (filters.status) where.status = filters.status;

  return prisma.teamMembership.findMany({
    where,
    orderBy: { joinedAt: "asc" },
    include: {
      team: {
        select: { id: true, name: true },
      },
      user: {
        select: { id: true, fullName: true },
      },
    },
  });
}

export async function getTeamMember(id: string) {
  const membership = await prisma.teamMembership.findUnique({
    where: { id },
    include: {
      team: {
        select: { id: true, name: true },
      },
      user: {
        select: { id: true, fullName: true },
      },
    },
  });

  if (!membership) {
    throw new AppError(404, "Team membership not found.");
  }

  return membership;
}

export async function updateTeamMember(
  id: string,
  input: UpdateTeamMemberInput,
) {
  const existing = await prisma.teamMembership.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, "Team membership not found.");
  }

  if (input.teamRole === undefined && input.status === undefined) {
    throw new AppError(400, "Provide at least one field to update.");
  }

  const nextStatus = input.status ?? existing.status;
  const nextRole = input.teamRole ?? existing.teamRole;

  if (nextStatus === "ACTIVE") {
    const existingMembership = await prisma.teamMembership.findFirst({
      where: {
        tournamentId: existing.tournamentId,
        userId: existing.userId,
        status: "ACTIVE",
        id: { not: id },
      },
      select: { id: true },
    });

    if (existingMembership) {
      throw new AppError(
        409,
        "User is already active in another team in this tournament.",
      );
    }
  }

  if (nextStatus === "ACTIVE" && nextRole === "CAPTAIN") {
    const existingCaptain = await prisma.teamMembership.findFirst({
      where: {
        teamId: existing.teamId,
        status: "ACTIVE",
        teamRole: "CAPTAIN",
        id: { not: id },
      },
      select: { id: true },
    });

    if (existingCaptain) {
      throw new AppError(409, "This team already has an active captain.");
    }
  }

  const data: Prisma.TeamMembershipUpdateInput = {};

  if (input.teamRole !== undefined) {
    data.teamRole = input.teamRole;
  }

  if (input.status !== undefined) {
    data.status = input.status;
    data.leftAt = input.status === "ACTIVE" ? null : new Date();
  }

  try {
    return await prisma.teamMembership.update({
      where: { id },
      data,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function removeTeamMember(id: string) {
  const existing = await prisma.teamMembership.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!existing) {
    throw new AppError(404, "Team membership not found.");
  }

  if (existing.status === "REMOVED") {
    throw new AppError(409, "This membership has already been removed.");
  }

  try {
    return await prisma.teamMembership.update({
      where: { id },
      data: {
        status: "REMOVED",
        leftAt: new Date(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
}
