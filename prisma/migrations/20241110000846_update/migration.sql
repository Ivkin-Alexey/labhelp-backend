/*
  Warnings:

  - The primary key for the `OperatingEquipment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OperatingEquipment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `OperatingEquipment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login,equipmentId]` on the table `OperatingEquipment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `equipmentId` to the `OperatingEquipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `login` to the `OperatingEquipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OperatingEquipment" DROP CONSTRAINT "OperatingEquipment_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "equipmentId" TEXT NOT NULL,
ADD COLUMN     "login" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OperatingEquipment_login_equipmentId_key" ON "OperatingEquipment"("login", "equipmentId");

-- AddForeignKey
ALTER TABLE "OperatingEquipment" ADD CONSTRAINT "OperatingEquipment_login_fkey" FOREIGN KEY ("login") REFERENCES "User"("login") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatingEquipment" ADD CONSTRAINT "OperatingEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
