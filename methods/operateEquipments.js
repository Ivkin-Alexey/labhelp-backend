import {
  getWorkingEquipmentListFromDB,
  getEquipmentByID,
  updateWorkingEquipmentListInDB,
  findEquipment
} from './db/equipment.js'
import {equipmentOperations, equipmentOperationsSheetIndex} from '../assets/constants/gSpreadSheets.js' 
import { addNewRowInGSheet, updateDataInGSheetCell } from './gSheets.js'
import { StartData, EndData } from '../assets/constants/equipments.js'
import { getUserData } from './users.js'
import localizations from '../assets/constants/localizations.js'

export async function startWorkWithEquipment(userID, equipmentID) { // userID = chatID or login
  return new Promise(async (resolve, reject) => {
    label: try {
      const equipment = await getEquipmentByID(equipmentID)
      if (!equipment) {
        reject({ error: localizations.equipment.searchError, status: 404 })
        break label
      }
      const accountData = await getUserData(userID)
      if (!accountData) {
        reject({ error: localizations.users.errors.unregisteredUserError, status: 404 })
        break label
      }
      const isOperating = await getWorkingEquipmentListFromDB().then(obj => findEquipment(obj, equipmentID))
      if (isOperating) {
        reject({ error: localizations.equipment.operating.errors.occupied, status: 409 })
        break label
      }
      const { category } = equipment
      await updateWorkingEquipmentListInDB(category, equipmentID, userID, 'start')
      const data = new StartData(userID, userID, accountData, equipment)
      await addNewRowInGSheet(equipmentOperations, equipmentOperationsSheetIndex, data)
      resolve({ message: localizations.equipment.operating.add, data: { equipmentID } })
    } catch (e) {
      reject(e)
    }
  })
}

export async function endWorkWithEquipment(userID, equipmentID) {
  return new Promise(async (resolve, reject) => {
    label: try {
      const equipment = await getWorkingEquipmentListFromDB().then(obj => findEquipment(obj, equipmentID))
      
      const { category, id, userID: UID, login } = equipment
      if (equipment) {
        if (userID !== UID) {
          reject({ error: localizations.equipment.operating.errors.wrongUserID, status: 409 })
          break label
        }
        await updateWorkingEquipmentListInDB(category, id, userID, 'end')
        const data = new EndData()
        await updateDataInGSheetCell(
          equipmentOperations,
          equipmentOperationsSheetIndex,
          equipment,
          'endTime',
          data.endTime,
        )
        resolve({ message: localizations.equipment.operating.delete, data: { equipmentID } })
      } else {
        reject({ error: localizations.equipment.operating.empty, status: 404})
      }
    } catch (e) {
      reject(e)
    }
  })
}
