/*
  Warnings:

  - Made the column `staffId` on table `Comment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "staffId" SET NOT NULL;
