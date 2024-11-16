import {
  updateUserDataPost,
  deletePersonPost,
  updateReagentApplicationPost,
  deleteReagentApplicationPost,
  addNewReagentAppToDBPost,
  createNewPersonPost,
  loginPersonPost,
} from '../controllers/appPostsProcessing.js'

import { bot } from '../../index.js'

import { authenticateToken } from '../controllers/jwt.js'
import { addSearchTermToDB } from '../controllers/db/equipment.js'
import {
  addFavoriteEquipmentToDB,
  removeFavoriteEquipmentFromDB,
} from '../data-access/data-access-equipments/favorite-equipments.js'
import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment.js'

export default function post(app) {

  app.post(
    '/equipments/operate/:equipmentId',
    async (req, res) => await changeOperateEquipmentStatus(req, res),
  )

  app.post(
    '/reagents',
    authenticateToken,
    async (req, res) => await addNewReagentAppToDBPost(req, res, bot),
  )

  app.post('/auth/users', async (req, res) => await createNewPersonPost(req, res))

  app.post('/auth/login', async (req, res) => await loginPersonPost(req, res))

  app.post('/equipments/favorite/:equipmentId', authenticateToken, async (req, res) => {
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
  })

  app.post('/equipments/search-history/:login', async (req, res) => {
    const { login } = req.params
    const { term } = req.body
    try {
      return await addSearchTermToDB(login, term).then(msg => res.status(200).json(msg))
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })
}
