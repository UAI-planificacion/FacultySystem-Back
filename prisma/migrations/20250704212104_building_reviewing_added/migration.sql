/*
  Warnings:

  - The `building` column on the `RequestDetail` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Building" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'REVIEWING';

-- AlterTable
ALTER TABLE "RequestDetail" DROP COLUMN "building",
ADD COLUMN     "building" "Building";
