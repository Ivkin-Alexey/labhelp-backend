import { jwtTokenSecret } from '../../index.js'
import { sendNotification } from '../controllers/tg-bot-controllers/botAnswers.js'
import jwt from 'jsonwebtoken'

function verifyToken(token) {
  let isVerified = true
  jwt.verify(token, jwtTokenSecret, (err) => {
    if (err) isVerified = false
  })
  return isVerified
}

const publicRoots = new Set(['auth', 'test'])

// Внутри /equipments/* публичными остаются поиск и карточки. Эти сегменты
// закрыты requireAdmin, поэтому пустить их без токена сюда значило бы
// открыть доступ раньше времени
const protectedEquipmentSegments = new Set(['sync-db', 'sync-status'])

/**
 * Публичные пути сверяются по сегментам, а не подстрокой. Сравнение вида
 * requestPath.includes('/equipments') выключало проверку токена и на путях
 * '/equipments-export', и на любом админском маршруте внутри /equipments/*
 */
function isPublicPath(requestPath) {
  const [root, secondSegment] = requestPath.split('/').filter(Boolean)
  if (publicRoots.has(root)) return true
  if (root === 'equipments') return !protectedEquipmentSegments.has(secondSegment)
  return false
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  const requestPath = req.path

  const isTokenVerified = verifyToken(token)

  if (isPublicPath(requestPath) && (!token || !isTokenVerified)) {
    req.isAuthenticated = false
    return next()
  }

  if (token == null) {
    const msg = `Отсутствует JWT-токен. Запрос по адресу: ${req.url}`
    console.error(msg)
    sendNotification(`❌ ${msg}`)
    return res.status(401).json({ message: msg, status: 401 })
  }

  if (!isTokenVerified) {
    const msg = `Не валидный JWT-токен. Запрос по адресу: ${req.url}`
    console.error(msg)
    sendNotification(`❌ ${msg}`)
    return res.status(401).json({ message: msg, status: 401 })
  }

  req.isAuthenticated = true
  next()
}
