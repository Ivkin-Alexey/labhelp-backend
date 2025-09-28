-- Скрипт для исправления проблемной миграции поиска индексов
-- Удаляем запись о неудачной миграции из таблицы _prisma_migrations

DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250115000000_add_search_indexes' 
AND finished_at IS NULL;
