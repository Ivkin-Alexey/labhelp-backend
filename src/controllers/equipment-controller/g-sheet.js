import { amountOfEquipment, equipmentItem } from '../../assets/constants/equipments.js'
import { equipmentList, equipmentListSheetID } from '../../assets/constants/gSpreadSheets.js'
import { isCellDataValid } from './helpers.js'
import { notifyProgrammer } from '../../services/telegram-notifier.js'

export async function fetchEquipmentListFromGSheet() {
  try {
    await equipmentList.loadInfo()
    let sheet = equipmentList.sheetsById[equipmentListSheetID]
    const rows = await sheet.getRows()
    return createEquipmentList(rows)
  } catch (e) {
    console.log(e)
  }
}

function createEquipmentList(rows) {
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
    console.log(`⚠️  Найдено единиц оборудования с невалидными заводскими и/или инвентарными номерами: ${invalidIdsCount}`)
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
  return newEquipmentItem
}

const idsMap = {};

export function createEquipmentId(inventoryNumber, serialNumber, incrementInvalidCount = () => {}) {
  if (typeof inventoryNumber !== "string" || typeof serialNumber !== "string") {
    incrementInvalidCount()
    throw new TypeError("Инвентарный и серийный номер должны быть строками")
  }

  let invTrimmed = inventoryNumber.trim()
  const serTrimmed = serialNumber.trim()

  if (!isCellDataValid(invTrimmed)) {
    incrementInvalidCount()
    return
  }

  if (!idsMap[invTrimmed]) {
    idsMap[invTrimmed] = 1;
  } else {
    const prev = invTrimmed;
    invTrimmed = `${prev}_${idsMap[prev]}`
    idsMap[prev] = idsMap[prev] + 1;
  }


  if(!isCellDataValid(serTrimmed)) {
    return invTrimmed
  }

  return invTrimmed + "_" + serTrimmed
}


