import { addFavoriteEquipmentToDB, removeFavoriteEquipmentFromDB } from '../../data-access/data-access-equipments/favorite-equipments.js'
import { processEndpointError } from '../../utils/errorProcessing.js'

export async function processFavoriteEquipmentResponse(req, res) {
  try {
    const method = req.method
    const { equipmentId } = req.params
    const { login } = req.query
    let response
    if (method === 'POST') {
      response = await addFavoriteEquipmentToDB(login, equipmentId)
    } else if (method === 'DELETE') {
      response = await removeFavoriteEquipmentFromDB(login, equipmentId)
    } else {
      res.status(405).json({ message: 'Метод не разрешен', status: 405 })
    }
    return res.status(200).json({ message: response, status: 200 })
  } catch (e) {
    processEndpointError(res, e)
  }
}
