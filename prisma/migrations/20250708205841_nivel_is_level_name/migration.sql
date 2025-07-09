/*
  Warnings:

  - You are about to drop the column `nivel` on the `RequestDetail` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Level" AS ENUM ('PREGRADO', 'FIRST_GRADE', 'SECOND_GRADE');

-- AlterTable
ALTER TABLE "RequestDetail" DROP COLUMN "nivel",
ADD COLUMN     "level" "Level" NOT NULL DEFAULT 'PREGRADO';

-- DropEnum
DROP TYPE "Nivel";
