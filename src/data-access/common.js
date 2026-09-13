export async function clearTable(table) {
    try {
      await table.deleteMany({})
      console.log(`Таблица ${table.name || 'Unknown'} успешно очищена`)
    } catch (error) {
      // Ошибку пробрасываем, а не глотаем: если таблица не очистилась,
      // синхронизация должна остановиться. Иначе данные из Google Sheets
      // допилятся поверх старых и в базе появятся дубликаты
      console.error(`Ошибка при очистке таблицы ${table.name || 'Unknown'}:`, error)
      throw error
    }
  }