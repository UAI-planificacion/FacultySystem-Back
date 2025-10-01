-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "spaceSizeId" "SizeValue",
ADD COLUMN     "spaceType" "SpaceType";

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_spaceSizeId_fkey" FOREIGN KEY ("spaceSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
