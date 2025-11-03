import * as dotenv from 'dotenv'
dotenv.config()
import { createTrgmIndexes } from '../src/data-access/data-access-equipments/equipments.js'
import { EXPECTED_TRGM_INDEXES_COUNT } from '../src/assets/constants/database.js'
import { prisma } from '../index.js'

/**
 * Скрипт для создания триграммных индексов из командной строки
 * Используется в CI/CD деплое и может быть вызван напрямую
 */
async function main() {
  let exitCode = 0
  
  try {
    console.info('🔄 Запуск создания триграммных индексов...')
    const result = await createTrgmIndexes()
    
    // Проверяем результат и выводим детальную информацию
    if (result) {
      console.info(`📊 Результат: создано/проверено: ${result.createdCount}, ошибок: ${result.failedCount}, фактически в БД: ${result.actualCount}`)
      
      // Если не все индексы созданы, это ошибка
      if (result.actualCount < EXPECTED_TRGM_INDEXES_COUNT) {
        console.error(`❌ Недостаточно индексов: ожидалось ${EXPECTED_TRGM_INDEXES_COUNT}, найдено ${result.actualCount}`)
        exitCode = 1
      }
      
      if (result.failedCount > 0) {
        console.error(`❌ Ошибки при создании ${result.failedCount} индексов`)
        exitCode = 1
      }
    } else {
      console.error('❌ Функция createTrgmIndexes не вернула результат')
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
  } finally {
    await prisma.$disconnect()
    process.exit(exitCode)
  }
}

main()

