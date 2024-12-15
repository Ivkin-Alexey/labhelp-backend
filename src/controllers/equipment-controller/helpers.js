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
