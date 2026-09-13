import { processFavoriteEquipmentResponse } from '../controllers/equipment-controller/favorite-equipment.js'
import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment.js'
import { processSearchHistoryRequest } from '../controllers/equipment-controller/search-history.js'
import { processUserRequest } from '../controllers/user-controller.js'
import { requireAdmin } from '../middlewaries/requireAdmin.js'

export default function deleteMethod(app) {
  app.delete('/equipments/operate/:equipmentId', changeOperateEquipmentStatus)

  app.delete('/equipments/favorite/:equipmentId', processFavoriteEquipmentResponse)

  // Удаление пользователя доступно только администраторам: без проверки прав
  // любой вошедший пользователь мог удалить чужую учётку, включая администратора
  app.delete('/users/:login', requireAdmin, processUserRequest)

  app.delete('/equipments/search-history/:login', processSearchHistoryRequest)
}
