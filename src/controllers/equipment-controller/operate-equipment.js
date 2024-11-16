import {
  endWorkWithEquipment,
  startWorkWithEquipment,
} from '../../data-access/data-access-equipments/operate-equipments.js'
import { processEndpointError } from '../../utils/errorProcessing.js'

export async function changeOperateEquipmentStatus(req, res) {
  const { id } = req.params
  const { method } = req.method

  const { chatID, login, isLongUse } = req.body
  try {
    let response
    if (method === 'POST') {
      response = await startWorkWithEquipment(+chatID || login, id, isLongUse)
    } else if (method === 'DELETE') {
      response = await endWorkWithEquipment(+chatID || login, id)
    } else {
      res.status(405).json({message: 'Метод не разрешен', status: 405})
    }
    return res.status(200).json(response)
  } catch (e) {
    processEndpointError(res, e)
  }
}
