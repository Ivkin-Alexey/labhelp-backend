import { bot } from "../../index";
import { admins, programmerChatID } from "../assets/constants/constants";

export async function notifyProgrammer(message) {
  await bot.sendMessage(programmerChatID, message)
}

export async function notifyAdmins(message) {
  admins.forEach(admin => {
    bot.sendMessage(admin, message)
  })
}