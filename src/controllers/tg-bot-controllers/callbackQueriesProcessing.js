import { stickers } from '../../assets/constants/constants.js'
import localizations from '../../assets/constants/localizations.js'
import { sendResearches, sendWebAppButtonWithMessage } from './botAnswers.js'

const { invitationToRegistration } = localizations.botAnswers

async function processCallbackQuery(bot, ctx) {
  const { id, first_name, last_name } = ctx.message.chat
  // const msgID = ctx.message?.message_id
  const chatID = id
  let messageData = JSON.parse(ctx.data)
  messageData.first_name = first_name
  messageData.last_name = last_name

  try {
    let answer = undefined
    if (messageData?.answer) answer = messageData.answer
    if (messageData?.research) answer = 'research'
    switch (answer) {
      case 'Yes':
        await bot.sendSticker(chatID, stickers.agree)
        // await updateUserData(chatID, {
        //   firstName: messageData.first_name,
        //   lastName: messageData.last_name,
        //   chatID,
        // })
        await sendResearches(bot, chatID)
        break
      case 'No':
        await bot.sendSticker(chatID, stickers.disagree)
        break
      case 'research':
        await bot.sendSticker(chatID, stickers.ok)
        // await updateUserData(chatID, messageData)
        await sendWebAppButtonWithMessage(bot, chatID, invitationToRegistration)
        break
      // case 'adminConfirmUser':
      //   await bot.sendMessage(superAdminsChatID[0], 'Данные сохранены на сервере')
      //   break
      // case 'adminDoesntConfirmUser':
      //   await bot.sendMessage(superAdminsChatID[0], 'Заявка отменена')
      //   break
      // case 'confirm':
      //   await processReagentAppConfirmation(chatID, msgID, bot)
      //   break
      // case 'reject':
      //   await bot.sendMessage(superAdminsChatID[0], 'Заявка отменена')
      //   break
    }
  } catch (error) {
    console.log(error)
  }
}

export { processCallbackQuery }
