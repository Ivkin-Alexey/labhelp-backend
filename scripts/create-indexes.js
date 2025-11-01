import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaClient } from '@prisma/client'

// Создаем отдельный экземпляр Prisma для скрипта, чтобы не запускать сервер
const prisma = new PrismaClient()

// Фикс для сериализации BigInt
// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString())
  return int ?? this.toString()
}

// Импортируем функцию после инициализации Prisma
import { createTrgmIndexes } from '../src/data-access/data-access-equipments/equipments.js'

// Скрипт для создания триграммных индексов из командной строки
// Используется в CI/CD деплое и может быть вызван напрямую
async function main() {
  try {
    console.info('🔄 Запуск создания триграммных индексов...')
    console.info('📍 Текущая директория:', process.cwd())
    console.info('📦 DATABASE_URL:', process.env.DATABASE_URL ? 'установлен' : 'НЕ УСТАНОВЛЕН')
    
    // Передаем свой экземпляр Prisma, чтобы не запускать сервер
    await createTrgmIndexes(prisma)
    
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

