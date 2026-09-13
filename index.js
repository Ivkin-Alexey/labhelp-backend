import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';
import { processCallbackQuery } from './src/controllers/tg-bot-controllers/callbackQueriesProcessing.js';
import { processCommand } from './src/controllers/tg-bot-controllers/commands.js';
import get from './src/routes/get/get.js';
import post from './src/routes/post.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import https from 'https';
import http from 'http';
import { HTTPS_PORT, PORT } from './src/assets/constants/constants.js';
import getEquipment from './src/routes/get/equipment.js';
import deleteMethod from './src/routes/delete.js';
import { authenticateToken } from './src/middlewaries/authenticate.js';
import { logRequestInfo, logSuccessfulResponse } from './src/middlewaries/logSuccessfulResponse.js';
import patch from './src/routes/patch.js';
import { forceCheckDatabaseConnection, startPeriodicConnectionCheck, handleStartupDatabaseError } from './src/utils/dbConnectionHandler.js';
import { CHECK_INTERVAL } from './src/utils/dbConnectionHandler.js';
import { handleServerError } from './src/utils/serverErrorHandler.js';

process.on('uncaughtException', err => console.log(err));

process.traceDeprecation = true;
process.env.NTBA_FIX_350 = true;
const token = process.env.TELEGRAM_TOKEN;
export const jwtTokenSecret = process.env.JWT_TOKEN_SECRET;
export const bot = new TelegramBot(token, { polling: false });
export const prisma = new PrismaClient();

bot.on('message', async msg => await processCommand(bot, msg));
bot.on('callback_query', async ctx => await processCallbackQuery(bot, ctx));

// Фикс ошибки призмы
// @ts-ignore
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logRequestInfo);
app.use(authenticateToken);
app.use(logSuccessfulResponse);

getEquipment(app);
get(app);
post(app);
deleteMethod(app);
patch(app);

const httpServer = http.createServer(app);

// Пул соединений больше не закрывается в каждой функции доступа к данным,
// поэтому освобождаем его при остановке процесса: nodemon шлёт SIGTERM перед
// каждым рестартом, а Ctrl+C в консоли — SIGINT
async function shutdown(signal) {
  console.log(`Получен ${signal}, закрываем подключение к базе данных`);
  httpServer.close();
  try {
    await prisma.$disconnect();
  } catch (error) {
    // Если БД уже недоступна, останавливаться из-за этого нельзя — иначе
    // nodemon будет ждать жёсткого завершения процесса
    console.error('Не удалось корректно закрыть подключение к базе данных:', error.message);
  }
  process.exit(0);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal));
}


// Проверяем подключение к БД при запуске (принудительно)
forceCheckDatabaseConnection().then(({ isConnected, error }) => {
  if (isConnected) {
    console.log('✅ Подключение к базе данных успешно установлено')
    httpServer.listen(PORT, () => {
      console.log(`✅ HTTP-сервер успешно запущен на порту: ${PORT}`);
    }).on('error', handleServerError);
    // Запускаем периодическую проверку подключения к БД
    startPeriodicConnectionCheck()
    console.log(`🔄 Запущена периодическая проверка подключения к БД (каждые ${CHECK_INTERVAL / 1000} секунд)`)

  } else {
    handleStartupDatabaseError(error);
    process.exit(1);
  }
});