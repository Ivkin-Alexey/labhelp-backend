import { endWorkWithEquipment } from './operateEquipments.js'

export async function deleteOperateEquipment(req, res) {
  const { body } = req
  const { chatID, login, equipmentID } = body
  try {
    await endWorkWithEquipment(+chatID || login, equipmentID).then(data => {
      res.status(200).json(data)
    })
  } catch (e) {
    console.log(e)
    if (e.error) return res.status(e.status).json(e.error)
    else return res.status(500).json(e)
  }
}
