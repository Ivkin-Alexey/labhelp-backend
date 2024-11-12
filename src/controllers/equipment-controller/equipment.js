import localizations from "../../assets/constants/localizations.js"
import { createEquipmentDbFromGSheet } from "../../data-access/data-access-equipments/equipments.js"
import { checkIsUserSuperAdmin } from "../users.js"

export async function reloadEquipmentDB(bot, chatID) {
    if (checkIsUserSuperAdmin(chatID)) {
      await bot.sendMessage(chatID, localizations.equipment.dbIsReloading)
      await createEquipmentDbFromGSheet()
        .then(r => bot.sendMessage(chatID, r))
        .catch(err => bot.sendMessage(chatID, err))
    } else {
      await bot.sendMessage(chatID, localizations.users.errors.userAccessError)
    }
  }
  
