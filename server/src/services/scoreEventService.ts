import { prisma } from "../db/prisma.js";

type ExtraType = "WIDE" | "NO_BALL" | "BYE" | "LEG_BYE" | "PENALTY";

type ScoreEventType = "DELIVERY" | "PENALTY_RUNS";

type DismissalType =
  | "BOWLED"
  | "CAUGHT"
  | "LBW"
  | "RUN_OUT"
  | "STUMPED"
  | "HIT_WICKET"
  | "HIT_BALL_TWICE"
  | "OBSTRUCTING_FIELD"
  | "TIMED_OUT"
  | "RETIRED_OUT"
  | "OTHER";

interface CreateScoreEventInput {
  inningsId: string;

  strikerId?: string | null;
  nonStrikerId?: string | null;
  bowlerId?: string | null;

  runsOffBat: number;
  extras: number;
  completedRuns?: number;
  battersCrossed?: boolean;

  extraType?: ExtraType | null;
  eventType?: ScoreEventType;

  dismissedPlayerId?: string | null;
  dismissalType?: DismissalType | null;
  incomingBatterId?: string | null;
}

interface UpdateScoreEventInput {
  runsOffBat?: number;
  extras?: number;
  reason: string;
}

function isSerializationConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2034"
  );
}

async function withSerializationRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isSerializationConflict(error) || attempt >= maxRetries) {
        throw error;
      }

      // Short delay before retrying.
      await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
}

interface BattingPair {
  strikerId: string;
  nonStrikerId: string;
}

interface StrikeRotationInput {
  strikerId: string;
  nonStrikerId: string;
  completedRuns: number;
  isLegalDelivery: boolean;
  totalBallsBefore: number;
  dismissedPlayerId: string | null;
  dismissalType: DismissalType | null;
  battersCrossed: boolean;
  incomingBatterId: string | null;
  wicketsBefore: number;
}

function calculateCreditedRuns(input: {
  eventType: ScoreEventType;
  runsOffBat: number;
  extras: number;
  completedRuns: number;
  extraType: ExtraType | null;
  dismissalType: DismissalType | null;
}): number {
  const {
    eventType,
    runsOffBat,
    extras,
    completedRuns,
    extraType,
    dismissalType,
  } = input;

  // Penalty-run events: all recorded penalty runs count.
  if (eventType === "PENALTY_RUNS") {
    return extras;
  }

  // No dismissal: all normal runs and extras count.
  if (!dismissalType) {
    return runsOffBat + extras;
  }

  // Wide and no-ball penalty: one run is awarded.
  const penaltyRuns = extraType === "WIDE" || extraType === "NO_BALL" ? 1 : 0;

  // Run out and obstructing the field.
  if (dismissalType === "RUN_OUT" || dismissalType === "OBSTRUCTING_FIELD") {
    return completedRuns + penaltyRuns;
  }

  // Other dismissals: only applicable penalty runs count.
  return penaltyRuns;
}

function calculateNextBattingPair(
  input: StrikeRotationInput,
): BattingPair | null {
  const {
    strikerId,
    nonStrikerId,
    completedRuns,
    isLegalDelivery,
    totalBallsBefore,
    dismissedPlayerId,
    dismissalType,
    battersCrossed,
    incomingBatterId,
    wicketsBefore,
  } = input;

  let pair: BattingPair = {
    strikerId,
    nonStrikerId,
  };

  // The 10th wicket ends the innings.
  if (dismissedPlayerId && wicketsBefore + 1 >= 10) {
    return null;
  }

  // Handle a wicket.
  if (dismissedPlayerId) {
    if (!incomingBatterId) {
      throw new Error("Incoming batter is required.");
    }

    // On a run out, crossing determines the batters' ends.
    if (dismissalType === "RUN_OUT" && battersCrossed) {
      pair = {
        strikerId: nonStrikerId,
        nonStrikerId: strikerId,
      };
    }

    // Replace the dismissed batter at their current end.
    if (pair.strikerId === dismissedPlayerId) {
      pair.strikerId = incomingBatterId;
    } else if (pair.nonStrikerId === dismissedPlayerId) {
      pair.nonStrikerId = incomingBatterId;
    }
  } else {
    // Odd completed runs change ends.
    if (completedRuns % 2 !== 0) {
      pair = {
        strikerId: pair.nonStrikerId,
        nonStrikerId: pair.strikerId,
      };
    }
  }

  // At the end of a six-ball over, the batters change ends.
  const overEnded = isLegalDelivery && (totalBallsBefore + 1) % 6 === 0;

  if (overEnded) {
    pair = {
      strikerId: pair.nonStrikerId,
      nonStrikerId: pair.strikerId,
    };
  }

  return pair;
}

export async function createScoreEvent(input: CreateScoreEventInput) {
  const {
    inningsId,
    strikerId = null,
    nonStrikerId = null,
    bowlerId = null,
    runsOffBat,
    extras,
    completedRuns = 0,
    battersCrossed = false,
    extraType = null,
    eventType = "DELIVERY",
    dismissedPlayerId = null,
    dismissalType = null,
    incomingBatterId = null,
  } = input;

  // 1. Basic validation

  if (!Number.isInteger(runsOffBat) || runsOffBat < 0) {
    throw new Error("Runs off bat must be a non-negative integer.");
  }

  if (!Number.isInteger(extras) || extras < 0) {
    throw new Error("Extras must be a non-negative integer.");
  }

  // Validate completed runs
  if (!Number.isInteger(completedRuns) || completedRuns < 0) {
    throw new Error("Completed runs must be a non-negative integer.");
  }

  if (completedRuns > runsOffBat + extras) {
    throw new Error("Completed runs cannot exceed total runs scored.");
  }

  if (eventType === "PENALTY_RUNS" && completedRuns !== 0) {
    throw new Error("Penalty runs cannot have completed runs.");
  }

  if (typeof battersCrossed !== "boolean") {
    throw new Error("battersCrossed must be a boolean.");
  }

  if (battersCrossed && dismissalType !== "RUN_OUT") {
    throw new Error(
      "Batters crossed information is only applicable to run outs.",
    );
  }

  if (eventType !== "DELIVERY" && eventType !== "PENALTY_RUNS") {
    throw new Error("Invalid score event type.");
  }

  if (Boolean(dismissedPlayerId) !== Boolean(dismissalType)) {
    throw new Error(
      "Dismissed player and dismissal type must be provided together.",
    );
  }

  //   if (dismissedPlayerId && !incomingBatterId) {
  //     throw new Error("Incoming batter is required when a wicket falls.");
  //   }

  if (!dismissedPlayerId && incomingBatterId) {
    throw new Error("Incoming batter cannot be provided without a dismissal.");
  }

  // 2. Validate penalty runs

  if (eventType === "PENALTY_RUNS") {
    if (extraType !== "PENALTY" || extras <= 0 || runsOffBat !== 0) {
      throw new Error(
        "Penalty runs require extraType PENALTY, positive extras and zero runs off bat.",
      );
    }

    if (strikerId !== null || nonStrikerId !== null || bowlerId !== null) {
      throw new Error(
        "Penalty run events must not contain striker, non-striker or bowler.",
      );
    }

    if (dismissedPlayerId || dismissalType) {
      throw new Error("Penalty run events cannot record a dismissal.");
    }
  }

  // 3. Validate normal delivery

  if (eventType === "DELIVERY") {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      throw new Error(
        "Striker, non-striker and bowler are required for a delivery.",
      );
    }

    if (strikerId === nonStrikerId) {
      throw new Error("Striker and non-striker must be different players.");
    }

    if (extraType === "PENALTY") {
      throw new Error("PENALTY extras must use the PENALTY_RUNS event type.");
    }

    if (extraType === null && extras !== 0) {
      throw new Error("Extras must be zero when no extra type is specified.");
    }

    if (extraType !== null && extras < 1) {
      throw new Error(
        "Extras must be at least 1 when an extra type is specified.",
      );
    }

    if (
      (extraType === "WIDE" ||
        extraType === "BYE" ||
        extraType === "LEG_BYE") &&
      runsOffBat !== 0
    ) {
      throw new Error(
        "Runs off bat must be zero for wide, bye and leg-bye deliveries.",
      );
    }

    if (extraType === "NO_BALL" && extras < 1) {
      throw new Error("A no-ball must include at least 1 extra run.");
    }

    //  Validate dismissal according to cricket laws.

    if (dismissalType) {
      const normalDismissals: DismissalType[] = [
        "BOWLED",
        "CAUGHT",
        "LBW",
        "RUN_OUT",
        "STUMPED",
        "HIT_WICKET",
        "HIT_BALL_TWICE",
        "OBSTRUCTING_FIELD",
      ];

      const wideDismissals: DismissalType[] = [
        "RUN_OUT",
        "STUMPED",
        "HIT_WICKET",
        "OBSTRUCTING_FIELD",
      ];

      const noBallDismissals: DismissalType[] = [
        "RUN_OUT",
        "HIT_BALL_TWICE",
        "OBSTRUCTING_FIELD",
      ];

      let allowedDismissals = normalDismissals;

      if (extraType === "WIDE") {
        allowedDismissals = wideDismissals;
      } else if (extraType === "NO_BALL") {
        allowedDismissals = noBallDismissals;
      }

      if (!allowedDismissals.includes(dismissalType)) {
        throw new Error(
          `Dismissal type ${dismissalType} is not permitted on this delivery.`,
        );
      }

      // Only run out and obstructing the field can dismiss
      // the non-striker through this delivery flow.
      if (
        dismissedPlayerId !== strikerId &&
        dismissalType !== "RUN_OUT" &&
        dismissalType !== "OBSTRUCTING_FIELD"
      ) {
        throw new Error("This dismissal type can only dismiss the striker.");
      }
    }
  }

  const totalRuns = runsOffBat + extras;

  // Penalty events and wide/no-ball deliveries are not legal balls.
  const isLegalDelivery =
    eventType === "DELIVERY" && extraType !== "WIDE" && extraType !== "NO_BALL";

  const creditedRuns = calculateCreditedRuns({
    eventType,
    runsOffBat,
    extras,
    completedRuns,
    extraType,
    dismissalType,
  });

  // 4. Database transaction

  return withSerializationRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const innings = await tx.innings.findUnique({
          where: { id: inningsId },
          include: { match: true },
        });

        if (!innings) {
          throw new Error("Innings not found.");
        }

        if (
          dismissedPlayerId &&
          innings.wickets + 1 < 10 &&
          !incomingBatterId
        ) {
          throw new Error("Incoming batter is required when a wicket falls.");
        }

        if (innings.status !== "IN_PROGRESS") {
          throw new Error("Innings is not in progress.");
        }

        if (innings.match.status !== "LIVE") {
          throw new Error("Match is not live.");
        }

        const { battingTeamId, bowlingTeamId, match } = innings;

        if (
          battingTeamId === bowlingTeamId ||
          ![match.teamAId, match.teamBId].includes(battingTeamId) ||
          ![match.teamAId, match.teamBId].includes(bowlingTeamId)
        ) {
          throw new Error("Invalid batting or bowling teams.");
        }

        // 5. Validate player memberships only for deliveries.

        if (eventType === "DELIVERY") {
          const memberships = await tx.teamMembership.findMany({
            where: {
              tournamentId: match.tournamentId,
              status: "ACTIVE",
              userId: {
                in: [
                  strikerId!,
                  nonStrikerId!,
                  bowlerId!,
                  ...(incomingBatterId ? [incomingBatterId] : []),
                ],
              },
              teamId: {
                in: [battingTeamId, bowlingTeamId],
              },
            },
          });

          if (dismissedPlayerId && incomingBatterId) {
            // Validate incoming batter belongs to batting team.
            if (
              incomingBatterId &&
              !memberships.some(
                (membership) =>
                  membership.userId === incomingBatterId &&
                  membership.teamId === innings.battingTeamId &&
                  membership.status === "ACTIVE",
              )
            ) {
              throw new Error(
                "Incoming batter must be an active member of the batting team.",
              );
            }

            // Incoming batter must be different from current batters.
            if (
              incomingBatterId &&
              [strikerId, nonStrikerId].includes(incomingBatterId)
            ) {
              throw new Error(
                "Incoming batter must be different from the current batters.",
              );
            }
          }

          if (dismissedPlayerId && incomingBatterId) {
            const previousDismissal = await tx.scoreEvent.findFirst({
              where: {
                inningsId,
                dismissedPlayerId: incomingBatterId,
              },
            });

            if (previousDismissal) {
              throw new Error(
                "This player has already been dismissed in this innings.",
              );
            }
          }

          const isActiveMember = (userId: string, teamId: string) =>
            memberships.some(
              (membership) =>
                membership.userId === userId && membership.teamId === teamId,
            );

          if (
            !isActiveMember(strikerId!, battingTeamId) ||
            !isActiveMember(nonStrikerId!, battingTeamId) ||
            !isActiveMember(bowlerId!, bowlingTeamId)
          ) {
            throw new Error(
              "One or more players are not active members of the correct team.",
            );
          }

          if (
            dismissedPlayerId &&
            dismissedPlayerId !== strikerId &&
            dismissedPlayerId !== nonStrikerId
          ) {
            throw new Error(
              "Dismissed player must be the striker or non-striker.",
            );
          }
        }

        // 6. Generate the next sequence number.

        const lastEvent = await tx.scoreEvent.aggregate({
          where: { inningsId },
          _max: { sequenceNumber: true },
        });

        const sequenceNumber = (lastEvent._max.sequenceNumber ?? 0) + 1;

        // 7. Create score event.

        const scoreEvent = await tx.scoreEvent.create({
          data: {
            inningsId,
            sequenceNumber,

            strikerId,
            nonStrikerId,
            bowlerId,

            runsOffBat,
            extras,
            completedRuns,
            battersCrossed,
            extraType,
            eventType,
            isLegalDelivery,

            dismissedPlayerId,
            dismissalType,
          },
        });

        const nextBattingPair = calculateNextBattingPair({
          strikerId: strikerId!,
          nonStrikerId: nonStrikerId!,
          completedRuns,
          isLegalDelivery,
          totalBallsBefore: innings.totalBalls,
          dismissedPlayerId: dismissedPlayerId ?? null,
          dismissalType: dismissalType ?? null,
          battersCrossed,
          incomingBatterId: incomingBatterId ?? null,
          wicketsBefore: innings.wickets,
        });

        // 8. Update innings totals in the same transaction.

        await tx.innings.update({
          where: {
            id: inningsId,
          },
          data: {
            totalRuns: {
              increment: creditedRuns,
            },
            wickets: {
              increment: dismissedPlayerId ? 1 : 0,
            },
            totalBalls: {
              increment: isLegalDelivery ? 1 : 0,
            },
            status:
              dismissedPlayerId && innings.wickets + 1 >= 10
                ? "COMPLETED"
                : "IN_PROGRESS",
          },
        });

        return {
          scoreEvent,
          nextBattingPair,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    ),
  );
}




// export async function updateScoreEvent(
//   scoreEventId: string,
//   editedBy: string,
//   input: UpdateScoreEventInput,
// ) {
//   if (!input.reason.trim()) {
//     throw new Error("Correction reason is required.");
//   }

//   if (input.reason.trim().length > 500) {
//     throw new Error("Correction reason cannot exceed 500 characters.");
//   }

//   return prisma.$transaction(
//     async (tx) => {
//       const existingEvent = await tx.scoreEvent.findUnique({
//         where: { id: scoreEventId },
//       });

//       if (!existingEvent) {
//         throw new Error("Score event not found.");
//       }

//       // More validation and correction logic will be added here.

//       const innings = await tx.innings.findUnique({
//         where: { id: existingEvent.inningsId },
//         include: { match: true },
//       });

//       if (!innings) {
//         throw new Error("Innings not found.");
//       }

//       if (innings.status === "COMPLETED") {
//         throw new Error("Cannot correct a completed innings.");
//       }

//       if (innings.match.status !== "LIVE") {
//         throw new Error("Cannot correct scores when the match is not live.");
//       }
//       const previousValues = {
//         runsOffBat: existingEvent.runsOffBat,
//         extras: existingEvent.extras,
//         completedRuns: existingEvent.completedRuns,
//         battersCrossed: existingEvent.battersCrossed,
//         extraType: existingEvent.extraType,
//         eventType: existingEvent.eventType,
//         isLegalDelivery: existingEvent.isLegalDelivery,
//         dismissedPlayerId: existingEvent.dismissedPlayerId,
//         dismissalType: existingEvent.dismissalType,
//       };

//       const updatedValues = {
//         runsOffBat: input.runsOffBat ?? existingEvent.runsOffBat,
//         extras: input.extras ?? existingEvent.extras,
//         completedRuns: input.completedRuns ?? existingEvent.completedRuns,
//         battersCrossed: input.battersCrossed ?? existingEvent.battersCrossed,
//         extraType:
//           input.extraType !== undefined
//             ? input.extraType
//             : existingEvent.extraType,
//         eventType: input.eventType ?? existingEvent.eventType,
//         dismissedPlayerId:
//           input.dismissedPlayerId !== undefined
//             ? input.dismissedPlayerId
//             : existingEvent.dismissedPlayerId,
//         dismissalType:
//           input.dismissalType !== undefined
//             ? input.dismissalType
//             : existingEvent.dismissalType,
//       };

//       if (
//         !Number.isInteger(updatedValues.runsOffBat) ||
//         updatedValues.runsOffBat < 0
//       ) {
//         throw new Error("Runs off bat must be a non-negative integer.");
//       }

//       if (!Number.isInteger(updatedValues.extras) || updatedValues.extras < 0) {
//         throw new Error("Extras must be a non-negative integer.");
//       }

//       if (
//         !Number.isInteger(updatedValues.completedRuns) ||
//         updatedValues.completedRuns < 0
//       ) {
//         throw new Error("Completed runs must be a non-negative integer.");
//       }

//       if (
//         updatedValues.completedRuns >
//         updatedValues.runsOffBat + updatedValues.extras
//       ) {
//         throw new Error("Completed runs cannot exceed total runs.");
//       }

//       if (typeof updatedValues.battersCrossed !== "boolean") {
//         throw new Error("Invalid batters crossed value.");
//       }
//       if (updatedValues.eventType !== existingEvent.eventType) {
//         throw new Error(
//           "Changing the score event type is not supported during correction.",
//         );
//       }

//       if (updatedValues.eventType === "PENALTY_RUNS") {
//         if (
//           updatedValues.extraType !== "PENALTY" ||
//           updatedValues.extras <= 0 ||
//           updatedValues.runsOffBat !== 0 ||
//           updatedValues.completedRuns !== 0 ||
//           updatedValues.dismissedPlayerId !== null ||
//           updatedValues.dismissalType !== null
//         ) {
//           throw new Error("Invalid penalty runs correction.");
//         }
//       } else {
//         if (updatedValues.extraType === "PENALTY") {
//           throw new Error(
//             "Penalty extras are only allowed for penalty-run events.",
//           );
//         }

//         if (
//           (updatedValues.extraType === "WIDE" ||
//             updatedValues.extraType === "NO_BALL") &&
//           updatedValues.extras < 1
//         ) {
//           throw new Error(
//             "Wide and no-ball deliveries must have at least one extra run.",
//           );
//         }

//         if (
//           (updatedValues.extraType === "WIDE" ||
//             updatedValues.extraType === "BYE" ||
//             updatedValues.extraType === "LEG_BYE") &&
//           updatedValues.runsOffBat !== 0
//         ) {
//           throw new Error("Runs off bat must be zero for this extra type.");
//         }

//         if (updatedValues.extraType === null && updatedValues.extras !== 0) {
//           throw new Error("Extras type is required when extras are recorded.");
//         }
//       }
//       if (
//         (updatedValues.dismissedPlayerId === null) !==
//         (updatedValues.dismissalType === null)
//       ) {
//         throw new Error(
//           "Dismissed player and dismissal type must be provided together.",
//         );
//       }

//       if (
//         updatedValues.dismissalType &&
//         updatedValues.eventType !== "DELIVERY"
//       ) {
//         throw new Error("Penalty runs cannot record a dismissal.");
//       }

//       if (
//         updatedValues.dismissalType &&
//         ![
//           "BOWLED",
//           "CAUGHT",
//           "LBW",
//           "RUN_OUT",
//           "STUMPED",
//           "HIT_WICKET",
//           "HIT_BALL_TWICE",
//           "OBSTRUCTING_FIELD",
//         ].includes(updatedValues.dismissalType)
//       ) {
//         throw new Error("Invalid dismissal type.");
//       }
//       if (updatedValues.dismissalType) {
//         const extraType = updatedValues.extraType;

//         const allowedDismissals: DismissalType[] =
//           extraType === "WIDE"
//             ? ["RUN_OUT", "STUMPED", "HIT_WICKET", "OBSTRUCTING_FIELD"]
//             : extraType === "NO_BALL"
//               ? ["RUN_OUT", "HIT_BALL_TWICE", "OBSTRUCTING_FIELD"]
//               : [
//                   "BOWLED",
//                   "CAUGHT",
//                   "LBW",
//                   "RUN_OUT",
//                   "STUMPED",
//                   "HIT_WICKET",
//                   "HIT_BALL_TWICE",
//                   "OBSTRUCTING_FIELD",
//                 ];

//         if (!allowedDismissals.includes(updatedValues.dismissalType)) {
//           throw new Error(
//             "This dismissal type is not allowed for the selected delivery.",
//           );
//         }

//         if (
//           updatedValues.dismissalType !== "RUN_OUT" &&
//           updatedValues.dismissalType !== "OBSTRUCTING_FIELD" &&
//           updatedValues.dismissedPlayerId !== existingEvent.strikerId
//         ) {
//           throw new Error(
//             "Only run out or obstructing the field can dismiss the non-striker.",
//           );
//         }

//         if (
//           updatedValues.dismissalType === "RUN_OUT" ||
//           updatedValues.dismissalType === "OBSTRUCTING_FIELD"
//         ) {
//           if (
//             updatedValues.dismissedPlayerId !== existingEvent.strikerId &&
//             updatedValues.dismissedPlayerId !== existingEvent.nonStrikerId
//           ) {
//             throw new Error(
//               "Dismissed player must be one of the two active batters.",
//             );
//           }
//         }
//       }

//       const updatedIsLegalDelivery =
//         updatedValues.eventType === "DELIVERY" &&
//         updatedValues.extraType !== "WIDE" &&
//         updatedValues.extraType !== "NO_BALL";

//       const creditedRuns = calculateCreditedRuns({
//         eventType: updatedValues.eventType,
//         runsOffBat: updatedValues.runsOffBat,
//         extras: updatedValues.extras,
//         completedRuns: updatedValues.completedRuns,
//         extraType: updatedValues.extraType,
//         dismissalType: updatedValues.dismissalType,
//       });
//       const scoreEvent = await tx.scoreEvent.update({
//         where: { id: scoreEventId },
//         data: {
//           runsOffBat: updatedValues.runsOffBat,
//           extras: updatedValues.extras,
//           completedRuns: updatedValues.completedRuns,
//           battersCrossed: updatedValues.battersCrossed,
//           extraType: updatedValues.extraType,
//           eventType: updatedValues.eventType,
//           isLegalDelivery: updatedIsLegalDelivery,
//           dismissedPlayerId: updatedValues.dismissedPlayerId,
//           dismissalType: updatedValues.dismissalType,
//         },
//       });

//       const newValues = {
//         runsOffBat: scoreEvent.runsOffBat,
//         extras: scoreEvent.extras,
//         completedRuns: scoreEvent.completedRuns,
//         battersCrossed: scoreEvent.battersCrossed,
//         extraType: scoreEvent.extraType,
//         eventType: scoreEvent.eventType,
//         isLegalDelivery: scoreEvent.isLegalDelivery,
//         dismissedPlayerId: scoreEvent.dismissedPlayerId,
//         dismissalType: scoreEvent.dismissalType,
//       };

//       await tx.scoreEventRevision.create({
//         data: {
//           scoreEventId,
//           editedBy,
//           previousValues,
//           newValues,
//           reason: input.reason.trim(),
//         },
//       });
//       const allScoreEvents = await tx.scoreEvent.findMany({
//         where: { inningsId: existingEvent.inningsId },
//       });

//       const totalRuns = allScoreEvents.reduce((total, event) => {
//         return (
//           total +
//           calculateCreditedRuns({
//             eventType: event.eventType,
//             runsOffBat: event.runsOffBat,
//             extras: event.extras,
//             completedRuns: event.completedRuns,
//             extraType: event.extraType,
//             dismissalType: event.dismissalType,
//           })
//         );
//       }, 0);

//       const totalWickets = allScoreEvents.filter(
//         (event) => event.dismissedPlayerId !== null,
//       ).length;

//       const totalBalls = allScoreEvents.filter(
//         (event) => event.isLegalDelivery,
//       ).length;

//       const inningsStatus = totalWickets >= 10 ? "COMPLETED" : "IN_PROGRESS";

//       const updatedInnings = await tx.innings.update({
//         where: { id: existingEvent.inningsId },
//         data: {
//           totalRuns,
//           wickets: totalWickets,
//           totalBalls,
//           status: inningsStatus,
//         },
//       });
//       return {
//         scoreEvent,
//         innings: updatedInnings,
//         revision: newValues,
//       };
//     },
//     {
//       isolationLevel: "Serializable",
//     },
//   );
// }



export async function updateScoreEvent(
  scoreEventId: string,
  editedBy: string,
  input: UpdateScoreEventInput,
) {
  const reason = input.reason.trim();

  if (!reason) {
    throw new Error("Correction reason is required.");
  }

  if (reason.length > 500) {
    throw new Error("Correction reason cannot exceed 500 characters.");
  }

  return withSerializationRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const existingEvent = await tx.scoreEvent.findUnique({
          where: { id: scoreEventId },
        });

        if (!existingEvent) {
          throw new Error("Score event not found.");
        }

        const innings = await tx.innings.findUnique({
          where: { id: existingEvent.inningsId },
          include: { match: true },
        });

        if (!innings) {
          throw new Error("Innings not found.");
        }

        if (innings.status === "COMPLETED") {
          throw new Error("Cannot correct a completed innings.");
        }

        if (innings.match.status !== "LIVE") {
          throw new Error("Cannot correct scores when the match is not live.");
        }

        const updatedRunsOffBat =
          input.runsOffBat ?? existingEvent.runsOffBat;

        const updatedExtras = input.extras ?? existingEvent.extras;

        if (
          !Number.isInteger(updatedRunsOffBat) ||
          updatedRunsOffBat < 0
        ) {
          throw new Error("Runs off bat must be a non-negative integer.");
        }

        if (
          !Number.isInteger(updatedExtras) ||
          updatedExtras < 0
        ) {
          throw new Error("Extras must be a non-negative integer.");
        }

        if (
          existingEvent.completedRuns >
          updatedRunsOffBat + updatedExtras
        ) {
          throw new Error("Completed runs cannot exceed total runs.");
        }

        if (existingEvent.eventType === "PENALTY_RUNS") {
          if (
            updatedRunsOffBat !== 0 ||
            updatedExtras <= 0
          ) {
            throw new Error("Invalid penalty runs correction.");
          }
        } else {
          if (existingEvent.extraType === "PENALTY") {
            throw new Error(
              "Penalty extras are only allowed for penalty-run events.",
            );
          }

          if (
            (existingEvent.extraType === "WIDE" ||
              existingEvent.extraType === "NO_BALL") &&
            updatedExtras < 1
          ) {
            throw new Error(
              "Wide and no-ball deliveries must have at least one extra run.",
            );
          }

          if (
            (existingEvent.extraType === "WIDE" ||
              existingEvent.extraType === "BYE" ||
              existingEvent.extraType === "LEG_BYE") &&
            updatedRunsOffBat !== 0
          ) {
            throw new Error(
              "Runs off bat must be zero for this extra type.",
            );
          }

          if (
            existingEvent.extraType === null &&
            updatedExtras !== 0
          ) {
            throw new Error(
              "Extras type is required when extras are recorded.",
            );
          }
        }

        const previousValues = {
          runsOffBat: existingEvent.runsOffBat,
          extras: existingEvent.extras,
        };

        const scoreEvent = await tx.scoreEvent.update({
          where: { id: scoreEventId },
          data: {
            runsOffBat: updatedRunsOffBat,
            extras: updatedExtras,
          },
        });

        const newValues = {
          runsOffBat: scoreEvent.runsOffBat,
          extras: scoreEvent.extras,
        };

        const revision = await tx.scoreEventRevision.create({
          data: {
            scoreEventId,
            editedBy,
            previousValues,
            newValues,
            reason,
          },
        });

        const allScoreEvents = await tx.scoreEvent.findMany({
          where: { inningsId: existingEvent.inningsId },
        });

        const totalRuns = allScoreEvents.reduce(
          (total, event) =>
            total +
            calculateCreditedRuns({
              eventType: event.eventType,
              runsOffBat: event.runsOffBat,
              extras: event.extras,
              completedRuns: event.completedRuns,
              extraType: event.extraType,
              dismissalType: event.dismissalType,
            }),
          0,
        );

        const updatedInnings = await tx.innings.update({
          where: { id: existingEvent.inningsId },
          data: { totalRuns },
        });

        return {
          scoreEvent,
          innings: updatedInnings,
          revision,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    ),
  );
}
