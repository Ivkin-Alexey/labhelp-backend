import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaClient } from '@prisma/client'
import { EXPECTED_TRGM_INDEXES_COUNT } from '../src/assets/constants/database.js'

/**
 * Скрипт для создания триграммных индексов из командной строки
 * Используется в CI/CD деплое и может быть вызван напрямую
 * 
 * ВАЖНО: Создаем отдельный экземпляр Prisma клиента, чтобы не конфликтовать
 * с уже запущенным приложением
 */
const prisma = new PrismaClient()

/**
 * Преобразует значение COUNT из PostgreSQL в число
 */
function parsePostgresCount(value) {
  if (value == null) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  const parsed = parseInt(String(value), 10)
  return isNaN(parsed) ? 0 : parsed
}

async function main() {
  let exitCode = 0
  
  try {
    // Проверяем подключение к БД
    await prisma.$connect()
    console.info('✅ Подключение к базе данных установлено')
    
    console.info('🔄 Запуск создания триграммных индексов...')
    console.info('Создание триграммных индексов для оптимизации поиска...')
    
    try {
      // Устанавливаем расширение
      await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
      
      const extensionCheck = await prisma.$queryRawUnsafe(`
        SELECT extname, extversion 
        FROM pg_extension 
        WHERE extname = 'pg_trgm';
      `)
      
      if (!Array.isArray(extensionCheck) || extensionCheck.length === 0) {
        throw new Error('Не удалось установить расширение pg_trgm. Возможно, требуется права superuser.')
      }
      
      console.info(`✅ Расширение pg_trgm установлено (версия: ${extensionCheck[0]?.extversion || 'неизвестна'})`)
      
      // Создаем индексы
      const indexesToCreate = [
        `CREATE INDEX IF NOT EXISTS idx_equipment_name_trgm ON "Equipment" USING gin(name gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_equipment_description_trgm ON "Equipment" USING gin(description gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_equipment_brand_trgm ON "Equipment" USING gin(brand gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_equipment_serial_number_trgm ON "Equipment" USING gin("serialNumber" gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_equipment_inventory_number_trgm ON "Equipment" USING gin("inventoryNumber" gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_equipment_category_trgm ON "Equipment" USING gin(category gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_model_name_trgm ON "Model" USING gin(name gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_department_name_trgm ON "Department" USING gin(name gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_classification_name_trgm ON "Classification" USING gin(name gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_measurement_name_trgm ON "Measurement" USING gin(name gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_equipment_type_name_trgm ON "EquipmentType" USING gin(name gin_trgm_ops)`,
        `CREATE INDEX IF NOT EXISTS idx_equipment_kind_name_trgm ON "EquipmentKind" USING gin(name gin_trgm_ops)`,
      ]
      
      let createdCount = 0
      let failedCount = 0
      const failedIndexes = []
      
      for (const sql of indexesToCreate) {
        try {
          await prisma.$executeRawUnsafe(sql)
          createdCount++
        } catch (error) {
          failedCount++
          const errorMessage = error?.message || String(error)
          failedIndexes.push({ sql: sql.substring(0, 50), error: errorMessage })
          console.error(`  ✗ Ошибка при создании индекса: ${errorMessage}`)
        }
      }
      
      // Проверяем результат
      const indexCheck = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND indexname LIKE '%_trgm%';
      `)
      
      const actualCount = parsePostgresCount(indexCheck?.[0]?.count)
      
      console.info(`✅ Попытка создания завершена: ${createdCount} из ${indexesToCreate.length}`)
      console.info(`🔍 Фактически найдено триграммных индексов в БД: ${actualCount}`)
      
      if (failedCount > 0) {
        console.warn(`⚠️ Не удалось создать ${failedCount} индексов`)
        failedIndexes.forEach(failed => {
          console.warn(`   - ${failed.sql}...: ${failed.error}`)
        })
      }
      
      // Проверяем результат
      if (actualCount < EXPECTED_TRGM_INDEXES_COUNT) {
        console.error(`❌ Недостаточно индексов: ожидалось ${EXPECTED_TRGM_INDEXES_COUNT}, найдено ${actualCount}`)
        exitCode = 1
      }
      
      if (failedCount > 0) {
        console.error(`❌ Ошибки при создании ${failedCount} индексов`)
        exitCode = 1
      }
      
      if (exitCode === 0) {
        console.info('✅ Процесс завершен успешно')
      }
    } catch (error) {
      const errorMessage = error?.message || String(error)
      console.error('❌ Ошибка при создании индексов:', errorMessage)
      if (error?.stack) {
        console.error('Stack trace:', error.stack)
      }
      exitCode = 1
    }
  } catch (error) {
    const errorMessage = error?.message || String(error)
    console.error('❌ Критическая ошибка:', errorMessage)
    if (error?.stack) {
      console.error('Stack trace:', error.stack)
    }
    exitCode = 1
  } finally {
    await prisma.$disconnect()
    process.exit(exitCode)
  }
}

main()

