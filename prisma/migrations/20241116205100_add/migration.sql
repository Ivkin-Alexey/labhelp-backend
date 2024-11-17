-- CreateTable
CREATE TABLE "EquipmentSearchHistory" (
    "login" TEXT NOT NULL,
    "term" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSearchHistory_login_key" ON "EquipmentSearchHistory"("login");

-- AddForeignKey
ALTER TABLE "EquipmentSearchHistory" ADD CONSTRAINT "EquipmentSearchHistory_login_fkey" FOREIGN KEY ("login") REFERENCES "User"("login") ON DELETE CASCADE ON UPDATE CASCADE;
