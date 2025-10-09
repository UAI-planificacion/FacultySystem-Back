/*
  Warnings:

  - You are about to drop the column `gradeId` on the `PlanningChange` table. All the data in the column will be lost.
  - You are about to drop the column `gradeId` on the `RequestSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlanningChange" DROP CONSTRAINT "PlanningChange_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "RequestSession" DROP CONSTRAINT "RequestSession_gradeId_fkey";

-- AlterTable
ALTER TABLE "PlanningChange" DROP COLUMN "gradeId";

-- AlterTable
ALTER TABLE "RequestSession" DROP COLUMN "gradeId";

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "gradeId" TEXT;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
