
import { prisma } from "../db/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

export async function getAllTournaments() {
  return prisma.tournament.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}


export async function getTournamentById(id: string) {
  return prisma.tournament.findUnique({
    where: {
      id,
    },
    include: {
      sport: true,
      teams: true,
    },
  });
}


export async function createTournament(data: {
  name: string;
  description?: string;
  sportId: string;
  createdBy: string;
  format?: Prisma.TournamentCreateInput["format"];
  startDate?: Date;
  endDate?: Date;
}) {
  return prisma.tournament.create({
    
    data: {
      name: data.name,
      ...(data.description !== undefined && {
        description: data.description,
      }),
      sport: {
        connect: { id: data.sportId },
      },
      creator: {
        connect: { id: data.createdBy },
      },
      ...(data.format !== undefined && {
        format: data.format,
      }),
      ...(data.startDate !== undefined && {
        startDate: data.startDate,
      }),
      ...(data.endDate !== undefined && {
        endDate: data.endDate,
      }),
    },

  });
}