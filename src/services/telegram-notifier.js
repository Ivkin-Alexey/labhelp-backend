import { bot } from "../../index.js";
import { admins, programmerChatID } from "../assets/constants/constants.js";
import { sendTelegramMessageSafe } from "../utils/telegram-helpers.js";

export async function notifyProgrammer(message) {
  await sendTelegramMessageSafe(bot, programmerChatID, message)
}

export async function notifyAdmins(message) {
  const promises = admins.map(admin => 
    sendTelegramMessageSafe(bot, admin, message)
  )
  
  await Promise.all(promises)
}