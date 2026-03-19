/**
 * Безопасная отправка сообщения в Telegram с обработкой ошибок
 * @param {Object} bot - Экземпляр Telegram Bot
 * @param {string|number} chatId - ID чата для отправки сообщения
 * @param {string} message - Текст сообщения
 * @param {Object} options - Дополнительные опции для sendMessage
 * @returns {Promise<boolean>} - true если сообщение отправлено успешно, false в случае ошибки
 */
export async function sendTelegramMessageSafe(bot, chatId, message, options = {}) {
  try {
    await bot.sendMessage(chatId, message, options)
    return true
  } catch (error) {
    // Handle "chat not found" and other Telegram API errors gracefully
    const errorMessage = error.message || ''
    const errorDescription = error.response?.body?.description || ''
    
    if (errorMessage.includes('chat not found') || errorDescription.includes('chat not found')) {
      console.warn(`Cannot send notification: chat not found (ID: ${chatId})`)
    } else {
      console.error(`Error sending notification to chat (ID: ${chatId}):`, error.message)
    }
    return false
  }
}

