import jwt from 'jsonwebtoken'
import { jwtTokenSecret } from '../../index.js'
import { jwtLifeTime } from '../assets/constants/constants.js'

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

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, jwtTokenSecret, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

export { generateAccessToken, authenticateToken }
