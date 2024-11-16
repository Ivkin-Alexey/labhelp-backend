import { bot } from '../../index'
import { deletePersonPost, deleteReagentApplicationPost } from '../controllers/appPostsProcessing'
import { removeSearchTermFromDB } from '../controllers/db/equipment'
import { changeOperateEquipmentStatus } from '../controllers/equipment-controller/operate-equipment'
import { authenticateToken } from '../controllers/jwt'

export default function deleteMethod(app) {
  app.delete(
    '/equipments/operate/:id',
    async (req, res) => await changeOperateEquipmentStatus(req, res),
  )

  app.delete('/users/:login', authenticateToken, async (req, res) => await deletePersonPost(req, res, bot))

  app.delete(
    '/reagent',
    authenticateToken,
    async (req, res) => await deleteReagentApplicationPost(req, res),
  )

  app.delete('/equipment/search-history/:login', async (req, res) => {
    const { login } = req.params
    const { term } = req.query
    try {
      return await removeSearchTermFromDB(login, term).then(msg => res.status(200).json(msg))
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })
}
