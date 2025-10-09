/*
  Warnings:

  - The values [A,B,C,D,E,F] on the enum `Building` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Building_new" AS ENUM ('PREGRADO_A', 'PREGRADO_B', 'POSTGRADO_C', 'TALLERES_D', 'TALLERES_E', 'PREGRADO_F', 'ERRAZURIZ', 'VITACURA', 'VINA_A', 'VINA_B', 'VINA_C', 'VINA_D', 'VINA_E', 'VINA_F', 'Z');
ALTER TYPE "Building" RENAME TO "Building_old";
ALTER TYPE "Building_new" RENAME TO "Building";
DROP TYPE "Building_old";
COMMIT;

-- AlterTable
ALTER TABLE "PlanningChange" ALTER COLUMN "sessionId" DROP NOT NULL;
