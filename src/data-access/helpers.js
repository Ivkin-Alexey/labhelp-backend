export function transformEquipmentList(equipment) {
  const result = {
    ...equipment,
    isFavorite: equipment.favoriteEquipment.length > 0,
    isOperate: equipment.operatingEquipment.length > 0,
    login: equipment.operatingEquipment[0]?.login,
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
  if (equipment.operatingEquipment[0]) {
    const { login, isLongUse, startDateTime } = equipment.operatingEquipment[0]
    result = {
      isOperate: true,
      isFavorite: equipment.favoriteEquipment.length > 0,
      ...equipment,
      login,
      isLongUse,
      startDateTime
    }
  } else {
    result = {
      isOperate: false,
      isFavorite: equipment.favoriteEquipment.length > 0,
      ...equipment,
    }
  }
  delete result.favoriteEquipment
  delete result.operatingEquipment
  return result
}
