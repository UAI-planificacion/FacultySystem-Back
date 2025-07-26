/*
  Warnings:

  - You are about to drop the column `comment` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `RequestDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "comment";

-- AlterTable
ALTER TABLE "RequestDetail" DROP COLUMN "comment";
