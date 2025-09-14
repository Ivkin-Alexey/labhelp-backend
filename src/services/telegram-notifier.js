import { bot } from "../../index.js";
import { admins, programmerChatID } from "../assets/constants/constants.js";

export async function notifyProgrammer(message) {
  await bot.sendMessage(programmerChatID, message)
}

export async function notifyAdmins(message) {
  admins.forEach(admin => {
    bot.sendMessage(admin, message)
  })
}