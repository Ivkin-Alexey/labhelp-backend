/*
  Warnings:

  - A unique constraint covering the columns `[login,term]` on the table `EquipmentSearchHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSearchHistory_login_term_key" ON "EquipmentSearchHistory"("login", "term");
