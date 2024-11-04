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
const equipmentJsonPath = path.join(__dirname, '..', 'assets', 'db', 'equipment.json')

async function reloadEquipmentDB(bot, chatID) {
  const userData = await getUserData(chatID)

  if (userData.role === personRoles.superAdmin) {
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
    const BATCH_SIZE = 50
    for (let i = 0; i < list.length; i += BATCH_SIZE) {
      const batch = list.slice(i, i + BATCH_SIZE)
      await prisma.$transaction(async prisma => {
        await prisma.Equipments.createMany({
          data: batch,
        })
      })
    }
  }

  return new Promise((resolve, reject) => {
    clearTable(prisma.Equipments)
    fetchEquipmentListFromGSheet().then(async list => {
      transferEquipments(list)
        .catch(e => console.error(e))
        .finally(async () => {
          await prisma.$disconnect()
        })
      resolve(localizations.equipment.dbIsReloadedMsg)
    })
  })
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

async function getEquipmentListBySearch(search) {
  return new Promise(async (resolve, reject) => {
    try {
      if (search === '') {
        reject('Некорректный поисковый запрос')
      }
      const term = search.toLowerCase()
      const list = await getEquipmentList()
      const searchResultList = []
      for (let category in list) {
        // Сначала ищем совпадения в категориях. Если ни одной не найти, то переходим к поиску по определенным полям каждого оборудования
        if (category.toLowerCase().includes(term)) {
          searchResultList.push(...list[category])
        }
      }
      if (searchResultList.length > 0) {
        resolve(searchResultList)
      } else {
        const searchFields = ['category', 'name', 'brand', 'model']
        for (let category in list) {
          const arr = list[category]
          arr.forEach(el => {
            searchFields.forEach(item => {
              const value = el[item]
              if (value.toLowerCase().includes(term)) {
                searchResultList.push(el)
              }
            })
          })
        }
        resolve(searchResultList)
      }
    } catch (e) {
      reject(e)
    }
  })
}

export {
  getEquipmentList,
  getEquipmentListByCategory,
  getEquipmentListBySearch,
  createEquipmentDbFromGSheet,
  reloadEquipmentDB,
}
