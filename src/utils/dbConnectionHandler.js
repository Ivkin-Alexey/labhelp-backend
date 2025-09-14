import { prisma } from '../../index.js'
import { sendNotification } from '../controllers/tg-bot-controllers/botAnswers.js'

// Кэш состояния подключения
let connectionStatus = { isConnected: false, lastCheck: 0, error: null }
export const CHECK_INTERVAL = 30000 // 30 секунд

export async function checkDatabaseConnection() {
  const now = Date.now()
  
  // Если проверяли недавно и соединение было успешным, возвращаем кэш
  if (connectionStatus.isConnected && (now - connectionStatus.lastCheck) < CHECK_INTERVAL) {
    return { isConnected: true }
  }
  
  // Если проверяли недавно и соединение было неуспешным, возвращаем кэш
  if (!connectionStatus.isConnected && (now - connectionStatus.lastCheck) < CHECK_INTERVAL) {
    return { isConnected: false, error: connectionStatus.error }
  }
  
  // Выполняем реальную проверку
  try {
    await prisma.$connect()
    connectionStatus = { isConnected: true, lastCheck: now, error: null }
    return { isConnected: true }
  } catch (error) {
    connectionStatus = { isConnected: false, lastCheck: now, error }
    return { isConnected: false, error }
  }
}

export async function handleDatabaseConnectionError(error, context = '') {
  const errorMessage = `❌ Ошибка подключения к БД${context ? ` (${context})` : ''}: ${error.message}`
  console.error(errorMessage)
  await sendNotification(errorMessage)
}

export async function handleStartupDatabaseError(error) {
  const errorMessage = `❌ Сервер не запущен из-за проблем с подключением к базе данных: ${error?.message || 'Неизвестная ошибка'}`
  console.error(errorMessage)
}

export async function forceCheckDatabaseConnection() {
  try {
    await prisma.$connect()
    connectionStatus = { isConnected: true, lastCheck: Date.now(), error: null }
    return { isConnected: true }
  } catch (error) {
    connectionStatus = { isConnected: false, lastCheck: Date.now(), error }
    return { isConnected: false, error }
  }
}

export function startPeriodicConnectionCheck() {
  setInterval(async () => {
    const { isConnected, error } = await checkDatabaseConnection()
    if (!isConnected) {
      await handleDatabaseConnectionError(error || new Error('Подключение к БД недоступно'), 'периодическая проверка')
    }
  }, CHECK_INTERVAL)
}

