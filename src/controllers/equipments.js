import { EquipmentItem } from '../assets/constants/equipments.js'
import { equipmentList, equipmentListSheetID } from '../assets/constants/gSpreadSheets.js'
import { readFile, writeFileSync } from 'fs'
import path from 'path'
import { getUserData } from './users.js'
import { prisma } from '../../index.js'
import { checkEquipmentID } from './helpers.js'
import { amountOfEquipment } from '../assets/constants/equipments.js'
import { personRoles } from '../assets/constants/users.js'
import localizations from '../assets/constants/localizations.js'
import __dirname from '../utils/__dirname.js'
import { sendNotification } from './tg-bot-controllers/botAnswers.js'
import { checkIsUserSuperAdmin } from "./users.js"


const equipmentJsonPath = path.join(__dirname, '..', 'assets', 'db', 'equipment.json')

async function reloadEquipmentDB(bot, chatID) {
  if (checkIsUserSuperAdmin(chatID)) {
    await bot.sendMessage(chatID, localizations.equipment.dbIsReloading)
    await createEquipmentDbFromGSheet()
      .then(r => bot.sendMessage(chatID, r))
      .catch(err => bot.sendMessage(chatID, err))
  } else {
    await bot.sendMessage(chatID, localizations.users.errors.userAccessError)
  }
}

async function createEquipmentDbFromGSheet() {
  async function transferEquipments(list) {
    const BATCH_SIZE = 1;
    const nonUniqueRecords = [];
    const failedRecords = [];

    for (let i = 0; i < list.length; i += BATCH_SIZE) {
      const batch = list.slice(i, i + BATCH_SIZE);
      
      try {
        await prisma.Equipments.createMany({
          data: batch,
        });
      } catch (error) {
        if (error.code === 'P2002') {
          nonUniqueRecords.push(...batch)
        } else {
          console.error('Ошибка при вставке данных:', error)
          failedRecords.push(...batch)
        }
      }
    }

    if (failedRecords.length > 0) {
      sendNotification(`Ошибка при вставке данных в БД: ${failedRecords.length} позиций(я)`)
      console.log('Обработка записей с ошибками:', failedRecords)
      failedRecords = []
    }

    if (nonUniqueRecords.length > 0) {
      sendNotification(`Обнаружено оборудование с неуникальным ID (при вставке в БД): ${nonUniqueRecords.length} позиций(я)`)
      console.log('Обработка записей с неуникальным ID:', nonUniqueRecords)
      nonUniqueRecords = []
    }
  }

  try {
    await clearTable(prisma.Equipments)
    const list = await fetchEquipmentListFromGSheet()
    await transferEquipments(list)
  } catch (error) {
    console.error('Ошибка при создании базы данных из GSheet:', error);
  } finally {
    await prisma.$disconnect();
  }
  return localizations.equipment.dbIsReloadedMsg
}

function checkIsCorrect(equipment) {
  const incorrect = ["нд", "нет", "?", "-"]
  const {serialNumber, inventoryNumber} = equipment
  
  function allFieldsAreFilled(obj) {
    for (const key in obj) {
      if (!obj[key]) {
        return false
      }
    }
    return true
  }

  if(!allFieldsAreFilled(equipment)) return false
  if (incorrect.includes(serialNumber) || incorrect.includes(inventoryNumber)) return false
  
  return true
}

async function fetchEquipmentListFromGSheet() {
  return new Promise(async (resolve, reject) => {
    try {
      const equipment = []
      await equipmentList.loadInfo()
      let sheet = equipmentList.sheetsById[equipmentListSheetID]
      const rows = await sheet.getRows()
      for (let i = 0; i < amountOfEquipment; i++) {
        const newEquipmentItem = new EquipmentItem()
        newEquipmentItem.name = rows[i].get('Наименование оборудования') || ''
        newEquipmentItem.description = rows[i].get('Область применения оборудования') || ''
        newEquipmentItem.brand = rows[i].get('Изготовитель') || ''
        newEquipmentItem.model = rows[i].get('Модель') || ''
        newEquipmentItem.category = rows[i].get('Категория') || ''
        newEquipmentItem.filesUrl =
          rows[i].get(
            'Эксплуатационно-техническая документация\n' +
              '(ссылка на облако)\n' +
              '\n' +
              'Паспорт/руководство по эксплуатации',
          ) || ''
        newEquipmentItem.imgUrl = rows[i].get('Ссылки на фотографии') || ''
        newEquipmentItem.serialNumber = rows[i].get('Заводской номер')
        newEquipmentItem.inventoryNumber = rows[i].get('Инвентарный №')
        newEquipmentItem.id = newEquipmentItem.inventoryNumber + newEquipmentItem.serialNumber
        if (!checkIsCorrect(newEquipmentItem)) {
          continue
        }
        equipment.push(newEquipmentItem)
      }
      resolve(equipment)
    } catch (e) {
      reject(e)
    }
  })
}

async function getEquipmentList() {
  return new Promise((resolve, reject) => {
    readFile(equipmentJsonPath, 'utf8', (error, data) => {
      if (error) {
        reject(`Ошибка чтения данных на сервере: ${error}. Сообщите о ней администратору`)
        return
      }
      const parsedData = JSON.parse(Buffer.from(data))
      resolve(parsedData)
    })
  })
}

async function getEquipmentListByCategory(category) {
  try {
    const list = await prisma.Equipments.findMany({
      where: {
        category: {
          equals: category,
        },
      },
    })
    return list
  } catch (e) {
    console.error(e)
    return e
  } finally {
    await prisma.$disconnect()
  }
}

async function clearTable(table) {
  try {
    await table.deleteMany({});
    console.log("Таблица успешно очищена.");
  } catch (error) {
    console.error("Ошибка при очистке таблицы:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getEquipmentListBySearch(searchTerm) {

    const fieldsToSearch = ['serialNumber', 'inventoryNumber', "name", "description", "brand", "model", "category"]
  
    const whereConditions = fieldsToSearch.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      }
    }));
  
    try {
      const results = await prisma.Equipments.findMany({
        where: {
          OR: whereConditions,
        }
      });
  
      return results;
    } catch (error) {
      console.error("Ошибка при поиске оборудования:", error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

export {
  getEquipmentList,
  getEquipmentListByCategory,
  getEquipmentListBySearch,
  createEquipmentDbFromGSheet,
  reloadEquipmentDB,
}
