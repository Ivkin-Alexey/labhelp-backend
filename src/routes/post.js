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
import { addSearchTermToDB, removeSearchTermFromDB } from '../controllers/db/equipment.js'
import {
  addFavoriteEquipmentToDB,
  removeFavoriteEquipmentFromDB,
} from '../data-access/data-access-equipments/favorite-equipments.js'
import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment.js'

export default function post(app) {
  app.post('/updatePersonData', async (req, res) => await updateUserDataPost(req, res, bot))

  app.post(
    '/deletePerson',
    authenticateToken,
    async (req, res) => await deletePersonPost(req, res, bot),
  )
  app.post('/equipment/operate/:id', async (req, res) => await changeOperateEquipmentStatus(req, res))

  app.post(
    '/deleteReagentApplication',
    authenticateToken,
    async (req, res) => await deleteReagentApplicationPost(req, res, bot),
  )

  app.post(
    '/updateReagentApplications',
    authenticateToken,
    async (req, res) => await updateReagentApplicationPost(req, res, bot),
  )

  app.post(
    '/addNewReagentAppToDB',
    authenticateToken,
    async (req, res) => await addNewReagentAppToDBPost(req, res, bot),
  )

  app.post('/createNewPerson', async (req, res) => await createNewPersonPost(req, res, bot))

  app.post('/login', async (req, res) => await loginPersonPost(req, res, bot))

  app.post('/favoriteEquipment', authenticateToken, async (req, res) => {
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

  app.post('/equipmentSearchHistory', async (req, res) => {
    const { add, remove } = req.query
    const { login, term } = req.body
    try {
      if (add) {
        return await addSearchTermToDB(login, term).then(msg => res.status(200).json(msg))
      }
      if (remove) {
        return await removeSearchTermFromDB(login, term).then(msg => res.status(200).json(msg))
      }
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })
}
