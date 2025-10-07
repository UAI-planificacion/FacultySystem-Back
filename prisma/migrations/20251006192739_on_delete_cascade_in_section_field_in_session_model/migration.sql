-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_sectionId_fkey";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
