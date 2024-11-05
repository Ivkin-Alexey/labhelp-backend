/*
  Warnings:

  - You are about to drop the `equipments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `operatingEquipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "equipments";

-- DropTable
DROP TABLE "operatingEquipment";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "User" (
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("login")
);

-- CreateTable
CREATE TABLE "Equipment" (
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

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingEquipment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isLongUse" BOOLEAN NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatingEquipment_pkey" PRIMARY KEY ("id")
);
