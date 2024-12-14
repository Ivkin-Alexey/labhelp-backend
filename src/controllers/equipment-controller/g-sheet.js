import { amountOfEquipment, equipmentFilterList, equipmentItem } from "../../assets/constants/equipments.js"
import { equipmentList, equipmentListSheetID } from "../../assets/constants/gSpreadSheets.js"
import { checkIsCorrect } from "./helpers.js"

export async function fetchEquipmentListFromGSheet() {
    try {
      const equipment = []
      const equipmentFilters = 
      await equipmentList.loadInfo()
      let sheet = equipmentList.sheetsById[equipmentListSheetID]
      const rows = await sheet.getRows()
      for (let i = 0; i < amountOfEquipment; i++) {
        const isAvailable = rows[i].get('Включить в каталог оборудования')
        if(isAvailable === "FALSE") continue
        const newEquipmentItem = {}
        for (let key in equipmentItem) {
          newEquipmentItem[key] = rows[i].get(equipmentItem[key]) || ""
        }
        newEquipmentItem.id = newEquipmentItem.inventoryNumber + newEquipmentItem.serialNumber
        // if (!checkIsCorrect(newEquipmentItem)) {
        //   continue
        // }
        equipment.push(newEquipmentItem)
      }
      return equipment
    } catch (e) {
      console.log(e)
    }
  }