import { bot } from "../../index";
import { programmerChatID } from "../assets/constants/constants";

export async function sendTelegramAlert(message) {
  await bot.sendMessage(programmerChatID, message)
}