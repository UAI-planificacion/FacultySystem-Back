/*
  Warnings:

  - A unique constraint covering the columns `[sectionId]` on the table `PlanningChange` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PlanningChange" ADD COLUMN     "sectionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PlanningChange_sectionId_key" ON "PlanningChange"("sectionId");

-- AddForeignKey
ALTER TABLE "PlanningChange" ADD CONSTRAINT "PlanningChange_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
