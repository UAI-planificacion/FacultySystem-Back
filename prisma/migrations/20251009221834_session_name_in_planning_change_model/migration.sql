/*
  Warnings:

  - Added the required column `sessionName` to the `PlanningChange` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlanningChange" ADD COLUMN     "sessionName" "SessionName" NOT NULL;
