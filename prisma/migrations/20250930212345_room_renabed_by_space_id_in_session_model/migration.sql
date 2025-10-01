/*
  Warnings:

  - You are about to drop the column `room` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "room",
ADD COLUMN     "spaceId" TEXT;
