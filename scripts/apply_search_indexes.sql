-- Скрипт для применения индексов поиска оборудования
-- Выполняется только при первом деплое, так как CONCURRENTLY не работает в транзакциях Prisma
-- Все индексы создаются с IF NOT EXISTS для безопасности

-- Индексы для текстовых полей поиска (GIN индексы для полнотекстового поиска)
CREATE INDEX IF NOT EXISTS "idx_equipment_name_gin" 
ON "Equipment" USING gin(to_tsvector('russian', COALESCE(name, '')));

CREATE INDEX IF NOT EXISTS "idx_equipment_description_gin" 
ON "Equipment" USING gin(to_tsvector('russian', COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS "idx_equipment_brand_gin" 
ON "Equipment" USING gin(to_tsvector('russian', COALESCE(brand, '')));

-- Индексы для точного поиска по серийным номерам и инвентарным номерам
CREATE INDEX IF NOT EXISTS "idx_equipment_serial_number" 
ON "Equipment" ("serialNumber") WHERE "serialNumber" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_equipment_inventory_number" 
ON "Equipment" ("inventoryNumber") WHERE "inventoryNumber" IS NOT NULL;

-- Индексы для поиска по категории
CREATE INDEX IF NOT EXISTS "idx_equipment_category" 
ON "Equipment" ("category") WHERE "category" IS NOT NULL;

-- Индексы для внешних ключей
CREATE INDEX IF NOT EXISTS "idx_equipment_model_id" 
ON "Equipment" ("modelId");

CREATE INDEX IF NOT EXISTS "idx_equipment_department_id" 
ON "Equipment" ("departmentId");

CREATE INDEX IF NOT EXISTS "idx_equipment_classification_id" 
ON "Equipment" ("classificationId") WHERE "classificationId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_equipment_measurement_id" 
ON "Equipment" ("measurementId") WHERE "measurementId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_equipment_type_id" 
ON "Equipment" ("typeId") WHERE "typeId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_equipment_kind_id" 
ON "Equipment" ("kindId") WHERE "kindId" IS NOT NULL;

-- Составной индекс для группировки по modelId и departmentId
CREATE INDEX IF NOT EXISTS "idx_equipment_model_department" 
ON "Equipment" ("modelId", "departmentId");

-- Индексы для связанных таблиц
CREATE INDEX IF NOT EXISTS "idx_model_name" 
ON "Model" ("name");

CREATE INDEX IF NOT EXISTS "idx_department_name" 
ON "Department" ("name");

CREATE INDEX IF NOT EXISTS "idx_classification_name" 
ON "Classification" ("name");

CREATE INDEX IF NOT EXISTS "idx_measurement_name" 
ON "Measurement" ("name");

CREATE INDEX IF NOT EXISTS "idx_equipment_type_name" 
ON "EquipmentType" ("name");

CREATE INDEX IF NOT EXISTS "idx_equipment_kind_name" 
ON "EquipmentKind" ("name");

-- Индекс для сортировки по imgUrl
CREATE INDEX IF NOT EXISTS "idx_equipment_img_url" 
ON "Equipment" ("imgUrl") WHERE "imgUrl" IS NOT NULL;
