import { endWorkWithEquipment } from './operateEquipments.js'

export async function deleteOperateEquipment(req, res) {
  const { body } = req
  const { chatID, login, equipmentId } = body
  try {
    await endWorkWithEquipment(+chatID || login, equipmentId).then(data => {
      res.status(200).json(data)
    })
  } catch (e) {
    console.log(e)
    if (e.error) return res.status(e.status).json(e.error)
    else return res.status(500).json(e)
  }
}
