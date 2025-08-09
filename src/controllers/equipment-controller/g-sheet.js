import { amountOfEquipment, equipmentItem } from '../../assets/constants/equipments.js'
import { equipmentList, equipmentListSheetID } from '../../assets/constants/gSpreadSheets.js'
import { isIdDataValid } from './helpers.js'

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
  for (let i = 0; i < amountOfEquipment; i++) {
    if (!rows[i]) continue
    const newEquipmentItem = createEquipmentItem(rows[i])
    if (newEquipmentItem) {
      equipmentArr.push(newEquipmentItem)
    }
  }
  return equipmentArr
}

function createEquipmentItem(obj) {
  const isAvailable = obj.get('Включить в каталог оборудования')
  if (isAvailable === 'FALSE') return
  const newEquipmentItem = {}
  for (let key in equipmentItem) {
    newEquipmentItem[key] = obj.get(equipmentItem[key]) || ''
  }
  newEquipmentItem.id = createEquipmentId(newEquipmentItem.inventoryNumber, newEquipmentItem.serialNumber)
  if (!newEquipmentItem.id) {
    return
  }
  return newEquipmentItem
}

const idsMap = {};

export function createEquipmentId(inventoryNumber, serialNumber) {
  if (typeof inventoryNumber !== "string" || typeof serialNumber !== "string") {
    throw new TypeError("Инвентарный и серийный номер должны быть строками")
  }

  let invTrimmed = inventoryNumber.trim()
  const serTrimmed = serialNumber.trim()

  if (!isIdDataValid(invTrimmed)) {
    console.error("Не валидный инвентарный номер ", invTrimmed)
    return
  }

  if (!idsMap[invTrimmed]) {
    idsMap[invTrimmed] = 1;
  } else {
    const prev = invTrimmed;
    invTrimmed = `${prev}_${idsMap[prev]}`
    idsMap[prev] = idsMap[prev] + 1;
  }


  if(!isIdDataValid(serTrimmed)) {
    return invTrimmed
  }

  return invTrimmed + "_" + serTrimmed
}


