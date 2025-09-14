import { prisma } from "../../index.js"

export async function clearTable(table) {
    try {
      await table.deleteMany({})
      console.log(`Таблица ${table.name || 'Unknown'} успешно очищена`)
    } catch (error) {
      console.error(`Ошибка при очистке таблицы ${table.name || 'Unknown'}:`, error)
    } finally {
      await prisma.$disconnect()
    }
  }