-- Местоположение оборудования: склейка учебного центра и аудитории.
-- Применялась локально через db push, поэтому создана вручную: SQL идентичен
-- тому, что сгенерировал бы migrate dev из разницы схем

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN "auditorium" TEXT;

-- CreateIndex
CREATE INDEX "Equipment_auditorium_idx" ON "Equipment"("auditorium");
