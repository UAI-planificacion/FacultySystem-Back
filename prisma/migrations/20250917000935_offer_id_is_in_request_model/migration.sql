/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Request` table. All the data in the column will be lost.
  - Added the required column `offerId` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_subjectId_fkey";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "subjectId",
ADD COLUMN     "offerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
