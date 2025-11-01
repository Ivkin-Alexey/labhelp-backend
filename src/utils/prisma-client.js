import { PrismaClient } from '@prisma/client'

// Фикс для сериализации BigInt в JSON
// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString())
  return int ?? this.toString()
}

// Создаем экземпляр Prisma Client для использования в скриптах
// Этот модуль НЕ запускает сервер, только предоставляет клиент БД
export const prisma = new PrismaClient()

