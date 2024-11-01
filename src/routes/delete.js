import { bot } from '../../index.js'

import { deleteOperateEquipment } from '../controllers/appDeleteProcessing.js'

export default function httpDelete(app) {
  app.delete('/operateEquipment', async (req, res) => await deleteOperateEquipment(req, res, bot))

  app.delete(
    '/operateEquipmentWithoutUserID',
    async (req, res) => await deleteOperateEquipmentWithoutUserID(req, res, bot),
  )
}
