import { checkTextIsResearch } from '../validation.js'
import {
  sendStartMessage,
  sendResearches,
  sendResearch,
  sendConfusedMessage,
  sendCommandList,
} from './botAnswers.js'
import { addRandomUser, deleteUsersWithEmptyChatID, updateUserData, getUserData } from '../users.js'
import { reloadEquipmentDB } from '../equipments.js'
import { askReagentsManagerChatID } from '../replyToMessage.js'
import { personRoles } from '../../assets/constants/users.js'
import localizations from '../../assets/constants/localizations.js'

async function processCommand(bot, command) {
  const chatID = command.chat.id
  let text = command.text
  const { first_name, last_name } = command.chat
  const isResearch = checkTextIsResearch(text)
  if (isResearch) text = isResearch

  try {
    switch (text) {
      case '❌ Закрыть меню':
        await bot.sendMessage(chatID, 'Меню закрыто', {
          reply_markup: {
            remove_keyboard: true,
          },
        })
        break
      case '/start':
        await sendStartMessage(bot, chatID, first_name, last_name)
        break
      case '/help':
        await sendCommandList(bot, chatID)
        break
      case '/addRandomUser':
        await addRandomUser()
        break
      case '/addRandomAdmin':
        await addRandomUser('admin')
        break
      case '/addRandomSuperAdmin':
        await addRandomUser('superAdmin')
        break
      case '/deleteUsersWithEmptyChatID':
        await deleteUsersWithEmptyChatID(chatID)
        break
      case '/researches':
        await sendResearches(bot, chatID)
        break
      case '/get_chat_id':
        await bot.sendMessage(chatID, 'Чат ID: ' + chatID)
        break
      case '/reloadEquipmentDB':
        await reloadEquipmentDB(bot, chatID)
        break
      case '/setReagentsManagerChatID':
        await getUserData(chatID)
          .then(userData => {
            if (userData.role === personRoles.superAdmin) askReagentsManagerChatID(bot, chatID)
            else bot.sendMessage(chatID, localizations.users.errors.userAccessError)
          })
          .catch(e => bot.sendMessage(chatID, e))
        break
      case '/get_my_data':
        await getUserData(chatID).then(res => bot.sendMessage(chatID, res))
        break
      case isResearch:
        await sendResearch(bot, chatID, isResearch)
        await updateUserData(chatID, { research: isResearch })
        break
      default:
        if (!command.reply_to_message) {
          await sendConfusedMessage(bot, chatID)
        }
    }
  } catch (e) {
    console.log(e)
  }

  // if (command?.web_app_data?.data) {
  //     try {
  //         const data = JSON.parse(command?.web_app_data?.data)git
  //         await bot.sendMessage(chatID, 'Спасибо за обратную связь!' + JSON.stringify(data));
  //     } catch (e) {
  //         console.log(e);
  //     }
  // }
}

export { processCommand }
