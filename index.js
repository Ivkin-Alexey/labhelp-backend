import fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config()
import TelegramBot from 'node-telegram-bot-api'
import { PrismaClient } from '@prisma/client'
import { processCallbackQuery } from './src/controllers/callbackQueriesProcessing.js'
import { processCommand } from './src/controllers/tg-bot-controllers/commands.js'
import get from './src/routes/get.js'
import post from './src/routes/post.js'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import http from 'http'
import https from 'https'
import { PORT, HTTPS_PORT } from './src/assets/constants/constants.js'

process.on('uncaughtException', err => console.log(err))

process.traceDeprecation = true
process.env.NTBA_FIX_350 = true
const token = process.env.TELEGRAM_TOKEN
export const jwtToken = process.env.JWT_TOKEN_SECRET
export const bot = new TelegramBot(token, { polling: true })
export const prisma = new PrismaClient();

bot.on('message', async msg => await processCommand(bot, msg))
bot.on('callback_query', async ctx => await processCallbackQuery(bot, ctx))

const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
get(app)
post(app)

const httpServer = http.createServer(app)

const httpsServer = https.createServer({
    key: fs.readFileSync(process.env.SSL_PATH + 'privkey.pem'),
    cert: fs.readFileSync(process.env.SSL_PATH + 'fullchain.pem'),
}, app);

httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`)
})

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
})
