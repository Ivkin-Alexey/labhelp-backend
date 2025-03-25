import { jwtTokenSecret } from '../../index.js'
import { sendError } from '../controllers/tg-bot-controllers/botAnswers.js'
import jwt from 'jsonwebtoken'

function verifyToken(token) {
  let isVerified = true
  jwt.verify(token, jwtTokenSecret, (err) => {
    if (err) isVerified = false
  })
  return isVerified
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  const requestPath = req.path
  const paths = ['/equipments', '/auth/', "/test"]

  const isTokenVerified = verifyToken(token)

  if (paths.some(path => requestPath.includes(path)) && (!token || !isTokenVerified)) {
    req.isAuthenticated = false
    return next()
  }

  if (token == null) {
    const msg = `Отсутствует JWT-токен. Запрос по адресу: ${req.url}`
    console.error(msg)
    sendError(msg)
    return res.status(401).json({ message: msg, status: 401 })
  }

  if (!isTokenVerified) {
    const msg = `Не валидный JWT-токен. Запрос по адресу: ${req.url}`
    console.error(msg)
    sendError(msg)
    return res.status(401).json({ message: msg, status: 401 })
  }

  req.isAuthenticated = true
  next()
}
