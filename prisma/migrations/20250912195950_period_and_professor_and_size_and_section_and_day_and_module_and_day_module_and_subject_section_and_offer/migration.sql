/*
  Warnings:

  - You are about to drop the column `day` on the `ModuleDay` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `ModuleDay` table. All the data in the column will be lost.
  - You are about to drop the column `spaceSize` on the `RequestDetail` table. All the data in the column will be lost.
  - You are about to drop the column `building` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `isEnglish` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `spaceSize` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `students` on the `Subject` table. All the data in the column will be lost.
  - The `spaceType` column on the `Subject` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[requestDetailId,dayModuleId]` on the table `ModuleDay` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dayModuleId` to the `ModuleDay` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SizeValue" AS ENUM ('XS', 'XE', 'S', 'SE', 'MS', 'M', 'L', 'XL', 'XXL');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('ROOM', 'AUDITORIO', 'COMMUNIC', 'LAB', 'LABPC', 'DIS', 'GARAGE', 'CORE');

-- CreateEnum
CREATE TYPE "Session" AS ENUM ('C', 'A', 'T', 'L');

-- CreateEnum
CREATE TYPE "DayName" AS ENUM ('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo');

-- CreateEnum
CREATE TYPE "ModuleDifference" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('InProgress', 'Closed');

-- AlterEnum
ALTER TYPE "Building" ADD VALUE 'Z';

-- DropIndex
DROP INDEX "ModuleDay_requestDetailId_day_moduleId_key";

-- AlterTable
ALTER TABLE "ModuleDay" DROP COLUMN "day",
DROP COLUMN "moduleId",
ADD COLUMN     "dayModuleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RequestDetail" DROP COLUMN "spaceSize",
ADD COLUMN     "spaceSizeId" "SizeValue";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "building",
DROP COLUMN "endDate",
DROP COLUMN "isEnglish",
DROP COLUMN "spaceSize",
DROP COLUMN "startDate",
DROP COLUMN "students",
ADD COLUMN     "spaceSizeId" "SizeValue",
DROP COLUMN "spaceType",
ADD COLUMN     "spaceType" "RoomType";

-- DropEnum
DROP TYPE "Size";

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "isMock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" "SizeValue" NOT NULL,
    "detail" TEXT NOT NULL,
    "min" INTEGER,
    "max" INTEGER,
    "lessThan" INTEGER,
    "greaterThan" INTEGER,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "session" "Session" NOT NULL,
    "size" "SizeValue",
    "correctedRegistrants" INTEGER,
    "realRegistrants" INTEGER,
    "plannedBuilding" TEXT,
    "chairsAvailable" INTEGER,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT NOT NULL,
    "requestDetailId" TEXT,
    "room" TEXT,
    "dayModuleId" INTEGER,
    "professorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" SERIAL NOT NULL,
    "name" "DayName" NOT NULL,
    "shortName" TEXT,
    "mediumName" TEXT,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "difference" "ModuleDifference",
    "startHour" TEXT NOT NULL,
    "endHour" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayModule" (
    "id" SERIAL NOT NULL,
    "dayId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DayModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectSection" (
    "subjectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,

    CONSTRAINT "SubjectSection_pkey" PRIMARY KEY ("subjectId","sectionId","periodId")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "openingDate" TIMESTAMP(3),
    "closingDate" TIMESTAMP(3),
    "status" "PeriodStatus" NOT NULL DEFAULT 'InProgress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3)[],
    "endDate" TIMESTAMP(3)[],
    "building" "Building",
    "spaceType" "SpaceType",
    "costCenterId" TEXT,
    "isEnglish" BOOLEAN NOT NULL DEFAULT false,
    "workshop" INTEGER NOT NULL DEFAULT 0,
    "lecture" INTEGER NOT NULL DEFAULT 0,
    "tutoringSession" INTEGER NOT NULL DEFAULT 0,
    "laboratory" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "spaceSizeId" "SizeValue",
    "periodId" TEXT NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Professor_email_key" ON "Professor"("email");

-- CreateIndex
CREATE INDEX "Professor_name_idx" ON "Professor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Day_name_key" ON "Day"("name");

-- CreateIndex
CREATE INDEX "Day_name_idx" ON "Day"("name");

-- CreateIndex
CREATE INDEX "Module_code_idx" ON "Module"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DayModule_dayId_moduleId_key" ON "DayModule"("dayId", "moduleId");

-- CreateIndex
CREATE INDEX "Period_name_idx" ON "Period"("name");

-- CreateIndex
CREATE INDEX "Offer_subjectId_idx" ON "Offer"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleDay_requestDetailId_dayModuleId_key" ON "ModuleDay"("requestDetailId", "dayModuleId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_dayModuleId_fkey" FOREIGN KEY ("dayModuleId") REFERENCES "DayModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleDay" ADD CONSTRAINT "ModuleDay_dayModuleId_fkey" FOREIGN KEY ("dayModuleId") REFERENCES "DayModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayModule" ADD CONSTRAINT "DayModule_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayModule" ADD CONSTRAINT "DayModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSection" ADD CONSTRAINT "SubjectSection_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSection" ADD CONSTRAINT "SubjectSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectSection" ADD CONSTRAINT "SubjectSection_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_spaceSizeId_fkey" FOREIGN KEY ("spaceSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_spaceSizeId_fkey" FOREIGN KEY ("spaceSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDetail" ADD CONSTRAINT "RequestDetail_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDetail" ADD CONSTRAINT "RequestDetail_spaceSizeId_fkey" FOREIGN KEY ("spaceSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
