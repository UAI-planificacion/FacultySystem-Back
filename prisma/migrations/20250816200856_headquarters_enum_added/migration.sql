/*
  Warnings:

  - Changed the type of `headquartersId` on the `Grade` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "headquarters" AS ENUM ('ERRAZURIZ', 'PENALOLEN', 'VINADELMAR', 'VITACURA');

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "headquartersId",
ADD COLUMN     "headquartersId" "headquarters" NOT NULL;
