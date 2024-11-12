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
