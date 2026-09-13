import jwt from 'jsonwebtoken'
import { prisma, jwtTokenSecret } from '../../index.js'
import { personRoles } from '../assets/constants/users.js'

const adminRoles = [personRoles.admin, personRoles.superAdmin]

/**
 * Пускает только администраторов.
 *
 * Роль читается из БД, а не из JWT. Токен живёт 8 часов (jwtLifeTime), поэтому
 * роль из токена продолжала бы давать доступ к удалению всех записей
 * оборудования ещё 8 часов после понижения пользователя, и отозвать её можно
 * только внешним списком — тогда теряется смысл stateless-токена. Один SELECT
 * по первичному ключу на запрос дешевле этого риска.
 *
 * Роль в токене при этом пишется настоящая (см. generateAccessToken) — она
 * удобна для отладки, но проверять по ней права нельзя.
 *
 * authenticateToken эти маршруты не прикрывает: все пути /equipments/* для него
 * являются исключением, поэтому токен проверяем здесь сами.
 */
export async function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    const msg = `Отсутствует JWT-токен. Запрос по адресу: ${req.url}`
    return res.status(401).json({ message: msg, status: 401 })
  }

  let payload
  try {
    payload = jwt.verify(token, jwtTokenSecret)
  } catch {
    const msg = `Не валидный JWT-токен. Запрос по адресу: ${req.url}`
    return res.status(401).json({ message: msg, status: 401 })
  }

  // Запрос идёт напрямую, а не через getUserData: тому нужны все поля
  // профиля, здесь же достаточно одной роли, прочитанной по первичному ключу
  let user
  try {
    // @ts-ignore
    user = await prisma.User.findUnique({
      where: { login: payload.login },
      select: { role: true },
    })
  } catch {
    return res.status(503).json({ message: 'База данных недоступна', status: 503 })
  }

  if (!user) {
    const msg = `Пользователь ${payload.login} не найден`
    return res.status(401).json({ message: msg, status: 401 })
  }

  if (!adminRoles.includes(user.role)) {
    const msg = `У пользователя ${payload.login} недостаточно прав для этого запроса`
    return res.status(403).json({ message: msg, status: 403 })
  }

  req.login = payload.login
  return next()
}
