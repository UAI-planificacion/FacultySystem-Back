/*
  Warnings:

  - You are about to drop the column `periodId` on the `Request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_periodId_fkey";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "periodId";
