import { equipmentFilterList } from '../../assets/constants/equipments.js'
import { processSearchHistoryRequest } from '../../controllers/equipment-controller/search-history.js'
import {
  getEquipmentByID,
  getEquipmentListBySearch,
} from '../../data-access/data-access-equipments/equipments.js'
import { getFavoriteEquipmentsFromDB } from '../../data-access/data-access-equipments/favorite-equipments.js'
import { getWorkingEquipmentListFromDB } from '../../data-access/data-access-equipments/operate-equipments.js'
import { processEndpointError } from '../../utils/errorProcessing.js'
import { getFiltersFromQuery } from '../../utils/query.js'

export default function getEquipment(app) {
  app.get('/equipments/search', async (req, res) => {
    try {
      let equipmentList
      const { term, login } = req.query
      const { isAuthenticated } = req
      const filters = getFiltersFromQuery(req.query)
      if (term || filters) {
        equipmentList = await getEquipmentListBySearch(term, login, isAuthenticated, filters)
        return res.status(200).json(equipmentList)
      } else {
        const msg = 'Отсутствует поисковая фраза или фильтры'
        throw { message: msg, status: 403 }
      }
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/equipments/filters', async (req, res) => {
    try {
      return res.status(200).json(equipmentFilterList)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/equipments/:equipmentId', async (req, res) => {
    try {
      const { equipmentId } = req.params
      const { login } = req.query
      const { isAuthenticated } = req
      const equipmentData = await getEquipmentByID(equipmentId, login, isAuthenticated)
      return res.status(200).json(equipmentData)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/equipments/operate/:login', async (req, res) => {
    try {
      const { login } = req.params
      const list = await getWorkingEquipmentListFromDB(login)
      return res.status(200).json(list)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/equipments/favorite/:login', async (req, res) => {
    try {
      const { login } = req.params
      const list = await getFavoriteEquipmentsFromDB(login)
      return res.status(200).json(list)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/equipments/search-history/:login', processSearchHistoryRequest)
}
