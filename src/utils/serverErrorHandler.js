import { PORT } from '../assets/constants/constants.js'

/**
 * Обрабатывает ошибки запуска HTTP сервера
 * @param {Error} err - Ошибка сервера
 */
export function handleServerError(err) {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Порт ${PORT || 'не указан'} уже занят! Попробуйте другой порт или остановите процесс, использующий этот порт.`)
    console.error(`💡 Для остановки процесса используйте: netstat -ano | findstr :${PORT || '8000'}`)
    process.exit(1)
  } else {
    console.error('❌ Ошибка запуска сервера:', err.message)
    process.exit(1)
  }
}
