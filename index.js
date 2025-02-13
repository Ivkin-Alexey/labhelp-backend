import fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config()
import TelegramBot from 'node-telegram-bot-api'
import { PrismaClient } from '@prisma/client'
import { processCallbackQuery } from './src/controllers/tg-bot-controllers/callbackQueriesProcessing.js'
import { processCommand } from './src/controllers/tg-bot-controllers/commands.js'
import get from './src/routes/get/get.js'
import post from './src/routes/post.js'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import https from 'https'
import { HTTPS_PORT } from './src/assets/constants/constants.js'
import getEquipment from './src/routes/get/equipment.js'
import deleteMethod from './src/routes/delete.js'
import { authenticateToken } from './src/middlewaries/authenticate.js'
import { logRequestInfo, logSuccessfulResponse } from './src/middlewaries/logSuccessfulResponse.js'
import patch from './src/routes/patch.js'

process.on('uncaughtException', err => console.log(err))

process.traceDeprecation = true
process.env.NTBA_FIX_350 = true
const token = process.env.TELEGRAM_TOKEN
export const jwtTokenSecret = process.env.JWT_TOKEN_SECRET
export const bot = new TelegramBot(token, { polling: true })
export const prisma = new PrismaClient()

bot.on('message', async msg => await processCommand(bot, msg))
bot.on('callback_query', async ctx => await processCallbackQuery(bot, ctx))

const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(logRequestInfo)
app.use(authenticateToken)
app.use(logSuccessfulResponse)
getEquipment(app)
get(app)
post(app)
deleteMethod(app)
patch(app)

const httpsServer = https.createServer(
  {
    key: fs.readFileSync(process.env.SSL_PATH + 'privkey.pem'),
    cert: fs.readFileSync(process.env.SSL_PATH + 'fullchain.pem'),
  },
  app,
)

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`)
})
