import jwt from 'jsonwebtoken'
import { jwtToken } from '../index.js'
import { jwtLifeTime } from '../assets/constants/constants.js'

function generateAccessToken(login, password, role = 'user') {
  return jwt.sign(
    {
      login,
      password,
      role,
    },
    jwtToken,
    {
      expiresIn: jwtLifeTime,
    },
  )
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, jwtToken, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

export { generateAccessToken, authenticateToken }
