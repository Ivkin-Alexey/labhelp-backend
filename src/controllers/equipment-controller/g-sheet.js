import { amountOfEquipment, equipmentItem } from '../../assets/constants/equipments.js'
import { equipmentList, equipmentListSheetID } from '../../assets/constants/gSpreadSheets.js'

import { isCellDataValid } from './helpers.js'
import { notifyProgrammer } from '../../services/telegram-notifier.js'

export async function fetchEquipmentListFromGSheet() {
  try {
    await equipmentList.loadInfo()
    let sheet = equipmentList.sheetsById[equipmentListSheetID]
    const rows = await sheet.getRows()
    // Счётчик дублей живёт в рамках одного прохода по таблице: между
    // синхронизациями не сохраняется, иначе id дрейфовал бы при каждом синке
    resetEquipmentIdDuplicates()
    return await createEquipmentList(rows)
  } catch (e) {
    console.log(e)
  }
}

async function createEquipmentList(rows) {
  const equipmentArr = []
  let invalidIdsCount = 0

  for (let i = 0; i < amountOfEquipment; i++) {
    if (!rows[i]) continue
    const newEquipmentItem = createEquipmentItem(rows[i], () => invalidIdsCount++)
    if (newEquipmentItem) {
      equipmentArr.push(newEquipmentItem)
    }
  }

  // Выводим общее сообщение о невалидных ID
  if (invalidIdsCount > 0) {
    const message = `⚠️ Невалидные номера оборудования: ${invalidIdsCount}`
    console.log(message)
    await notifyProgrammer(message)
  }

  // Коллизии — это дубль пары «инвентарный_заводской» в таблице: второй и
  // дальнейшие получили суффикс. Данные стоит поправить в таблице
  const collisions = getEquipmentIdCollisions()
  if (collisions.length > 0) {
    const collisionList = collisions.map(inv => `• ${inv}`).join('\n')
    const message = `⚠️ Коллизии id оборудования: ${collisions.length} шт.\n${collisionList}`
    console.log(message)
    await notifyProgrammer(message)
  }

  return equipmentArr
}

function createEquipmentItem(obj, incrementInvalidCount) {
  const isAvailable = obj.get('Включить в каталог оборудования')
  if (isAvailable === 'FALSE') return
  const newEquipmentItem = {}
  for (let key in equipmentItem) {
    newEquipmentItem[key] = obj.get(equipmentItem[key]) || ''
  }
  newEquipmentItem.id = createEquipmentId(newEquipmentItem.inventoryNumber, newEquipmentItem.serialNumber, incrementInvalidCount)
  if (!newEquipmentItem.id) {
    return
  }
  // Местоположение — склейка учебного центра и аудитории («УЦ1 3225»):
  // аудитории в разных центрах совпадают, поэтому хранить их нужно вместе
  newEquipmentItem.auditorium = createAuditorium(
    obj.get('Учебный центр'),
    obj.get('Аудитория'),
  )
  return newEquipmentItem
}

// Название учебного центра в таблице пишут по-разному: «Учебный центр №1»,
// «Учебный центр 1», «УЦ1». Приводим к короткому «УЦN», прочее оставляем
// как есть (например, «Учебно-научный полигон «Саблино»»)
export function normalizeEducationCenter(center) {
  const trimmed = center.trim()
  const full = trimmed.match(/^Учебный центр\s*№?\s*(\d+)$/i)
  if (full) return `УЦ${full[1]}`
  const short = trimmed.match(/^УЦ\s*№?\s*(\d+)$/i)
  if (short) return `УЦ${short[1]}`
  return trimmed
}

// Местоположение единицы оборудования: «УЦ1 3225». Аудитории без центра
// бесполезны (номера совпадают между центрами), поэтому без центра — пусто
export function createAuditorium(educationCenter, room) {
  const center = typeof educationCenter === 'string' ? normalizeEducationCenter(educationCenter) : ''
  const roomTrimmed = typeof room === 'string' ? room.trim() : ''
  if (!isCellDataValid(center)) {
    return ''
  }
  return roomTrimmed && isCellDataValid(roomTrimmed) ? `${center} ${roomTrimmed}` : center
}

// Дубли пары (инвентарный, заводской) в данных таблицы: им добавляем суффикс
// по порядку появления. Счётчик обнуляется перед каждым проходом
let equipmentIdDuplicates = {}

export function resetEquipmentIdDuplicates() {
  equipmentIdDuplicates = {}
}

// Инвентарные номера, у которых пара (инвентарный, заводской) встретилась
// больше одного раза: для отчёта после синхронизации
export function getEquipmentIdCollisions() {
  return Object.keys(equipmentIdDuplicates).filter(id => equipmentIdDuplicates[id] > 1)
}

export function createEquipmentId(inventoryNumber, serialNumber, incrementInvalidCount = () => {}) {
  if (typeof inventoryNumber !== "string" || typeof serialNumber !== "string") {
    incrementInvalidCount()
    throw new TypeError("Инвентарный и серийный номер должны быть строками")
  }

  const invTrimmed = inventoryNumber.trim()
  const serTrimmed = serialNumber.trim()

  if (!isCellDataValid(invTrimmed)) {
    incrementInvalidCount()
    return
  }

  // Инвентарные номера в таблице уже содержат индекс _N для повторяющихся,
  // поэтому id — просто склейка инвентарного и заводского номеров
  let id = isCellDataValid(serTrimmed) ? invTrimmed + "_" + serTrimmed : invTrimmed

  // Страховка от дублей в данных: одинаковые пары различаем суффиксом
  if (equipmentIdDuplicates[id] === undefined) {
    equipmentIdDuplicates[id] = 1
  } else {
    equipmentIdDuplicates[id] += 1
    id = `${id}_${equipmentIdDuplicates[id]}`
  }

  return id
}


