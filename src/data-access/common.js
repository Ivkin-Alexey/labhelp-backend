import { prisma } from "../../index.js"

export async function clearTable(table) {
    try {
      await table.deleteMany({})
      console.log('Таблица успешно очищена.')
    } catch (error) {
      console.error('Ошибка при очистке таблицы:', error)
    } finally {
      await prisma.$disconnect()
    }
  }