import { bot } from '../index.js'

import { deleteOperateEquipment } from '../methods/appDeleteProcessing.js'

export default function httpDelete(app) {
  app.delete('/operateEquipment', async (req, res) => await deleteOperateEquipment(req, res, bot))
}
