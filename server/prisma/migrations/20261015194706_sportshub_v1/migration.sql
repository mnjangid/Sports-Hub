/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[universityId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[universityId,rollNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `universityId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('LEAGUE', 'KNOCKOUT', 'GROUP_STAGE', 'LEAGUE_AND_KNOCKOUT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('MEMBER', 'CAPTAIN', 'VICE_CAPTAIN');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'POSTPONED', 'CANCELLED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "InningsStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DECLARED');

-- CreateEnum
CREATE TYPE "ScoreEventType" AS ENUM ('DELIVERY', 'PENALTY_RUNS');

-- CreateEnum
CREATE TYPE "ExtraType" AS ENUM ('WIDE', 'NO_BALL', 'BYE', 'LEG_BYE', 'PENALTY');

-- CreateEnum
CREATE TYPE "DismissalType" AS ENUM ('BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET', 'HIT_BALL_TWICE', 'OBSTRUCTING_FIELD', 'TIMED_OUT', 'RETIRED_OUT', 'OTHER');

-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('GENERAL', 'TOURNAMENT', 'MATCH_SCHEDULE_CHANGE', 'MATCH_POSTPONED', 'MATCH_CANCELLED', 'RESULT', 'IMPORTANT');

-- CreateEnum
CREATE TYPE "NoticeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profilePhotoUrl" TEXT,
ADD COLUMN     "rollNumber" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "universityId" UUID NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "University" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" UUID NOT NULL,
    "universityId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoordinatorAssignment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sportId" UUID NOT NULL,
    "assignedBy" UUID NOT NULL,
    "assignedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "CoordinatorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" UUID NOT NULL,
    "sportId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" "TournamentFormat" NOT NULL DEFAULT 'CUSTOM',
    "startDate" TIMESTAMPTZ(3),
    "endDate" TIMESTAMPTZ(3),
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "teamRole" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(3),

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "teamAId" UUID NOT NULL,
    "teamBId" UUID NOT NULL,
    "venue" TEXT,
    "scheduledAt" TIMESTAMPTZ(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "winnerTeamId" UUID,
    "resultDescription" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Innings" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "inningsNumber" INTEGER NOT NULL,
    "battingTeamId" UUID NOT NULL,
    "bowlingTeamId" UUID NOT NULL,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "totalBalls" INTEGER NOT NULL DEFAULT 0,
    "status" "InningsStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Innings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreEvent" (
    "id" UUID NOT NULL,
    "inningsId" UUID NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "strikerId" UUID NOT NULL,
    "nonStrikerId" UUID NOT NULL,
    "bowlerId" UUID NOT NULL,
    "runsOffBat" INTEGER NOT NULL DEFAULT 0,
    "extras" INTEGER NOT NULL DEFAULT 0,
    "extraType" "ExtraType",
    "eventType" "ScoreEventType" NOT NULL DEFAULT 'DELIVERY',
    "isLegalDelivery" BOOLEAN NOT NULL DEFAULT true,
    "dismissedPlayerId" UUID,
    "dismissalType" "DismissalType",
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ScoreEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreEventRevision" (
    "id" UUID NOT NULL,
    "scoreEventId" UUID NOT NULL,
    "editedBy" UUID NOT NULL,
    "previousValues" JSONB NOT NULL,
    "newValues" JSONB NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreEventRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" UUID NOT NULL,
    "universityId" UUID NOT NULL,
    "createdBy" UUID NOT NULL,
    "tournamentId" UUID,
    "matchId" UUID,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NoticeType" NOT NULL DEFAULT 'GENERAL',
    "status" "NoticeStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "University_status_idx" ON "University"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "Sport_universityId_status_idx" ON "Sport"("universityId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_universityId_name_key" ON "Sport"("universityId", "name");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_userId_status_idx" ON "CoordinatorAssignment"("userId", "status");

-- CreateIndex
CREATE INDEX "CoordinatorAssignment_sportId_status_idx" ON "CoordinatorAssignment"("sportId", "status");

-- CreateIndex
CREATE INDEX "Tournament_sportId_status_idx" ON "Tournament"("sportId", "status");

-- CreateIndex
CREATE INDEX "Tournament_startDate_idx" ON "Tournament"("startDate");

-- CreateIndex
CREATE INDEX "Team_tournamentId_idx" ON "Team"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_id_tournamentId_key" ON "Team"("id", "tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_tournamentId_name_key" ON "Team"("tournamentId", "name");

-- CreateIndex
CREATE INDEX "TeamMembership_teamId_status_idx" ON "TeamMembership"("teamId", "status");

-- CreateIndex
CREATE INDEX "TeamMembership_tournamentId_userId_status_idx" ON "TeamMembership"("tournamentId", "userId", "status");

-- CreateIndex
CREATE INDEX "TeamMembership_userId_idx" ON "TeamMembership"("userId");

-- CreateIndex
CREATE INDEX "Match_tournamentId_status_idx" ON "Match"("tournamentId", "status");

-- CreateIndex
CREATE INDEX "Match_scheduledAt_idx" ON "Match"("scheduledAt");

-- CreateIndex
CREATE INDEX "Innings_battingTeamId_idx" ON "Innings"("battingTeamId");

-- CreateIndex
CREATE INDEX "Innings_bowlingTeamId_idx" ON "Innings"("bowlingTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "Innings_matchId_inningsNumber_key" ON "Innings"("matchId", "inningsNumber");

-- CreateIndex
CREATE INDEX "ScoreEvent_strikerId_idx" ON "ScoreEvent"("strikerId");

-- CreateIndex
CREATE INDEX "ScoreEvent_bowlerId_idx" ON "ScoreEvent"("bowlerId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreEvent_inningsId_sequenceNumber_key" ON "ScoreEvent"("inningsId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "ScoreEventRevision_scoreEventId_createdAt_idx" ON "ScoreEventRevision"("scoreEventId", "createdAt");

-- CreateIndex
CREATE INDEX "ScoreEventRevision_editedBy_idx" ON "ScoreEventRevision"("editedBy");

-- CreateIndex
CREATE INDEX "Notice_universityId_status_publishedAt_idx" ON "Notice"("universityId", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "Notice_tournamentId_idx" ON "Notice"("tournamentId");

-- CreateIndex
CREATE INDEX "Notice_matchId_idx" ON "Notice"("matchId");

-- CreateIndex
CREATE INDEX "Notice_createdBy_idx" ON "Notice"("createdBy");

-- CreateIndex
CREATE INDEX "User_universityId_status_idx" ON "User"("universityId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "User_universityId_email_key" ON "User"("universityId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "User_universityId_rollNumber_key" ON "User"("universityId", "rollNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sport" ADD CONSTRAINT "Sport_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoordinatorAssignment" ADD CONSTRAINT "CoordinatorAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_tournamentId_fkey" FOREIGN KEY ("teamId", "tournamentId") REFERENCES "Team"("id", "tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamAId_tournamentId_fkey" FOREIGN KEY ("teamAId", "tournamentId") REFERENCES "Team"("id", "tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_tournamentId_fkey" FOREIGN KEY ("teamBId", "tournamentId") REFERENCES "Team"("id", "tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerTeamId_tournamentId_fkey" FOREIGN KEY ("winnerTeamId", "tournamentId") REFERENCES "Team"("id", "tournamentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_battingTeamId_fkey" FOREIGN KEY ("battingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Innings" ADD CONSTRAINT "Innings_bowlingTeamId_fkey" FOREIGN KEY ("bowlingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_inningsId_fkey" FOREIGN KEY ("inningsId") REFERENCES "Innings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_strikerId_fkey" FOREIGN KEY ("strikerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_nonStrikerId_fkey" FOREIGN KEY ("nonStrikerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_bowlerId_fkey" FOREIGN KEY ("bowlerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_dismissedPlayerId_fkey" FOREIGN KEY ("dismissedPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEventRevision" ADD CONSTRAINT "ScoreEventRevision_scoreEventId_fkey" FOREIGN KEY ("scoreEventId") REFERENCES "ScoreEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEventRevision" ADD CONSTRAINT "ScoreEventRevision_editedBy_fkey" FOREIGN KEY ("editedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- Match teams must be different.
ALTER TABLE "Match"
ADD CONSTRAINT "Match_different_teams_check"
CHECK ("teamAId" <> "teamBId");

-- Winner must be one of the participating teams.
ALTER TABLE "Match"
ADD CONSTRAINT "Match_winner_must_participate_check"
CHECK (
  "winnerTeamId" IS NULL
  OR "winnerTeamId" IN ("teamAId", "teamBId")
);

-- Batting and bowling teams must differ.
ALTER TABLE "Innings"
ADD CONSTRAINT "Innings_different_teams_check"
CHECK ("battingTeamId" <> "bowlingTeamId");

-- Basic score-event validation.
ALTER TABLE "ScoreEvent"
ADD CONSTRAINT "ScoreEvent_nonnegative_runs_check"
CHECK ("runsOffBat" >= 0 AND "extras" >= 0);

ALTER TABLE "ScoreEvent"
ADD CONSTRAINT "ScoreEvent_positive_sequence_check"
CHECK ("sequenceNumber" > 0);

ALTER TABLE "ScoreEvent"
ADD CONSTRAINT "ScoreEvent_different_batters_check"
CHECK ("strikerId" <> "nonStrikerId");

-- One active team per user per tournament.
CREATE UNIQUE INDEX "TeamMembership_one_active_team_per_tournament"
ON "TeamMembership" ("tournamentId", "userId")
WHERE "status" = 'ACTIVE';

-- One active captain per team.
CREATE UNIQUE INDEX "TeamMembership_one_active_captain_per_team"
ON "TeamMembership" ("teamId")
WHERE "status" = 'ACTIVE' AND "teamRole" = 'CAPTAIN';
