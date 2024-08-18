import { getEquipmentListByCategory, getEquipmentListBySearch } from '../methods/equipments.js'
import { getEquipmentByID } from '../methods/db/equipment.js'
import { getUserData, getUserList } from '../methods/users.js'
import { researchesSelectOptions } from '../assets/constants/researches.js'
import { getReagentApplications } from '../methods/reagents.js'
import {
  getWorkingEquipmentListFromDB,
  getFavoriteEquipmentsFromDB,
  getSearchHistoryFromDB,
} from '../methods/db/equipment.js'
import { generateAccessToken, authenticateToken } from '../methods/jwt.js'
import {
  transformListByFavoriteEquipment,
  transformListByOperateEquipment,
} from '../methods/db/equipment.js'

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
      const { category, equipmentID, search, login } = req.query
      if (equipmentID) {
        return await getEquipmentByID(equipmentID)
          .then(async equipmentData => {
            const list = await transformListByOperateEquipment([equipmentData]).then(async list => {
              return await transformListByFavoriteEquipment(list, login)
            })
            return res.status(200).json(list[0])
          })
          .catch(error => res.status(404).json(error))
      }
      if (search) {
        return await getEquipmentListBySearch(search)
          .then(async equipmentList => {
            if (!login) res.status(200).json(equipmentList)
            else {
              const list = await transformListByOperateEquipment(equipmentList).then(async list => {
                return await transformListByFavoriteEquipment(list, login)
              })
              return res.status(200).json(list)
            }
          })
          .catch(error => res.status(404).json(error))
      }
      if (category) {
        return await getEquipmentListByCategory(category).then(async equipmentList => {
          const list = await transformListByOperateEquipment(equipmentList).then(async list => {
            return await transformListByFavoriteEquipment(list, login)
          })
          return res.status(200).json(list)
        })
      }
      
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })

  app.get('/workingEquipmentList', async (req, res) => {
    const { login } = req.query
    try {
      return await getWorkingEquipmentListFromDB()
        .then(async list => {
          const transformedList = await transformListByFavoriteEquipment(list, login)
          return transformedList.map(el => ({ ...el, isOperate: true }))
        })
        .then(list => res.status(200).json(list))
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
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

  app.get('/person/:chatID', authenticateToken, async (req, res) => {
    try {
      const chatID = req.params.chatID
      return await getUserData(chatID).then(person => res.status(200).json(person))
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })

  app.get('/persons/:chatID', authenticateToken, async (req, res) => {
    try {
      return await getUserList().then(personList => res.status(200).json(personList))
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
