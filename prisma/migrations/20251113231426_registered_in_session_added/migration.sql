/*
  Warnings:

  - You are about to drop the column `correctedRegistrants` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `plannedBuilding` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `realRegistrants` on the `Session` table. All the data in the column will be lost.
  - Made the column `quota` on table `Section` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "quota" SET NOT NULL,
ALTER COLUMN "quota" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "correctedRegistrants",
DROP COLUMN "plannedBuilding",
DROP COLUMN "realRegistrants",
ADD COLUMN     "registered" INTEGER DEFAULT 0;
