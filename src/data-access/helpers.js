export function transformEquipmentList(equipment) {
  const result = {
    ...equipment,
    isFavorite: equipment.favoriteEquipment && equipment.favoriteEquipment.length > 0,
    isOperate: equipment.operatingEquipment && equipment.operatingEquipment.length > 0,
    login: equipment.operatingEquipment && Array.isArray(equipment.operatingEquipment) && equipment.operatingEquipment[0]?.login,
    // Добавляем поля количества, если они есть
    quantity: equipment.quantity || 1,
    totalQuantity: equipment.totalQuantity || equipment.quantity || 1,
  }
  delete result.operatingEquipment
  delete result.favoriteEquipment
  return result
}

export function transformFavoriteEquipmentList(equipment) {
  const result = {
    ...equipment.equipment,
    ...equipment.equipment.operatingEquipment[0],
    isOperate: equipment.equipment.operatingEquipment.length > 0
  }
  delete result.operatingEquipment
  return result
}

export function transformOperateEquipmentList(equipment) {
  const {login, isLongUse, startDateTime} = equipment
  const result = {
    isOperate: true,
    isFavorite: equipment.equipment.favoriteEquipment.length > 0,
    ...equipment.equipment,
    login,
    isLongUse,
    startDateTime
  }
  delete result.favoriteEquipment
  return result
}

export function transformEquipmentInfo(equipment) {
  let result 
  if (equipment.operatingEquipment && equipment.operatingEquipment[0]) {
    const { login, isLongUse, startDateTime } = equipment.operatingEquipment[0]
    result = {
      isOperate: true,
      isFavorite: equipment.favoriteEquipment && equipment.favoriteEquipment.length > 0,
      ...equipment,
      model: equipment.model && equipment.model.name,
      department: equipment.department && equipment.department.name,
      login,
      isLongUse,
      startDateTime
    }
  } else {
    result = {
      isOperate: false,
      isFavorite: equipment.favoriteEquipment && equipment.favoriteEquipment.length > 0,
      ...equipment,
      model: equipment.model && equipment.model.name,
      department: equipment.department && equipment.department.name,
    }
  }
  delete result.favoriteEquipment
  delete result.operatingEquipment
  return result
}
