import * as dotenv from 'dotenv'
dotenv.config()
import { createTrgmIndexes } from '../src/data-access/data-access-equipments/equipments.js'
import { prisma } from '../index.js'

// Скрипт для создания триграммных индексов из командной строки
// Используется в CI/CD деплое и может быть вызван напрямую
async function main() {
  try {
    console.info('🔄 Запуск создания триграммных индексов...')
    console.info('📍 Текущая директория:', process.cwd())
    console.info('📦 DATABASE_URL:', process.env.DATABASE_URL ? 'установлен' : 'НЕ УСТАНОВЛЕН')
    
    await createTrgmIndexes()
    
    console.info('✅ Процесс завершен успешно')
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при создании индексов:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.warn('⚠️ Ошибка при отключении от БД:', disconnectError.message)
    }
  }
}

main()

