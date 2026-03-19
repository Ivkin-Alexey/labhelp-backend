import { prisma } from '../../index.js'
import { sendNotification } from '../controllers/tg-bot-controllers/botAnswers.js'

// Кэш состояния подключения
let connectionStatus = { isConnected: false, lastCheck: 0, error: null }
export const CHECK_INTERVAL = 30000 // 30 секунд

export async function checkDatabaseConnection() {
  const now = Date.now()
  
  // Если проверяли недавно и соединение было неуспешным, возвращаем кэш
  if (!connectionStatus.isConnected && (now - connectionStatus.lastCheck) < CHECK_INTERVAL) {
    return { isConnected: false, error: connectionStatus.error }
  }
  
  // Для успешных соединений всегда делаем реальную проверку, чтобы не пропустить отключение БД
  // Используем реальный SQL запрос для проверки доступности БД
  try {
    await prisma.$queryRaw`SELECT 1`
    connectionStatus = { isConnected: true, lastCheck: now, error: null }
    return { isConnected: true }
  } catch (error) {
    connectionStatus = { isConnected: false, lastCheck: now, error }
    return { isConnected: false, error }
  }
}

export async function handleDatabaseConnectionError(error, checkTime = '') {
  // Извлекаем только основное сообщение об ошибке, убираем технические детали Prisma
  let cleanMessage = error.message || 'Неизвестная ошибка'
  
  // Убираем технические детали Prisma из сообщения
  if (cleanMessage.includes("Can't reach database server")) {
    cleanMessage = cleanMessage.split('\n')[0] // Берем только первую строку
    cleanMessage = cleanMessage.replace('Invalid `prisma.$queryRaw()` invocation:', '').trim()
    // Извлекаем только суть: адрес сервера
    const match = cleanMessage.match(/Can't reach database server at `(.+?)`/)
    if (match) {
      cleanMessage = `Сервер БД недоступен: ${match[1]}`
    }
  }
  
  const timeText = checkTime ? ` [${checkTime}]` : ''
  const errorMessage = `❌ БД недоступна${timeText}: ${cleanMessage}`
  console.error(errorMessage)
  await sendNotification(errorMessage)
}

export async function handleStartupDatabaseError(error) {
  const errorMessage = `❌ Сервер не запущен из-за проблем с подключением к базе данных: ${error?.message || 'Неизвестная ошибка'}`
  console.error(errorMessage)
  await sendNotification(errorMessage)
}

export async function forceCheckDatabaseConnection() {
  try {
    // Используем реальный SQL запрос для проверки доступности БД
    await prisma.$queryRaw`SELECT 1`
    connectionStatus = { isConnected: true, lastCheck: Date.now(), error: null }
    return { isConnected: true }
  } catch (error) {
    connectionStatus = { isConnected: false, lastCheck: Date.now(), error }
    return { isConnected: false, error }
  }
}

export function startPeriodicConnectionCheck() {
  setInterval(async () => {
    const checkTime = new Date().toLocaleString('ru-RU')
    const { isConnected, error } = await checkDatabaseConnection()
    if (!isConnected) {
      await handleDatabaseConnectionError(error || new Error('Подключение к БД недоступно'), checkTime)
    } else {
      console.log(`✅ БД доступна [${checkTime}]`)
    }
  }, CHECK_INTERVAL)
}

