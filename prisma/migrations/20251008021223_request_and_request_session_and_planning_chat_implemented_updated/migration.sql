/*
  Warnings:

  - You are about to drop the column `requestDetailId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `requestDetailId` on the `ModuleDay` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `isConsecutive` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the `RequestDetail` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[planningChangeId,dayModuleId]` on the table `ModuleDay` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestSessionId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planningChangeId` to the `ModuleDay` table without a default value. This is not possible if the table is not empty.
  - Made the column `spaceId` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_requestDetailId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_requestId_fkey";

-- DropForeignKey
ALTER TABLE "ModuleDay" DROP CONSTRAINT "ModuleDay_requestDetailId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDetail" DROP CONSTRAINT "RequestDetail_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDetail" DROP CONSTRAINT "RequestDetail_professorId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDetail" DROP CONSTRAINT "RequestDetail_requestId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDetail" DROP CONSTRAINT "RequestDetail_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDetail" DROP CONSTRAINT "RequestDetail_spaceSizeId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDetail" DROP CONSTRAINT "RequestDetail_staffCreateId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDetail" DROP CONSTRAINT "RequestDetail_staffUpdateId_fkey";

-- DropIndex
DROP INDEX "Comment_requestId_requestDetailId_idx";

-- DropIndex
DROP INDEX "ModuleDay_requestDetailId_dayModuleId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "requestDetailId",
DROP COLUMN "requestId",
ADD COLUMN     "planningChangeId" TEXT,
ADD COLUMN     "requestSessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ModuleDay" DROP COLUMN "requestDetailId",
ADD COLUMN     "planningChangeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "description",
DROP COLUMN "isConsecutive";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "spaceId" SET NOT NULL;

-- DropTable
DROP TABLE "RequestDetail";

-- CreateTable
CREATE TABLE "RequestSession" (
    "id" TEXT NOT NULL,
    "session" "SessionName" NOT NULL,
    "spaceId" TEXT,
    "isEnglish" BOOLEAN NOT NULL DEFAULT false,
    "isConsecutive" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "spaceType" "SpaceType",
    "inAfternoon" BOOLEAN NOT NULL DEFAULT false,
    "gradeId" TEXT,
    "professorId" TEXT,
    "spaceSizeId" "SizeValue",
    "requestId" TEXT NOT NULL,
    "staffUpdateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionDayModule" (
    "id" TEXT NOT NULL,
    "requestSessionId" TEXT,
    "planningChangeId" TEXT,
    "dayModuleId" INTEGER NOT NULL,

    CONSTRAINT "SessionDayModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningChange" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "spaceId" TEXT,
    "isEnglish" BOOLEAN NOT NULL DEFAULT false,
    "isConsecutive" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "spaceType" "SpaceType",
    "inAfternoon" BOOLEAN NOT NULL DEFAULT false,
    "isPriority" BOOLEAN NOT NULL DEFAULT false,
    "gradeId" TEXT,
    "professorId" TEXT,
    "spaceSizeId" "SizeValue",
    "staffCreateId" TEXT NOT NULL,
    "staffUpdateId" TEXT,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestSession_requestId_session_key" ON "RequestSession"("requestId", "session");

-- CreateIndex
CREATE UNIQUE INDEX "PlanningChange_sessionId_key" ON "PlanningChange"("sessionId");

-- CreateIndex
CREATE INDEX "Comment_requestSessionId_planningChangeId_idx" ON "Comment"("requestSessionId", "planningChangeId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleDay_planningChangeId_dayModuleId_key" ON "ModuleDay"("planningChangeId", "dayModuleId");

-- AddForeignKey
ALTER TABLE "RequestSession" ADD CONSTRAINT "RequestSession_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSession" ADD CONSTRAINT "RequestSession_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSession" ADD CONSTRAINT "RequestSession_spaceSizeId_fkey" FOREIGN KEY ("spaceSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSession" ADD CONSTRAINT "RequestSession_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSession" ADD CONSTRAINT "RequestSession_staffUpdateId_fkey" FOREIGN KEY ("staffUpdateId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionDayModule" ADD CONSTRAINT "SessionDayModule_requestSessionId_fkey" FOREIGN KEY ("requestSessionId") REFERENCES "RequestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionDayModule" ADD CONSTRAINT "SessionDayModule_planningChangeId_fkey" FOREIGN KEY ("planningChangeId") REFERENCES "PlanningChange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionDayModule" ADD CONSTRAINT "SessionDayModule_dayModuleId_fkey" FOREIGN KEY ("dayModuleId") REFERENCES "DayModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleDay" ADD CONSTRAINT "ModuleDay_planningChangeId_fkey" FOREIGN KEY ("planningChangeId") REFERENCES "PlanningChange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningChange" ADD CONSTRAINT "PlanningChange_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningChange" ADD CONSTRAINT "PlanningChange_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningChange" ADD CONSTRAINT "PlanningChange_spaceSizeId_fkey" FOREIGN KEY ("spaceSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningChange" ADD CONSTRAINT "PlanningChange_staffCreateId_fkey" FOREIGN KEY ("staffCreateId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningChange" ADD CONSTRAINT "PlanningChange_staffUpdateId_fkey" FOREIGN KEY ("staffUpdateId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningChange" ADD CONSTRAINT "PlanningChange_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_requestSessionId_fkey" FOREIGN KEY ("requestSessionId") REFERENCES "RequestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_planningChangeId_fkey" FOREIGN KEY ("planningChangeId") REFERENCES "PlanningChange"("id") ON DELETE CASCADE ON UPDATE CASCADE;
