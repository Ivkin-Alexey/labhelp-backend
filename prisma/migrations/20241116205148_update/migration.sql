-- DropIndex
DROP INDEX "EquipmentSearchHistory_login_key";

-- AlterTable
ALTER TABLE "EquipmentSearchHistory" ADD CONSTRAINT "EquipmentSearchHistory_pkey" PRIMARY KEY ("login");
