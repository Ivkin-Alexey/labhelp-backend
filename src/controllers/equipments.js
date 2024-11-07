import { EquipmentItem } from '../assets/constants/equipments.js'
import { equipmentList, equipmentListSheetID } from '../assets/constants/gSpreadSheets.js'
import { readFile } from 'fs'
import path from 'path'
import { prisma } from '../../index.js'
import { amountOfEquipment } from '../assets/constants/equipments.js'
import localizations from '../assets/constants/localizations.js'
import __dirname from '../utils/__dirname.js'
import { sendNotification } from './tg-bot-controllers/botAnswers.js'
import { checkIsUserSuperAdmin } from './users.js'

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
    const BATCH_SIZE = 1
    let nonUniqueRecords = []
    let failedRecords = []

    for (let i = 0; i < list.length; i += BATCH_SIZE) {
      const batch = list.slice(i, i + BATCH_SIZE)

      try {
        await prisma.Equipment.createMany({
          data: batch,
        })
      } catch (error) {
        if (error.code === 'P2002') {
          nonUniqueRecords.push(...batch)
        } else {
          failedRecords.push(...batch)
        }
      }
    }

    if (failedRecords.length > 0) {
      sendNotification(`Ошибка при вставке данных в БД: ${failedRecords.length} позиций(я)`)
      console.log(
        'Обработка записей с ошибками. Будет показано не более 10 записей:',
        failedRecords.slice(0, 10),
      )
      failedRecords = []
    }

    if (nonUniqueRecords.length > 0) {
      sendNotification(
        `Обнаружено оборудование с неуникальным ID (при вставке в БД): ${nonUniqueRecords.length} позиций(я)`,
      )
      console.log(
        'Обработка записей с неуникальным ID. Будет показано не более 10 записей:',
        nonUniqueRecords.slice(0, 10),
      )
      nonUniqueRecords = []
    }
  }

  try {
    await clearTable(prisma.Equipment)
    console.info('База данных оборудования обновляется...')
    const list = await fetchEquipmentListFromGSheet()
    await transferEquipments(list)
    console.info('База данных оборудования обновлена')
  } catch (error) {
    console.error('Ошибка при создании базы данных из GSheet:', error)
  } finally {
    await prisma.$disconnect()
  }
  return localizations.equipment.dbIsReloadedMsg
}

function checkIsCorrect(equipment) {
  const incorrect = ['нд', 'нет', '?', '-']
  const { serialNumber, inventoryNumber } = equipment

  function allFieldsAreFilled(obj) {
    for (const key in obj) {
      if (!obj[key]) {
        return false
      }
    }
    return true
  }

  if (!allFieldsAreFilled(equipment)) return false
  if (incorrect.includes(serialNumber) || incorrect.includes(inventoryNumber)) return false

  return true
}

async function fetchEquipmentListFromGSheet() {
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
    return equipment
  } catch (e) {
    console.log(e)
  }
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
    const list = await prisma.Equipment.findMany({
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
    await table.deleteMany({})
    console.log('Таблица успешно очищена.')
  } catch (error) {
    console.error('Ошибка при очистке таблицы:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function getEquipmentListBySearch(searchTerm) {
  const fieldsToSearch = [
    'serialNumber',
    'inventoryNumber',
    'name',
    'description',
    'brand',
    'model',
    'category',
  ]

  const whereConditions = fieldsToSearch.map(field => ({
    [field]: {
      contains: searchTerm,
      mode: 'insensitive',
    },
  }))

  try {
    const results = await prisma.Equipment.findMany({
      where: {
        OR: whereConditions,
      },
    })

    return results
  } catch (error) {
    console.error('Ошибка при поиске оборудования:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export {
  getEquipmentList,
  getEquipmentListByCategory,
  getEquipmentListBySearch,
  createEquipmentDbFromGSheet,
  reloadEquipmentDB,
}
