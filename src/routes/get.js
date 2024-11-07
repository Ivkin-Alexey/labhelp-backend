import { getEquipmentListByCategory, getEquipmentListBySearch } from '../controllers/equipments.js'
import { getEquipmentByID } from '../controllers/db/equipment.js'
import { getUserData } from '../controllers/users.js'
import { researchesSelectOptions } from '../assets/constants/researches.js'
import { getReagentApplications } from '../controllers/reagents.js'
import {
  getWorkingEquipmentListFromDB,
  getFavoriteEquipmentsFromDB,
  getSearchHistoryFromDB,
} from '../controllers/db/equipment.js'
import { authenticateToken } from '../controllers/jwt.js'
import {
  transformListByFavoriteEquipment,
  transformListByOperateEquipment,
} from '../controllers/db/equipment.js'
import localizations from '../assets/constants/localizations.js'
import { prisma } from '../../index.js'

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

  app.get('/equipmentList', async (req, res) => {
    try {
      const { category, equipmentID, search } = req.query
      if (equipmentID) {
        console.log('Событие: GET-запрос по адресу: /equipmentList, equipmentID: ', equipmentID)
        const equipmentData = await getEquipmentByID(equipmentID)
        // const list = await transformListByOperateEquipment([equipmentData]).then(async list => {
        //   return await transformListByFavoriteEquipment(list, login)
        // })
        console.info('Данные успешно отправлены')
        return res.status(200).json(equipmentData)
      }
      if (search) {
        console.log('Событие: query-параметр search: ', search)
        return await getEquipmentListBySearch(search).then(async equipmentList => {
          // if (!login) return res.status(200).json(equipmentList)
          // else {
          //   const list = await transformListByOperateEquipment(equipmentList).then(async list => {
          //     return await transformListByFavoriteEquipment(list, login)
          //   })
          //   return res.status(200).json(list)
          // }
          return res.status(200).json(equipmentList)
        })
      }
      if (category) {
        return await getEquipmentListByCategory(category).then(async equipmentList => {
          // const list = await transformListByOperateEquipment(equipmentList).then(async list => {
          //   return await transformListByFavoriteEquipment(list, login)
          // })
          return res.status(200).json(equipmentList)
        })
      }
    } catch (e) {
      return res.status(e.status).json(e.message)
    }
  })

  app.get('/workingEquipmentList', async (req, res) => {
    const { login } = req.query
    try {
      const isUserExist = await getUserData(login)
      if (!isUserExist)
        throw { error: localizations.users.errors.unregisteredUserError, status: 404 }
      const workingEquipments = await getWorkingEquipmentListFromDB()
      if (Object.keys(workingEquipments).length === 0) return res.status(200).json([])
      const transformedList = await transformListByFavoriteEquipment(workingEquipments, login).then(
        list => {
          return list.map(el => ({ ...el, isOperate: true }))
        },
      )
      return res.status(200).json(transformedList)
    } catch (e) {
      console.log(e)
      if (e.error) res.status(e.status).json(e.error)
      else return res.status(500).json(e)
    }
  })

  app.get('/favoriteEquipments', async (req, res) => {
    const { login } = req.query
    console.log(req.query)
    try {
      return await getFavoriteEquipmentsFromDB(login)
        .then(async list => {
          const transformedList = await transformListByOperateEquipment(list)
          return transformedList.map(el => ({ ...el, isFavorite: true }))
        })
        .then(list => res.status(200).json(list))
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
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
      return res.status(e.status).json(e.message)
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
