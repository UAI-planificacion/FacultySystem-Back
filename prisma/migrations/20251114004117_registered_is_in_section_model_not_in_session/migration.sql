/*
  Warnings:

  - You are about to drop the column `registered` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "registered" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "registered";
