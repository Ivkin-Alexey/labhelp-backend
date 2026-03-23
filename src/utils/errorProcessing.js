import { sendNotification } from "../controllers/tg-bot-controllers/botAnswers.js"

function isPrismaConnectionError(error) {
  // Prisma ошибки подключения имеют коды P1001, P1017 и т.д.
  return error?.code?.startsWith('P100') || error?.errorCode?.startsWith('P100') || 
         (error?.message && error.message.includes("Can't reach database server"))
}

function processEndpointError(res, error) {
  // Обработка Prisma ошибок подключения
  if (isPrismaConnectionError(error)) {
    const errorMessage = `❌ Ошибка подключения к БД при запросе: ${error.message || 'Не удается подключиться к серверу БД'}`
    console.error(errorMessage)
    sendNotification(errorMessage)
    return res.status(503).json({ message: 'Сервис временно недоступен. Проблемы с подключением к базе данных.', status: 503 })
  }
  
  if (error?.message) {
    const status = error.status || 500
    console.error(error.message)
    sendNotification(error.message)
    return res.status(status).json(error.message)
  } else {
    console.error(error)
    sendNotification(String(error))
    return res.status(500).json({ message: 'Внутренняя ошибка сервера', status: 500 })
  }
}

export { processEndpointError }
