import { readJsonFile, writeJsonFile } from '../fs.js'
import path from 'path'
import __dirname from '../../utils/__dirname.js'
import localizations from '../../assets/constants/localizations.js'
import { prisma } from '../../../index.js'
import { sendError } from '../tg-bot-controllers/botAnswers.js'
import { getFavoriteEquipmentsFromDB } from '../../data-access/data-access-equipments/favorite-equipments.js'
const workingEquipmentJsonPath = path.join(__dirname, '..', 'assets', 'db', 'workingEquipment.json')
const searchHistoryJsonPath = path.join(__dirname, '..', 'assets', 'db', 'searchHistory.json')

export async function addWorkingEquipmentToDB(equipment) {
  return new Promise((resolve, reject) => {
    try {
      readJsonFile(workingEquipmentJsonPath).then(parsedData => {
        if (!parsedData[equipment.category]) {
          parsedData[equipment.category] = []
        }
        parsedData[equipment.category].push(equipment)
        writeJsonFile(workingEquipmentJsonPath, parsedData)
        resolve()
      })
    } catch (e) {
      reject(e)
    }
  })
}

export async function deleteWorkingEquipmentFromDB(equipment) {
  return new Promise((resolve, reject) => {
    try {
      readJsonFile(workingEquipmentJsonPath).then(parsedData => {
        const workingEquipmentItem = parsedData[equipment.category]?.find(
          el => el.id === equipment.id,
        )
        if (!workingEquipmentItem) {
          reject({ error: localizations.equipment.operating.empty, status: 404 })
        } else {
          parsedData[equipment.category] = parsedData[equipment.category].filter(
            el => el.id !== equipment.id,
          )
          if (parsedData[equipment.category].length === 0) delete parsedData[equipment.category]
        }
        writeJsonFile(workingEquipmentJsonPath, parsedData)
        resolve()
      })
    } catch (e) {
      reject(e)
    }
  })
}

export async function getWorkingEquipmentListFromDB() {
  return new Promise((resolve, reject) => {
    try {
      readJsonFile(workingEquipmentJsonPath).then(parsedData => resolve(parsedData))
    } catch (e) {
      reject(e)
    }
  })
}

export async function getSearchHistoryFromDB(login) {
  return new Promise((resolve, reject) => {
    try {
      readJsonFile(searchHistoryJsonPath).then(parsedData => {
        if (!parsedData[login] || parsedData[login].length === 0) {
          resolve([])
          return
        }
        resolve(parsedData[login])
      })
    } catch (e) {
      reject(e)
    }
  })
}

export function addSearchTermToDB(login, term) {
  console.log('Событие: Добавление поискового запроса', 'login: ', login, 'term: ', term)
  return new Promise((resolve, reject) => {
    try {
      readJsonFile(searchHistoryJsonPath)
        .then(async parsedData => {
          if (!parsedData[login]) parsedData[login] = []
          else if (parsedData[login].length !== 0) {
            const searchTerm = parsedData[login].find(el => el === term)
            if (searchTerm) {
              resolve(localizations.equipment.searchHistory.errors.notUnique)
              return
            }
          }
          parsedData[login].push(term)
          return parsedData
        })
        .then(updatedParsedData => {
          writeJsonFile(searchHistoryJsonPath, updatedParsedData)
        })
        .then(() => resolve(localizations.equipment.searchHistory.addedToDB))
    } catch (e) {
      reject(e)
    }
  })
}

export async function removeSearchTermFromDB(login, term) {
  console.log('Событие: Удаление поискового запроса', 'login: ', login, 'term: ', term)
  return new Promise((resolve, reject) => {
    try {
      readJsonFile(searchHistoryJsonPath)
        .then(parsedData => {
          if (!parsedData[login] || !parsedData[login].find(el => el === term)) {
            reject(localizations.equipment.searchHistory.errors.notExist)
            return
          }
          parsedData[login] = parsedData[login].filter(el => el !== term)
          if (parsedData[login].length === 0) delete parsedData[login]
          return parsedData
        })
        .then(updatedParsedData => writeJsonFile(searchHistoryJsonPath, updatedParsedData))
        .then(() => resolve(localizations.equipment.searchHistory.deletedFromDB))
    } catch (e) {
      reject(e)
    }
  })
}

export async function getEquipmentByID(equipmentId) {
  try {
    const equipment = await prisma.Equipment.findUnique({
      where: {
        id: equipmentId,
      },
    })

    if (!equipment) {
      const msg = `Оборудование с Id ${equipmentId} не найдено в БД (при клике на карточку)`
      throw { message: msg, status: 404 }
    } else {
      return equipment
    }
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера (при клике на карточку): ' + error
    sendError(errorMsg)
    console.error(errorMsg)
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export function findEquipment(object, equipmentId) {
  let equipmentData
  for (const key in object) {
    const arr = object[key]
    equipmentData = arr.find(el => el.id === equipmentId)
    if (equipmentData) {
      return equipmentData
    }
  }
}

export async function transformListByOperateEquipment(list) {
  const operateList = await getWorkingEquipmentListFromDB()
  return list.map(el => {
    const copy = { ...el }
    if (operateList[el.category]) {
      const operateEquipment = operateList[el.category].find(item => el.id === item.id)
      if (operateEquipment) {
        copy.isOperate = true
        copy.userID = operateEquipment.userID
      }
    }
    return copy
  })
}

export async function transformListByFavoriteEquipment(list, login) {
  const favoriteList = await getFavoriteEquipmentsFromDB(login)

  function callback(el) {
    const isFavorite = favoriteList.find(item => el.id === item.id)
    if (isFavorite) return { ...el, isFavorite: true }
    return el
  }

  if (Array.isArray(list)) {
    return list.map(callback)
  } else if (typeof list === 'object' && list !== null) {
    let arr = []
    for (let key in list) {
      arr = [...arr, ...list[key].map(callback)]
    }
    return arr
  } else throw { status: 500, error: 'Неправильный тип данных' }
}
