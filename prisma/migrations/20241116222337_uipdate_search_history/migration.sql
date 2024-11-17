/*
  Warnings:

  - The primary key for the `EquipmentSearchHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "EquipmentSearchHistory" DROP CONSTRAINT "EquipmentSearchHistory_pkey";
