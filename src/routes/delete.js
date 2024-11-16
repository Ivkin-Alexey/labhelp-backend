import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment'

export default function deleteMethod(app) {
  app.delete(
    '/equipment/operate/:id',
    async (req, res) => await changeOperateEquipmentStatus(req, res),
  )
}
