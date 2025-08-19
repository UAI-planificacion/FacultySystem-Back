/*
  Warnings:

  - The `headquartersId` column on the `Grade` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `startDate` column on the `Subject` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endDate` column on the `Subject` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Headquarters" AS ENUM ('ERRAZURIZ', 'PENALOLEN', 'VINADELMAR', 'VITACURA');

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "headquartersId",
ADD COLUMN     "headquartersId" "Headquarters" DEFAULT 'ERRAZURIZ';

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "isEnglish" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "startDate",
ADD COLUMN     "startDate" TIMESTAMP(3)[],
DROP COLUMN "endDate",
ADD COLUMN     "endDate" TIMESTAMP(3)[];

-- DropEnum
DROP TYPE "headquarters";
