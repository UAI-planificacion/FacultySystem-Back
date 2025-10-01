/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `RequestDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RequestDetail_sessionId_key" ON "RequestDetail"("sessionId");
