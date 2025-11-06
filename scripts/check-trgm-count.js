import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaClient } from '@prisma/client'

/**
 * Скрипт для проверки количества триграммных индексов
 * Используется в деплой скриптах для проверки наличия индексов
 */
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$connect()
    
    const result = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE '%_trgm%';
    `)
    
    const count = result?.[0]?.count 
      ? (typeof result[0].count === 'bigint' 
          ? Number(result[0].count) 
          : parseInt(String(result[0].count), 10))
      : 0
    
    // Выводим только число для использования в bash скриптах
    console.log(count)
    process.exit(0)
  } catch (error) {
    console.error(`Error: ${error.message}`, { to: { stderr: true } })
    console.log(0)  // В случае ошибки возвращаем 0
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


