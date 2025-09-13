// import { equipmentFilterList } from '../../assets/constants/equipments.js' // Больше не нужен, используем динамические фильтры
import { processSearchHistoryRequest } from '../../controllers/equipment-controller/search-history.js'
import {
  getEquipmentByID,
  getEquipmentByIDs,
  getEquipmentListBySearch,
  getEquipmentFilters,
} from '../../data-access/data-access-equipments/equipments.js'
import { getFavoriteEquipmentsFromDB } from '../../data-access/data-access-equipments/favorite-equipments.js'
import { getWorkingEquipmentListFromDB } from '../../data-access/data-access-equipments/operate-equipments.js'
import { processEndpointError } from '../../utils/errorProcessing.js'
import { getFiltersFromQuery } from '../../utils/query.js'

export default function getEquipment(app) {
  app.get('/equipments/search', async (req, res) => {
    try {
      let equipmentList
      const { term, login, page, pageSize } = req.query
      const { isAuthenticated } = req
      const filters = getFiltersFromQuery(req.query)
      if (term || filters) {
        equipmentList = await getEquipmentListBySearch(term, login, isAuthenticated, filters, +page, +pageSize)
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
      const filters = await getEquipmentFilters()
      return res.status(200).json(filters)
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

  app.get('/equipments', async (req, res) => {
    try {
      const { login, equipmentIds } = req.query
      const { isAuthenticated } = req
      const arr = equipmentIds.split(",")
      const equipmentData = await getEquipmentByIDs(arr, login, isAuthenticated)
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
