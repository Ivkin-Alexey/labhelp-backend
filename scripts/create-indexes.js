import * as dotenv from 'dotenv'
dotenv.config()
import { createTrgmIndexes } from '../src/data-access/data-access-equipments/equipments.js'
import { prisma } from '../index.js'

// Скрипт для создания триграммных индексов из командной строки
// Используется в CI/CD деплое и может быть вызван напрямую
async function main() {
  try {
    console.info('🔄 Запуск создания триграммных индексов...')
    await createTrgmIndexes()
    console.info('✅ Процесс завершен успешно')
  } catch (error) {
    console.error('❌ Ошибка при создании индексов:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

