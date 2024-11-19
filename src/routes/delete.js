import { processFavoriteEquipmentResponse } from '../controllers/equipment-controller/favorite-equipment.js'
import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment.js'
import { processSearchHistoryRequest } from '../controllers/equipment-controller/search-history.js'
import { processUserRequest } from '../controllers/user-controller.js'

export default function deleteMethod(app) {
  app.delete('/equipments/operate/:equipmentId', changeOperateEquipmentStatus)

  app.delete('/equipments/favorite/:equipmentId', processFavoriteEquipmentResponse)

  app.delete('/users/:login', processUserRequest)

  app.delete('/equipments/search-history/:login', processSearchHistoryRequest)
}
