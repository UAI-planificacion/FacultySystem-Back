/*
  Warnings:

  - The values [AUDITORIUM] on the enum `SpaceType` will be removed. If these variants are still used in the database, this will fail.
  - The `spaceType` column on the `Subject` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SpaceType_new" AS ENUM ('ROOM', 'AUDITORIO', 'COMMUNIC', 'LAB', 'LABPC', 'DIS', 'GARAGE', 'CORE');
ALTER TABLE "Subject" ALTER COLUMN "spaceType" TYPE "SpaceType_new" USING ("spaceType"::text::"SpaceType_new");
ALTER TABLE "Offer" ALTER COLUMN "spaceType" TYPE "SpaceType_new" USING ("spaceType"::text::"SpaceType_new");
ALTER TABLE "RequestDetail" ALTER COLUMN "spaceType" TYPE "SpaceType_new" USING ("spaceType"::text::"SpaceType_new");
ALTER TYPE "SpaceType" RENAME TO "SpaceType_old";
ALTER TYPE "SpaceType_new" RENAME TO "SpaceType";
DROP TYPE "SpaceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "spaceType",
ADD COLUMN     "spaceType" "SpaceType";

-- DropEnum
DROP TYPE "RoomType";
