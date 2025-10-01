/*
  Warnings:

  - A unique constraint covering the columns `[sectionId]` on the table `Request` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Request_sectionId_key" ON "Request"("sectionId");
