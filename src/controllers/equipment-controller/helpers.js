import { invalidCellData } from "../../assets/constants/equipments.js"

export function checkIsCorrect(equipment) {
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

export function checkIsEmpty(obj) {
  return Object.values(obj).length === 0
}

function isIdDataValid(value) {
  if (typeof value !== "string") return false

  if(invalidCellData.includes(value)) return false

  return true
}

export function createEquipmentId(inventoryNumber, serialNumber) {
  if (typeof inventoryNumber !== "string" || typeof serialNumber !== "string") {
    throw new TypeError("Инвентарный и серийный номер должны быть строками")
  }

  const invTrimmed = inventoryNumber.trim()
  const serTrimmed = serialNumber.trim()

  if (!isIdDataValid(invTrimmed)) {
    throw new Error("Не валидный инвентарный номер")
  }

  if(!isIdDataValid(serTrimmed)) {
    return invTrimmed
  }

  return invTrimmed + "_" + serTrimmed
}

