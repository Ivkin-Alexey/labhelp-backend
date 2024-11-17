import { jwtTokenSecret } from '../../index.js'
import { sendError } from '../controllers/tg-bot-controllers/botAnswers.js'
import jwt from 'jsonwebtoken'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  const requestPath = req.path
  const paths = ['/equipments/', '/auth/'];

  console.log(requestPath);
  
  if (paths.some(path => requestPath.includes(path)) && !token) {
    req.isAuthenticated = false;
    return next();
  }

  if (token == null) {
    const msg = `Отсутствует JWT-токен. Запрос по адресу: ${req.url}`
    console.error(msg)
    sendError(msg)
    return res.status(401).json({ message: msg, status: 401 })
  }

  jwt.verify(token, jwtTokenSecret, (err, user) => {
    if (err) {
      const msg = `Некорректный JWT-токен. Запрос по адресу: ${req.url}`
      console.error(msg)
      sendError(msg)
      return res.status(403).json({ message: msg, status: 403 })
    }
    req.user = user
    req.isAuthenticated = true
    next()
  })
}
