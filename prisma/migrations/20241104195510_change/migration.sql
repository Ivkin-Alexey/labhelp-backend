/*
  Warnings:

  - Added the required column `inventoryNumber` to the `Equipments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `Equipments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Equipments" ADD COLUMN     "inventoryNumber" TEXT NOT NULL,
ADD COLUMN     "serialNumber" TEXT NOT NULL;
