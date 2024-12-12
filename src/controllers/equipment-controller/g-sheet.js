import { amountOfEquipment, EquipmentItem } from "../../assets/constants/equipments.js"
import { equipmentList, equipmentListSheetID } from "../../assets/constants/gSpreadSheets.js"
import { checkIsCorrect } from "./helpers.js"

export async function fetchEquipmentListFromGSheet() {
    try {
      const equipment = []
      await equipmentList.loadInfo()
      let sheet = equipmentList.sheetsById[equipmentListSheetID]
      const rows = await sheet.getRows()
      for (let i = 0; i < amountOfEquipment; i++) {
        const isAvailable = rows[i].get('Включить в каталог оборудования')
        if(isAvailable === "FALSE") continue
        const newEquipmentItem = new EquipmentItem()
        newEquipmentItem.name = rows[i].get('Наименование оборудования') || ''
        newEquipmentItem.description = rows[i].get('Область применения оборудования') || ''
        newEquipmentItem.brand = rows[i].get('Изготовитель') || ''
        newEquipmentItem.model = rows[i].get('Модель') || ''
        newEquipmentItem.category = rows[i].get('Категория') || ''
        newEquipmentItem.filesUrl =
          rows[i].get(
            'Эксплуатационно-техническая документация\n' +
              '(ссылка на облако)\n' +
              '\n' +
              'Паспорт/руководство по эксплуатации',
          ) || ''
        newEquipmentItem.imgUrl = rows[i].get('Ссылки на фотографии') || ''
        newEquipmentItem.serialNumber = rows[i].get('Заводской №')
        newEquipmentItem.inventoryNumber = rows[i].get('Инвентарный №')
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