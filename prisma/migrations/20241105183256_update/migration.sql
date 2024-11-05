/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Equipments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Equipments_id_key" ON "Equipments"("id");
