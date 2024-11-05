/*
  Warnings:

  - You are about to drop the `Equipments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Equipments";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "user" (
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("login")
);

-- CreateTable
CREATE TABLE "equipment" (
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

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operatingEquipment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isLongUse" BOOLEAN NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operatingEquipment_pkey" PRIMARY KEY ("id")
);
