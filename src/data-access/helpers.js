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
  const equipmentData = (equipment && equipment.equipment) ? equipment.equipment : {}
  const operatingEquipment = Array.isArray(equipmentData.operatingEquipment) ? equipmentData.operatingEquipment : []

  const result = {
    ...equipmentData,
    ...(operatingEquipment[0] || {}),
    isOperate: operatingEquipment.length > 0,
    // Безопасно извлекаем данные из связанных объектов
    model: equipmentData.model?.name || '',
    department: equipmentData.department?.name || '',
    classification: equipmentData.classification?.name || '',
    measurements: equipmentData.measurements?.name || '',
    type: equipmentData.type?.name || '',
    kind: equipmentData.kind?.name || '',
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
  // Проверяем, что equipment существует
  if (!equipment) {
    console.warn('Equipment is null or undefined in transformEquipmentInfo')
    return null
  }

  // Создаем копию без связанных объектов и полей с ID
  const { 
    model, department, classification, measurements, type, kind, 
    favoriteEquipment, operatingEquipment, 
    modelId, departmentId, classificationId, measurementId, typeId, kindId,
    ...baseEquipment 
  } = equipment
  
  let result 
  if (equipment.operatingEquipment && equipment.operatingEquipment[0]) {
    const { login, isLongUse, startDateTime } = equipment.operatingEquipment[0]
    result = {
      isOperate: true,
      isFavorite: equipment.favoriteEquipment && equipment.favoriteEquipment.length > 0,
      ...baseEquipment,
      model: equipment.model && equipment.model.name || '',
      department: equipment.department && equipment.department.name || '',
      classification: equipment.classification && equipment.classification.name || '',
      measurements: equipment.measurements && equipment.measurements.name || '',
      type: equipment.type && equipment.type.name || '',
      kind: equipment.kind && equipment.kind.name || '',
      login,
      isLongUse,
      startDateTime
    }
  } else {
    result = {
      isOperate: false,
      isFavorite: equipment.favoriteEquipment && equipment.favoriteEquipment.length > 0,
      ...baseEquipment,
      model: equipment.model && equipment.model.name || '',
      department: equipment.department && equipment.department.name || '',
      classification: equipment.classification && equipment.classification.name || '',
      measurements: equipment.measurements && equipment.measurements.name || '',
      type: equipment.type && equipment.type.name || '',
      kind: equipment.kind && equipment.kind.name || '',
    }
  }
  return result
}
