/*
  Warnings:

  - You are about to drop the column `days` on the `RequestDetail` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `RequestDetail` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `RequestDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "periodId" TEXT;

-- AlterTable
ALTER TABLE "RequestDetail" DROP COLUMN "days",
DROP COLUMN "level",
DROP COLUMN "moduleId",
ADD COLUMN     "gradeId" TEXT;

-- DropEnum
DROP TYPE "Level";

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headquartersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestDetailModule" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "requestDetailId" TEXT NOT NULL,

    CONSTRAINT "RequestDetailModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grade_name_key" ON "Grade"("name");

-- CreateIndex
CREATE INDEX "Grade_name_idx" ON "Grade"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RequestDetailModule_requestDetailId_day_moduleId_key" ON "RequestDetailModule"("requestDetailId", "day", "moduleId");

-- AddForeignKey
ALTER TABLE "RequestDetailModule" ADD CONSTRAINT "RequestDetailModule_requestDetailId_fkey" FOREIGN KEY ("requestDetailId") REFERENCES "RequestDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDetail" ADD CONSTRAINT "RequestDetail_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
