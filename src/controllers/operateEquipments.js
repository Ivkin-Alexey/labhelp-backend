import {
  getWorkingEquipmentListFromDB,
  getEquipmentByID,
  findEquipment,
  deleteWorkingEquipmentFromDB,
  addWorkingEquipmentToDB,
} from './db/equipment.js'
import {
  equipmentOperations,
  equipmentOperationsSheetIndex,
} from '../assets/constants/gSpreadSheets.js'
import { addNewRowInGSheet, updateDataInGSheetCell } from './gSheets.js'
import { StartData, EndData } from '../assets/constants/equipments.js'
import { getUserData } from './users.js'
import localizations from '../assets/constants/localizations.js'

export async function startWorkWithEquipment(userID, equipmentID) {
  // userID = chatID or login
  return new Promise((resolve, reject) => {
    label: try {
      const equipment = getEquipmentByID(equipmentID)
      if (!equipment) {
        reject({ error: localizations.equipment.searchError, status: 404 })
        break label
      }
      const accountData = getUserData(userID)
      if (!accountData) {
        reject({ error: localizations.users.errors.unregisteredUserError, status: 404 })
        break label
      }
      const isOperating = getWorkingEquipmentListFromDB().then(obj =>
        findEquipment(obj, equipmentID),
      )
      if (isOperating) {
        reject({ error: localizations.equipment.operating.errors.occupied, status: 409 })
        break label
      }
      addWorkingEquipmentToDB({ ...equipment, userID })
      const data = new StartData(userID, userID, accountData, equipment)
      addNewRowInGSheet(equipmentOperations, equipmentOperationsSheetIndex, data)
      resolve({ message: localizations.equipment.operating.add, data: { equipmentID } })
    } catch (e) {
      reject(e)
    }
  })
}

export async function endWorkWithEquipment(userID, equipmentID) {
  return new Promise((resolve, reject) => {
    label: try {
      const equipment = getWorkingEquipmentListFromDB().then(obj => findEquipment(obj, equipmentID))
      if (equipment) {
        const { userID: UID } = equipment
        if (userID !== UID) {
          reject({ error: localizations.equipment.operating.errors.wrongUserID, status: 409 })
          break label
        }
        deleteWorkingEquipmentFromDB(equipment)
        const data = new EndData()
        updateDataInGSheetCell(
          equipmentOperations,
          equipmentOperationsSheetIndex,
          equipment,
          'endTime',
          data.endTime,
        )
        resolve({ message: localizations.equipment.operating.delete, data: { equipmentID } })
      } else {
        reject({ error: localizations.equipment.operating.empty, status: 404 })
      }
    } catch (e) {
      reject(e)
    }
  })
}
