/*
  Warnings:

  - You are about to drop the column `adminEmail` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `adminName` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN_FACULTY';

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "adminEmail",
DROP COLUMN "adminName";

-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "facultyId" DROP NOT NULL;
