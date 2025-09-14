-- Скрипт для исправления проблемы с миграцией на сервере
-- Выполняется только если колонки уже удалены

-- Проверяем существование колонок и удаляем их только если они существуют
DO $$
BEGIN
    -- Удаляем колонку classification если она существует
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Equipment' AND column_name = 'classification') THEN
        ALTER TABLE "Equipment" DROP COLUMN "classification";
        RAISE NOTICE 'Колонка classification удалена';
    ELSE
        RAISE NOTICE 'Колонка classification уже удалена';
    END IF;

    -- Удаляем колонку kind если она существует
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Equipment' AND column_name = 'kind') THEN
        ALTER TABLE "Equipment" DROP COLUMN "kind";
        RAISE NOTICE 'Колонка kind удалена';
    ELSE
        RAISE NOTICE 'Колонка kind уже удалена';
    END IF;

    -- Удаляем колонку measurements если она существует
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Equipment' AND column_name = 'measurements') THEN
        ALTER TABLE "Equipment" DROP COLUMN "measurements";
        RAISE NOTICE 'Колонка measurements удалена';
    ELSE
        RAISE NOTICE 'Колонка measurements уже удалена';
    END IF;

    -- Удаляем колонку type если она существует
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'Equipment' AND column_name = 'type') THEN
        ALTER TABLE "Equipment" DROP COLUMN "type";
        RAISE NOTICE 'Колонка type удалена';
    ELSE
        RAISE NOTICE 'Колонка type уже удалена';
    END IF;
END $$;

-- Добавляем новые колонки если они не существуют
DO $$
BEGIN
    -- Добавляем classificationId если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Equipment' AND column_name = 'classificationId') THEN
        ALTER TABLE "Equipment" ADD COLUMN "classificationId" INTEGER;
        RAISE NOTICE 'Колонка classificationId добавлена';
    ELSE
        RAISE NOTICE 'Колонка classificationId уже существует';
    END IF;

    -- Добавляем kindId если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Equipment' AND column_name = 'kindId') THEN
        ALTER TABLE "Equipment" ADD COLUMN "kindId" INTEGER;
        RAISE NOTICE 'Колонка kindId добавлена';
    ELSE
        RAISE NOTICE 'Колонка kindId уже существует';
    END IF;

    -- Добавляем measurementId если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Equipment' AND column_name = 'measurementId') THEN
        ALTER TABLE "Equipment" ADD COLUMN "measurementId" INTEGER;
        RAISE NOTICE 'Колонка measurementId добавлена';
    ELSE
        RAISE NOTICE 'Колонка measurementId уже существует';
    END IF;

    -- Добавляем typeId если не существует
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Equipment' AND column_name = 'typeId') THEN
        ALTER TABLE "Equipment" ADD COLUMN "typeId" INTEGER;
        RAISE NOTICE 'Колонка typeId добавлена';
    ELSE
        RAISE NOTICE 'Колонка typeId уже существует';
    END IF;
END $$;

-- Создаем таблицы фильтров если они не существуют
CREATE TABLE IF NOT EXISTS "Classification" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Classification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Measurement" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EquipmentType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "EquipmentType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EquipmentKind" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "EquipmentKind_pkey" PRIMARY KEY ("id")
);

-- Создаем уникальные индексы если они не существуют
CREATE UNIQUE INDEX IF NOT EXISTS "Classification_name_key" ON "Classification"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Measurement_name_key" ON "Measurement"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "EquipmentType_name_key" ON "EquipmentType"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "EquipmentKind_name_key" ON "EquipmentKind"("name");

-- Добавляем внешние ключи если они не существуют
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Equipment_classificationId_fkey') THEN
        ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_classificationId_fkey" 
        FOREIGN KEY ("classificationId") REFERENCES "Classification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Внешний ключ Equipment_classificationId_fkey добавлен';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Equipment_measurementId_fkey') THEN
        ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_measurementId_fkey" 
        FOREIGN KEY ("measurementId") REFERENCES "Measurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Внешний ключ Equipment_measurementId_fkey добавлен';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Equipment_typeId_fkey') THEN
        ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_typeId_fkey" 
        FOREIGN KEY ("typeId") REFERENCES "EquipmentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Внешний ключ Equipment_typeId_fkey добавлен';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Equipment_kindId_fkey') THEN
        ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_kindId_fkey" 
        FOREIGN KEY ("kindId") REFERENCES "EquipmentKind"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Внешний ключ Equipment_kindId_fkey добавлен';
    END IF;
END $$;
