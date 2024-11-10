import jwt from 'jsonwebtoken'
import { jwtTokenSecret } from '../../index.js'
import { jwtLifeTime } from '../assets/constants/constants.js'
import { sendError } from './tg-bot-controllers/botAnswers.js'

function generateAccessToken(login, role = 'user') {
  return jwt.sign(
    {
      login,
      role,
    },
    jwtTokenSecret,
    {
      expiresIn: jwtLifeTime,
    },
  )
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    const msg = `Отсутствует JWT-токен. Запрос по адресу: ${req.url}`
    console.error(msg)
    sendError(msg)
    return res.status(401).json({message: msg, status: 401})
  }

  jwt.verify(token, jwtTokenSecret, (err, user) => {
    if (err) {
      const msg = `Некорректный JWT-токен. Запрос по адресу: ${req.url}`
      console.error(msg)
      sendError(msg)
      return res.status(403).json({message: msg, status: 403})
    }
    req.user = user
    next()
  })
}

export { generateAccessToken, authenticateToken }
