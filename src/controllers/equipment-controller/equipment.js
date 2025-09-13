import { prisma } from "../../../index.js"
import localizations from "../../assets/constants/localizations.js"
import { createEquipmentDbFromGSheet } from "../../data-access/data-access-equipments/equipments.js"
import { processEndpointError } from "../../utils/errorProcessing.js"
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
  
export async function createEquipment(req, res) {
  try {
    const data = req.body
    
    if (!data) {
      return res.status(400).json({
        message: 'Данные об оборудовании отсутствуют'
      })
    }

    // @ts-ignore
    const newEquipment = await prisma.Equipment.create({
      data
    })

    res.status(201).json({
      equipment: newEquipment,
      message: 'Оборудование успешно создано'
    })

  } catch (error) {
    processEndpointError(res, error)
  } finally {
    await prisma.$disconnect()
  }
}
  
