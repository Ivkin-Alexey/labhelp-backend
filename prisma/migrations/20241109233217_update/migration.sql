/*
  Warnings:

  - The primary key for the `FavoriteEquipment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `FavoriteEquipment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FavoriteEquipment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login,equipmentId]` on the table `FavoriteEquipment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `equipmentId` to the `FavoriteEquipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `login` to the `FavoriteEquipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FavoriteEquipment" DROP CONSTRAINT "FavoriteEquipment_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "equipmentId" TEXT NOT NULL,
ADD COLUMN     "login" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteEquipment_login_equipmentId_key" ON "FavoriteEquipment"("login", "equipmentId");

-- AddForeignKey
ALTER TABLE "FavoriteEquipment" ADD CONSTRAINT "FavoriteEquipment_login_fkey" FOREIGN KEY ("login") REFERENCES "User"("login") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteEquipment" ADD CONSTRAINT "FavoriteEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
