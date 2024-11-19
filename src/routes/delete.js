import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment.js'
import { processSearchHistoryRequest } from '../controllers/equipment-controller/search-history.js'
import { processUserRequest } from '../controllers/user-controller.js'

export default function deleteMethod(app) {
  app.delete('/equipments/operate/:equipmentId', changeOperateEquipmentStatus)

  app.delete('/users/:login', processUserRequest)

  app.delete('/equipments/search-history/:login', processSearchHistoryRequest)
}
