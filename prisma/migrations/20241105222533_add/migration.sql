/*
  Warnings:

  - You are about to drop the `equipment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "equipment";

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "inventoryNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "filesUrl" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);
