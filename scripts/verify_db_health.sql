-- Health check скрипт для проверки структуры БД
-- ВНИМАНИЕ: При изменении схемы Prisma необходимо обновить этот скрипт!

-- Список ожидаемых таблиц (синхронизировать с schema.prisma при изменениях!)
-- Current models: User, Equipment, Model, Department, Classification, 
--                  Measurement, EquipmentType, EquipmentKind, FavoriteEquipment, OperatingEquipment, EquipmentSearchHistory
-- Total expected: 11 таблиц

\echo '🔍 Database Health Check'
\echo '========================================'

-- 1. Проверка таблиц (динамическая проверка всех моделей Prisma)
\echo ''
\echo '1️⃣ Required Tables:'
WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'User', 'Equipment', 'Model', 'Department', 'Classification',
    'Measurement', 'EquipmentType', 'EquipmentKind',
    'FavoriteEquipment', 'OperatingEquipment', 'EquipmentSearchHistory'
  ]) as table_name
)
SELECT 
    COUNT(CASE WHEN t.table_name IS NOT NULL THEN 1 END) as found,
    COUNT(*) as expected,
    CASE 
        WHEN COUNT(CASE WHEN t.table_name IS NOT NULL THEN 1 END) = COUNT(*) THEN 
            '✅ Все таблицы существуют (' || COUNT(*) || ')'
        ELSE 
            '❌ Отсутствуют таблицы: ' || 
            (COUNT(*) - COUNT(CASE WHEN t.table_name IS NOT NULL THEN 1 END)) ||
            ' из ' || COUNT(*) ||
            '. Отсутствуют: ' ||
            string_agg(CASE WHEN t.table_name IS NULL THEN expected.table_name END, ', ')
    END as status
FROM expected_tables expected
LEFT JOIN information_schema.tables t ON t.table_schema = 'public' 
  AND lower(t.table_name) = lower(expected.table_name);

-- 2. Проверка критических колонок в Equipment
\echo ''
\echo '2️⃣ Equipment Table Columns:'
SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ Все FK колонки существуют'
        ELSE '❌ Отсутствуют колонки: ' || (4 - COUNT(*)) || ' из 4'
    END as status,
    COALESCE(string_agg(column_name, ', '), 'Нет колонок') as missing_columns
FROM (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'Equipment' 
      AND column_name IN ('classificationId', 'kindId', 'measurementId', 'typeId')
) as existing;

-- 3. Проверка миграций
\echo ''
\echo '3️⃣ Prisma Migrations (last 5):'
SELECT 
    migration_name,
    CASE 
        WHEN finished_at IS NOT NULL THEN '✅ Применена'
        ELSE '❌ НЕ применена'
    END as status
FROM _prisma_migrations 
ORDER BY started_at DESC 
LIMIT 5;

-- 4. Проверка расширения pg_trgm
\echo ''
\echo '4️⃣ PostgreSQL Extensions:'
SELECT 
    extname,
    CASE 
        WHEN installed_version IS NOT NULL THEN '✅ Установлено'
        ELSE '❌ НЕ установлено'
    END as status
FROM pg_extension 
WHERE extname = 'pg_trgm';

-- 5. Проверка триграммных индексов (динамическая)
-- Список индексов синхронизировать с apply_search_indexes.sql при изменениях!
\echo ''
\echo '5️⃣ Trigrams Indexes:'
DO $$
DECLARE
    trgm_count INTEGER;
    expected_count INTEGER := 12; -- UPDATE при изменении apply_search_indexes.sql!
BEGIN
    SELECT COUNT(*) INTO trgm_count
    FROM pg_indexes 
    WHERE schemaname = 'public'
      AND indexname LIKE '%_trgm%';
    
    IF trgm_count = expected_count THEN
        RAISE NOTICE '✅ Все % триграммных индексов на месте (%)', expected_count, trgm_count;
    ELSIF trgm_count < expected_count THEN
        RAISE NOTICE '⚠️ Отсутствуют индексы: %/%', trgm_count, expected_count;
    ELSE
        RAISE NOTICE '⚠️ Неправильное количество: % (ожидалось %)', trgm_count, expected_count;
    END IF;
END $$;

-- 6. Проверка B-tree индексов в Equipment (динамическая)
\echo ''
\echo '6️⃣ B-tree Indexes in Equipment:'
SELECT 
    COUNT(*) as total_indexes,
    CASE 
        WHEN COUNT(*) >= 15 THEN '✅ Достаточно индексов'
        ELSE '⚠️ Возможно недостаточно индексов (' || COUNT(*) || ')'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename = 'Equipment'
  AND indexname NOT LIKE '%_trgm%'
  AND indexname NOT LIKE '%_pkey%'; -- Исключаем primary key

\echo ''
\echo '========================================'
\echo 'Health Check Complete'
\echo ''
\echo '⚠️ ВАЖНО: При изменении схемы Prisma или apply_search_indexes.sql'
\echo '   обновите этот скрипт (строки с метками UPDATE)!'
