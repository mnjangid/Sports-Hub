
import { prisma } from "../db/prisma.js";

type AssignCoordinatorInput = {
  userId: string;
  sportId: string;
  assignedBy: string;
  universityId: string;
};

export async function assignCoordinatorToSport(
  input: AssignCoordinatorInput,
) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify the target user belongs to this university and is active.
    const user = await tx.user.findFirst({
      where: {
        id: input.userId,
        universityId: input.universityId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (!user) {
      throw new Error("TARGET_USER_NOT_FOUND");
    }

    // 2. Verify the sport belongs to this university and is active.
    const sport = await tx.sport.findFirst({
      where: {
        id: input.sportId,
        universityId: input.universityId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (!sport) {
      throw new Error("SPORT_NOT_FOUND");
    }

    // 3. Check whether this coordinator already has an active assignment.
    const existingAssignment = await tx.coordinatorAssignment.findFirst({
      where: {
        userId: input.userId,
        sportId: input.sportId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (existingAssignment) {
      throw new Error("ACTIVE_ASSIGNMENT_ALREADY_EXISTS");
    }

    // 4. Ensure the user has the COORDINATOR role.
    const coordinatorRole = await tx.role.findUnique({
      where: { name: "COORDINATOR" },
      select: { id: true },
    });

    if (!coordinatorRole) {
      throw new Error("COORDINATOR_ROLE_NOT_CONFIGURED");
    }

    await tx.userRole.upsert({
      where: {
        userId_roleId: {
          userId: input.userId,
          roleId: coordinatorRole.id,
        },
      },
      create: {
        userId: input.userId,
        roleId: coordinatorRole.id,
      },
      update: {},
    });

    // 5. Create the assignment while retaining its audit information.
    return tx.coordinatorAssignment.create({
      data: {
        userId: input.userId,
        sportId: input.sportId,
        assignedBy: input.assignedBy,
        status: "ACTIVE",
      },
    });
  });
}
