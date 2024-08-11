import {endWorkWithEquipment} from './operateEquipments.js'

export async function deleteOperateEquipment(req, res) {
  const { body } = req
  const { chatID, login, equipmentID } = body
  try {
    return await endWorkWithEquipment(+chatID || login, equipmentID).then(data =>
      res.status(200).json(data),
    )
  } catch (e) {
    console.log(e)
    return res.status(500).json(e)
  }
}
