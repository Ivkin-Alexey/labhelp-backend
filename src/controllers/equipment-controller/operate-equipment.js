import {
  endWorkWithEquipment,
  startWorkWithEquipment,
} from '../../data-access/data-access-equipments/operate-equipments.js'
import { processEndpointError } from '../../utils/errorProcessing.js'

export async function changeOperateEquipmentStatus(req, res) {
  const { equipmentId } = req.params
  const method = req.method

  const { login, isLongUse } = req.body
  try {
    let response
    if (method === 'POST') {
      response = await startWorkWithEquipment(login, equipmentId, isLongUse)
    } else if (method === 'DELETE') {
      response = await endWorkWithEquipment(login, equipmentId)
    } else {
      res.status(405).json({ message: 'Метод не разрешен', status: 405 })
    }
    return res.status(200).json(response)
  } catch (e) {
    processEndpointError(res, e)
  }
}
