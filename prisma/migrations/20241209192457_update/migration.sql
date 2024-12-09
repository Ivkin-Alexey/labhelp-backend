/*
  Warnings:

  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "category" TEXT,
ADD COLUMN     "postGraduateEducationYear" TEXT,
ADD COLUMN     "studentsEducationYear" TEXT,
ALTER COLUMN "role" SET NOT NULL;
