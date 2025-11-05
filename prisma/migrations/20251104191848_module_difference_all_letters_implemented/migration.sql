-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModuleDifference" ADD VALUE 'C';
ALTER TYPE "ModuleDifference" ADD VALUE 'D';
ALTER TYPE "ModuleDifference" ADD VALUE 'E';
ALTER TYPE "ModuleDifference" ADD VALUE 'F';
ALTER TYPE "ModuleDifference" ADD VALUE 'G';
ALTER TYPE "ModuleDifference" ADD VALUE 'H';
ALTER TYPE "ModuleDifference" ADD VALUE 'I';
ALTER TYPE "ModuleDifference" ADD VALUE 'J';
ALTER TYPE "ModuleDifference" ADD VALUE 'K';
ALTER TYPE "ModuleDifference" ADD VALUE 'L';
ALTER TYPE "ModuleDifference" ADD VALUE 'M';
ALTER TYPE "ModuleDifference" ADD VALUE 'N';
ALTER TYPE "ModuleDifference" ADD VALUE 'O';
ALTER TYPE "ModuleDifference" ADD VALUE 'P';
ALTER TYPE "ModuleDifference" ADD VALUE 'Q';
ALTER TYPE "ModuleDifference" ADD VALUE 'R';
ALTER TYPE "ModuleDifference" ADD VALUE 'S';
ALTER TYPE "ModuleDifference" ADD VALUE 'T';
ALTER TYPE "ModuleDifference" ADD VALUE 'U';
ALTER TYPE "ModuleDifference" ADD VALUE 'V';
ALTER TYPE "ModuleDifference" ADD VALUE 'W';
ALTER TYPE "ModuleDifference" ADD VALUE 'X';
ALTER TYPE "ModuleDifference" ADD VALUE 'Y';
ALTER TYPE "ModuleDifference" ADD VALUE 'Z';
