import { getUserData } from '../controllers/users.js'
import { researchesSelectOptions } from '../assets/constants/researches.js'
import { getReagentApplications } from '../controllers/reagents.js'
import {
  getSearchHistoryFromDB,
} from '../controllers/db/equipment.js'
import { authenticateToken } from '../controllers/jwt.js'
import { prisma } from '../../index.js'
import { processEndpointError } from '../utils/errorProcessing.js'
import { getFavoriteEquipmentsFromDB } from '../data-access/data-access-equipments/favorite-equipments.js'
import {
  getEquipmentByID,
  getEquipmentListByCategory,
  getEquipmentListBySearch,
} from '../data-access/data-access-equipments/equipments.js'
import { getWorkingEquipmentListFromDB } from '../data-access/data-access-equipments/operate-equipments.js'

export default function get(app) {
  // app.use((req, res, next) => {
  //   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  //   next();
  // });

  app.get('/hello', async (req, res) => {
    return res.status(200).json('Привет')
  })

  app.get('/jwtHello', authenticateToken, (req, res) => {
    return res.status(200).json('Привет')
  })

  app.get('/equipmentList', authenticateToken, async (req, res) => {
    let equipmentList
    try {
      const { category, equipmentId, search, login } = req.query
      const { isAuthenticated, originalUrl } = req
      console.info(`Событие: GET-запрос по адресу: ${originalUrl}`)
      if (equipmentId) {
        equipmentList = await getEquipmentByID(equipmentId, login, isAuthenticated)
      } else if (search) {
        equipmentList = await getEquipmentListBySearch(search, login, isAuthenticated)
      } else if (category) {
        equipmentList = await getEquipmentListByCategory(category, login, isAuthenticated)
      } else {
        throw { message: 'Некорректный запрос: ' + originalUrl, status: 400 }
      }
      console.info('Данные успешно отправлены')
      return res.status(200).json(equipmentList)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/equipment/operate', authenticateToken, async (req, res) => {
    try {
      const { login } = req.query
      const { originalUrl } = req
      console.info(`Событие: GET-запрос по адресу: ${originalUrl}`)
      const list = await getWorkingEquipmentListFromDB(login)
      console.info(`Данные отправлены. Логин ${login}.`)
      return res.status(200).json(list)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/favoriteEquipments', authenticateToken, async (req, res) => {
    try {
      const { login, originalUrl} = req.query
      console.info(`Событие: GET-запрос по адресу: ${originalUrl}`)
      const list = await getFavoriteEquipmentsFromDB(login)
      console.info(`Данные отправлены. Логин ${login}.`)
      return res.status(200).json(list)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/equipmentSearchHistory', async (req, res) => {
    const { login } = req.query
    console.log(req.query)
    try {
      return await getSearchHistoryFromDB(login).then(list => res.status(200).json(list))
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })

  app.get('/person/:login', authenticateToken, async (req, res) => {
    try {
      const { login } = req.params
      const userData = await getUserData(login)
      res.status(200).json(userData)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/persons', async (req, res) => {
    try {
      const users = await prisma.users.findMany()
      return res.status(200).json(users)
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })

  app.get('/researches', authenticateToken, async (req, res) => {
    try {
      return res.status(200).json(researchesSelectOptions)
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })

  app.get('/reagentApplications', async (req, res) => {
    try {
      return await getReagentApplications().then(list => res.status(200).json(list))
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })
}
