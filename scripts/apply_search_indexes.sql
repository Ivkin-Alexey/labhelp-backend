-- Скрипт для триграммных индексов (критично для ILIKE поиска)
-- Основные B-tree индексы создаются через Prisma schema

-- ВАЖНО: Этот скрипт создает ТОЛЬКО триграммы для ILIKE поиска
-- Без него поиск по текстовым полям будет медленным (>500ms)

-- Подключаем расширение для триграмм
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- КРИТИЧЕСКИ ВАЖНО: Триграммные индексы для ILIKE поиска
-- Без них PostgreSQL делает Sequential Scan для ILIKE '%term%'

-- Основные поля поиска (name, description, brand, model - самые важные)

CREATE INDEX IF NOT EXISTS idx_equipment_name_trgm ON "Equipment" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_equipment_description_trgm ON "Equipment" USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_equipment_brand_trgm ON "Equipment" USING gin(brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_equipment_serial_number_trgm ON "Equipment" USING gin("serialNumber" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_equipment_inventory_number_trgm ON "Equipment" USING gin("inventoryNumber" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_equipment_category_trgm ON "Equipment" USING gin(category gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_model_name_trgm ON "Model" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_department_name_trgm ON "Department" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_classification_name_trgm ON "Classification" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_measurement_name_trgm ON "Measurement" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_equipment_type_name_trgm ON "EquipmentType" USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_equipment_kind_name_trgm ON "EquipmentKind" USING gin(name gin_trgm_ops);