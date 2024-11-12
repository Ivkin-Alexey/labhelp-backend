import { prisma } from '../../../index.js'
import localizations from '../../assets/constants/localizations.js'
import { fetchEquipmentListFromGSheet } from '../../controllers/equipment-controller/g-sheet.js'
import { sendNotification } from '../../controllers/tg-bot-controllers/botAnswers.js'
import { clearTable } from '../common.js'
import { transformEquipmentList } from './helpers.js'

export async function getEquipmentByID(equipmentId, login, isAuthenticated) {
  try {
    let equipment
    if (login && isAuthenticated) {
      let rowData = await prisma.Equipment.findUnique({
        where: {
          id: equipmentId,
        },
        include: {
          favoriteEquipment: {
            where: { login },
          },
          operatingEquipment: true,
        },
      })

      equipment = rowData.map(transformEquipmentList)
    } else {
      equipment = await prisma.Equipment.findUnique({
        where: {
          id: equipmentId,
        },
      })
    }

    if (!equipment) {
      const msg = `Оборудование с Id ${equipmentId} не найдено в БД (при клике на карточку)`
      throw { message: msg, status: 404 }
    } else {
      return equipment
    }
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера (при клике на карточку): ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getEquipmentListByCategory(category, login, isAuthenticated) {
  try {
    let results
    if (login && isAuthenticated) {
      let rowData = await prisma.Equipment.findMany({
        where: {
          category,
        },
        include: {
          favoriteEquipment: {
            where: { login },
          },
          operatingEquipment: true,
        },
      })

      results = rowData.map(transformEquipmentList)
    } else {
      results = await prisma.Equipment.findMany({
        where: {
          category,
        },
      })
    }

    return results
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера (при поиске оборудования): ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getEquipmentListBySearch(searchTerm, login, isAuthenticated) {
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
    let results
    if (login && isAuthenticated) {
      let rowData = await prisma.Equipment.findMany({
        where: {
          OR: whereConditions,
        },
        include: {
          favoriteEquipment: {
            where: { login },
          },
          operatingEquipment: true,
        },
      })

      results = rowData.map(transformEquipmentList)
    } else {
      results = await prisma.Equipment.findMany({
        where: {
          OR: whereConditions,
        },
      })
    }

    return results
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера (при поиске оборудования): ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function createEquipmentDbFromGSheet() {
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
          `Обнаружено оборудование с неуникальным Id (при вставке в БД): ${nonUniqueRecords.length} позиций(я)`,
        )
        console.log(
          'Обработка записей с неуникальным Id. Будет показано не более 10 записей:',
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
