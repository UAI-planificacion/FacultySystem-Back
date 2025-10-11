/*
  Warnings:

  - You are about to drop the column `staffUpdateId` on the `RequestSession` table. All the data in the column will be lost.
  - Added the required column `building` to the `PlanningChange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `building` to the `RequestSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RequestSession" DROP CONSTRAINT "RequestSession_staffUpdateId_fkey";

-- AlterTable
ALTER TABLE "PlanningChange" ADD COLUMN     "building" "Building" NOT NULL;

-- AlterTable
ALTER TABLE "RequestSession" DROP COLUMN "staffUpdateId",
ADD COLUMN     "building" "Building" NOT NULL;
