/*
  Warnings:

  - You are about to drop the `RequestDetailModule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RequestDetailModule" DROP CONSTRAINT "RequestDetailModule_requestDetailId_fkey";

-- DropTable
DROP TABLE "RequestDetailModule";

-- CreateTable
CREATE TABLE "ModuleDay" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "requestDetailId" TEXT NOT NULL,

    CONSTRAINT "ModuleDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleDay_requestDetailId_day_moduleId_key" ON "ModuleDay"("requestDetailId", "day", "moduleId");

-- AddForeignKey
ALTER TABLE "ModuleDay" ADD CONSTRAINT "ModuleDay_requestDetailId_fkey" FOREIGN KEY ("requestDetailId") REFERENCES "RequestDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
