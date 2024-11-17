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

export { generateAccessToken}
