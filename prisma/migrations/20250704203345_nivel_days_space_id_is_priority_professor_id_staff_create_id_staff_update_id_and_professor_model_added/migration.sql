-- CreateEnum
CREATE TYPE "Nivel" AS ENUM ('PREGRADO', 'FIRST_GRADE', 'SECOND_GRADE');

-- AlterTable
ALTER TABLE "RequestDetail" ADD COLUMN     "days" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isPriority" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moduleId" TEXT,
ADD COLUMN     "nivel" "Nivel" NOT NULL DEFAULT 'PREGRADO',
ADD COLUMN     "professorId" TEXT,
ADD COLUMN     "spaceId" TEXT,
ADD COLUMN     "staffCreateId" TEXT;

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "isMock" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Professor_email_key" ON "Professor"("email");

-- AddForeignKey
ALTER TABLE "RequestDetail" ADD CONSTRAINT "RequestDetail_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDetail" ADD CONSTRAINT "RequestDetail_staffCreateId_fkey" FOREIGN KEY ("staffCreateId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
