import {
  addFavoriteEquipmentToDB,
  removeFavoriteEquipmentFromDB,
} from '../../data-access/data-access-equipments/favorite-equipments.js'

export async function processFavoriteEquipmentResponse(req, res) {
  const { add, remove } = req.query
  const { login, equipmentId } = req.body
  try {
    if (add) {
      return await addFavoriteEquipmentToDB(login, equipmentId).then(msg =>
        res.status(200).json({ message: msg, status: 200 }),
      )
    }
    if (remove) {
      return await removeFavoriteEquipmentFromDB(login, equipmentId).then(msg =>
        res.status(200).json({ message: msg, status: 200 }),
      )
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
}
