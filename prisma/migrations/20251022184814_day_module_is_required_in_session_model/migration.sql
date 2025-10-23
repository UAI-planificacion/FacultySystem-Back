/*
  Warnings:

  - Made the column `dayModuleId` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_dayModuleId_fkey";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "dayModuleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_dayModuleId_fkey" FOREIGN KEY ("dayModuleId") REFERENCES "DayModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
