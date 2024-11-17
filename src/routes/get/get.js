import { prisma } from '../../../index.js'
import { processEndpointError } from '../../utils/errorProcessing.js'
import { getUserData } from '../../data-access/users.js'

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

  app.get('/jwtHello', (req, res) => {
    return res.status(200).json('Привет')
  })

  app.get('/users/:login', async (req, res) => {
    try {
      const { login } = req.params
      const userData = await getUserData(login)
      res.status(200).json(userData)
    } catch (e) {
      processEndpointError(res, e)
    }
  })

  app.get('/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          login: true,
        },
      })
      return res.status(200).json(users)
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  })

}
