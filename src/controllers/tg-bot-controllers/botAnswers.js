import fs from 'fs'
import {
  keyboards,
  stickers,
  researches,
  editProfileUrl,
  userCommands,
  adminCommands,
} from '../../assets/constants/constants.js'
import localizations from '../../assets/constants/localizations.js'
import { personRoles } from '../../assets/constants/users.js'
import { bot } from '../../../index.js'
import { programmerChatID } from '../../assets/constants/constants.js'
import { sendTelegramMessageSafe } from '../../utils/telegram-helpers.js'

async function sendStartMessage(bot, chatID, first_name, last_name) {
  await bot.sendSticker(chatID, stickers.hello)
  await bot.sendMessage(
    chatID,
    `Привет ${last_name} ${first_name}! ` + localizations.startMessage,
  )
  bot.sendMessage(chatID, adminCommands)
}

async function sendWebAppButtonWithMessage(bot, chatID, message) {
  const url = editProfileUrl.replace(':chatID', chatID)
  await bot.sendMessage(chatID, message, {
    reply_markup: {
      inline_keyboard: [[{ text: 'Заполнить', web_app: { url } }]],
    },
  })
}

async function sendResearches(bot, chatID) {
  const keyboard = [...keyboards.researches, ['❌ Закрыть меню']]
  await bot.sendMessage(chatID, localizations.selectResearches, {
    reply_markup: {
      keyboard,
    },
    isResearch: true,
  })
}

async function sendNotification(message) {
  await sendTelegramMessageSafe(bot, programmerChatID, message)
}


async function sendResearch(bot, chatID, researchTopic) {
  const research = researches.find(el => el.name === researchTopic)
  const { id, degree, advisor } = research
  const imageStream = fs.createReadStream(`./assets/images/${id}.jpg`)
  await bot.sendPhoto(chatID, imageStream)
  await bot.sendMessage(chatID, 'Руководитель направления: ' + degree + ' ' + advisor)
  await bot.sendMessage(
    chatID,
    'Описание направления. Описание направления. Описание направления. Описание направления.',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Присоединиться',
              callback_data: JSON.stringify({ research: researchTopic }),
            },
          ],
        ],
      },
      disable_notification: true,
    },
  )
}

async function sendConfusedMessage(bot, chatID) {
  await bot.sendSticker(chatID, stickers.unknown)
  await bot.sendMessage(chatID, localizations.iDontUnderstand)
}

async function sendCommandList(bot, chatID) {
  await bot.sendMessage(chatID, userCommands)
}

// eslint-disable-next-line no-unused-vars
async function sendUserData(bot, chatID, userData) {
  const { first_name, last_name, phone, position, study, research } = userData
  await bot.sendMessage(
    chatID,
    `Мои данные: \n${research}\n${position}, ${study}\n${last_name} ${first_name}\n${phone}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Подтвердить',
              callback_data: JSON.stringify({ userAnswer: 'userConfirmData' }),
            },
          ],
          [
            {
              text: 'Редактировать',
              callback_data: JSON.stringify({
                userAnswer: 'userWantToEditData',
              }),
            },
          ],
        ],
      },
    },
  )
}

export {
  sendResearch,
  sendStartMessage,
  sendResearches,
  sendConfusedMessage,
  sendWebAppButtonWithMessage,
  sendNotification,
  sendCommandList,
}
