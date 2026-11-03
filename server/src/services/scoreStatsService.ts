
import { prisma } from "../db/prisma.js";

const BOWLER_CREDITED_WICKETS = new Set([
  "BOWLED",
  "CAUGHT",
  "LBW",
  "STUMPED",
  "HIT_WICKET",
]);

export async function getInningsScorecard(inningsId: string) {
  const innings = await prisma.innings.findUnique({
    where: { id: inningsId },
    include: { match: true },
  });

  if (!innings) {
    throw new Error("Innings not found.");
  }

  const events = await prisma.scoreEvent.findMany({
    where: { inningsId },
    include: {
      striker: {
        select: { id: true, fullName: true },
      },
      nonStriker: {
        select: { id: true, fullName: true },
      },
      bowler: {
        select: { id: true, fullName: true },
      },
      dismissedPlayer: {
        select: { id: true, fullName: true },
      },
    },
    orderBy: { sequenceNumber: "asc" },
  });

  const batterMap = new Map<
    string,
    {
      playerId: string;
      playerName: string;
      runs: number;
      ballsFaced: number;
      dismissals: number;
      dismissalTypes: string[];
    }
  >();

  const bowlerMap = new Map<
    string,
    {
      playerId: string;
      playerName: string;
      legalBalls: number;
      runsConceded: number;
      wickets: number;
      wides: number;
      noBalls: number;
    }
  >();

  const getBatter = (player: {
    id: string;
    fullName: string;
  }) => {
    if (!batterMap.has(player.id)) {
      batterMap.set(player.id, {
        playerId: player.id,
        playerName: player.fullName,
        runs: 0,
        ballsFaced: 0,
        dismissals: 0,
        dismissalTypes: [],
      });
    }

    return batterMap.get(player.id)!;
  };

  const getBowler = (player: {
    id: string;
    fullName: string;
  }) => {
    if (!bowlerMap.has(player.id)) {
      bowlerMap.set(player.id, {
        playerId: player.id,
        playerName: player.fullName,
        legalBalls: 0,
        runsConceded: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
      });
    }

    return bowlerMap.get(player.id)!;
  };

  for (const event of events) {
    // Penalty runs do not count towards batter or bowler statistics.
    if (event.eventType === "PENALTY_RUNS") {
      continue;
    }

    // Batting statistics
    if (event.striker) {
      const batter = getBatter(event.striker);

      batter.runs += event.runsOffBat;

      // A wide does not count as a ball faced.
      if (event.extraType !== "WIDE") {
        batter.ballsFaced++;
      }
    }

    // Include non-strikers who haven't faced a delivery yet.
    if (event.nonStriker) {
      getBatter(event.nonStriker);
    }

    // Record dismissals.
    if (event.dismissedPlayer) {
      const dismissedBatter = getBatter(event.dismissedPlayer);

      dismissedBatter.dismissals++;

      if (event.dismissalType) {
        dismissedBatter.dismissalTypes.push(event.dismissalType);
      }
    }

    // Bowling statistics
    if (event.bowler) {
      const bowler = getBowler(event.bowler);

      if (event.isLegalDelivery) {
        bowler.legalBalls++;
      }

      // Batter runs are charged to the bowler.
      bowler.runsConceded += event.runsOffBat;

      // Wide and no-ball extras are charged to the bowler.
      if (
        event.extraType === "WIDE" ||
        event.extraType === "NO_BALL"
      ) {
        bowler.runsConceded += event.extras;
      }

      if (event.extraType === "WIDE") {
        bowler.wides += event.extras;
      }

      if (event.extraType === "NO_BALL") {
        bowler.noBalls += event.extras;
      }

      // Only applicable dismissal types credit the bowler.
      if (
        event.dismissalType &&
        BOWLER_CREDITED_WICKETS.has(event.dismissalType)
      ) {
        bowler.wickets++;
      }
    }
  }

  const batters = Array.from(batterMap.values()).map((batter) => ({
    ...batter,
    strikeRate:
      batter.ballsFaced > 0
        ? Number(
            ((batter.runs / batter.ballsFaced) * 100).toFixed(2)
          )
        : 0,
  }));

  const bowlers = Array.from(bowlerMap.values()).map((bowler) => ({
    ...bowler,
    overs: `${Math.floor(bowler.legalBalls / 6)}.${bowler.legalBalls % 6}`,
    economy:
      bowler.legalBalls > 0
        ? Number(
            (
              (bowler.runsConceded * 6) /
              bowler.legalBalls
            ).toFixed(2)
          )
        : 0,
  }));

  return {
    inningsId,
    totalRuns: innings.totalRuns,
    wickets: innings.wickets,
    totalBalls: innings.totalBalls,
    overs: `${Math.floor(innings.totalBalls / 6)}.${innings.totalBalls % 6}`,
    batters,
    bowlers,
  };
}
