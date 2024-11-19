import {
  createNewPerson,
  authenticateUser,
  deleteUser,
  getUserData,
  updateUserData,
} from '../data-access/users.js'
import { processEndpointError } from '../utils/errorProcessing.js'

export async function processUserRequest(req, res) {
  try {
    let response
    const method = req.method
    const { login } = req.params
    const { body } = req
    if (!login) {
      const msg = 'Логин отсутствует'
      throw { message: msg, status: 400 }
    }
    if (method === 'GET') {
      response = await getUserData(login)
    } else if (method === 'POST') {
      response = await createNewPerson(login, body.userData)
    } else if (method === 'DELETE') {
      response = await deleteUser(login)
    } else if (method === 'PATCH') {
      response = await updateUserData(login, body)
    } else {
      res.status(405).json({ message: 'Метод не разрешен', status: 405 })
    }
    return res.status(200).json(response)
  } catch (e) {
    processEndpointError(res, e)
  }
}

export async function loginPersonPost(req, res) {
  try {
    const { password } = req.body
    const { login } = req.params
    if (!password) {
      return res.status(400).json('Логин или пароль отсутствуют')
    }
    const token = await authenticateUser(login, password)
    return res.status(200).json({ message: 'Успешная аутентификация', token })
  } catch (e) {
    processEndpointError(res, e)
  }
}
export { createNewPerson }
