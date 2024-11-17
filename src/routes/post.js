import { processFavoriteEquipmentResponse } from '../controllers/equipment-controller/favorite-equipment.js'
import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment.js'
import { processSearchHistoryRequest } from '../controllers/equipment-controller/search-history.js'
import { loginPersonPost, processUserRequest } from '../controllers/user-controller.js'

export default function post(app) {
  app.post('/auth/sign-up/:login', processUserRequest)

  app.post('/auth/sign-in/:login', loginPersonPost)

  app.post('/equipments/operate/:equipmentId', changeOperateEquipmentStatus)

  app.post('/equipments/favorite/:equipmentId', processFavoriteEquipmentResponse)

  app.post('/equipments/search-history/:login', processSearchHistoryRequest)
}
