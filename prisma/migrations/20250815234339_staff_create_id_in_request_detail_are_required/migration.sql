/*
  Warnings:

  - Made the column `staffCreateId` on table `RequestDetail` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RequestDetail" ALTER COLUMN "staffCreateId" SET NOT NULL;
