import { createEquipment } from '../controllers/equipment-controller/equipment.js'
import { processFavoriteEquipmentResponse } from '../controllers/equipment-controller/favorite-equipment.js'
import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment.js'
import { processSearchHistoryRequest } from '../controllers/equipment-controller/search-history.js'
import { loginPersonPost, processUserRequest } from '../controllers/user-controller.js'
import { processEndpointError } from '../utils/errorProcessing.js'
import { requireAdmin } from '../middlewaries/requireAdmin.js'
import { syncEquipmentDbFromGSheet } from '../data-access/data-access-equipments/equipments.js'
import { getSyncStatus, getPublicSyncStatus, SyncStatus } from '../services/sync-manager.js'

export default function post(app) {
  app.post('/auth/sign-up/:login', processUserRequest)

  app.post('/auth/sign-in/:login', loginPersonPost)

  app.post('/equipments/operate/:equipmentId', changeOperateEquipmentStatus)

  app.post('/equipments/favorite/:equipmentId', processFavoriteEquipmentResponse)

  app.post('/equipments/search-history/:login', processSearchHistoryRequest)

  app.post('/equipments', createEquipment)

  app.post('/equipments/sync-db/', requireAdmin, async (req, res) => {
    try {
      if (getSyncStatus().status === SyncStatus.RUNNING) {
        return res.status(409).json({
          message: 'Синхронизация уже запущена',
          status: getPublicSyncStatus(),
        })
      }

      // Синхронизация занимает минуты, поэтому не ждём её завершения, а сразу
      // отвечаем 202: о результате клиент узнает из GET /equipments/sync-status
      syncEquipmentDbFromGSheet().catch((error) => {
        console.error('Ошибка синхронизации базы данных:', error.message)
      })

      return res.status(202).json('Синхронизация базы данных запущена')
    } catch (e) {
      processEndpointError(res, e)
    }
  })
}
