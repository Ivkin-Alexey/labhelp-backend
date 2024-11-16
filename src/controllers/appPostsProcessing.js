import {
  updateUserData,
  deleteUser,
  processUserConfirmation,
  getUserData,
  createNewPerson,
  authenticateUser,
} from './users.js'
import localizations from '../assets/constants/localizations.js'
import { generateAccessToken } from './jwt.js'
import {
  deleteReagentApplication,
  addNewReagentAppToDB,
  sendReagentAppDataToManager,
} from './reagents.js'
import { personRoles } from '../assets/constants/users.js'
import { processEndpointError } from '../utils/errorProcessing.js'
import { endWorkWithEquipment, startWorkWithEquipment } from '../data-access/data-access-equipments/operate-equipments.js'
const { denyApplication } = localizations.superAdministratorActions

async function updateUserDataPost(req, res, bot) {
  const { body } = req
  const { chatID, formData } = body
  try {
    return await updateUserData(+chatID, formData)
      .then(userList => {
        const userData = userList.find(el => el.chatID === +chatID)
        if (formData?.isUserConfirmed) processUserConfirmation(bot, userData)
        return userList
      })
      .then(data => res.status(200).json(data))
  } catch (e) {
    return res.status(500).json(e)
  }
}

async function deletePersonPost(req, res, bot) {
  const { chatID } = req.body
  try {
    return await deleteUser(+chatID)
      .then(personList => {
        bot.sendMessage(chatID, denyApplication)
        return personList
      })
      .then(data => res.status(200).json(data))
  } catch (e) {
    return res.status(500).json(e)
  }
}

async function createNewPersonPost(req, res) {
  try {
    const { userData } = req.body
    if (!userData)
      throw {
        message: 'Отсутствуют данные пользователя при создании нового пользователя',
        status: 400,
      }
    const { login } = userData
    await createNewPerson(userData)
    const token = generateAccessToken(login)
    return res.status(200).json({ message: 'Пользователь успешно создан', token })
  } catch (e) {
    processEndpointError(res, e)
  }
}

async function loginPersonPost(req, res) {
  try {
    const { login, password } = req.body
    if (!login || !password) {
      return res.status(400).json('Логин или пароль отсутствуют')
    }
    const token = await authenticateUser(login, password)
    return res.status(200).json({ message: 'Успешная аутентификация', token })
  } catch (e) {
    processEndpointError(res, e)
  }
}

async function addNewReagentAppToDBPost(req, res, bot) {
  const { body } = req
  const { userData, applicationData } = body
  return new Promise(() => {
    addNewReagentAppToDB(userData, applicationData, bot)
      .then(app => {
        sendReagentAppDataToManager(app, bot)
        return res.status(200).json(app)
      })
      .catch(error => res.status(500).json(error))
  })
}

async function updateReagentApplicationPost(req, res, bot) {
  const { body } = req
  const { userData, applicationData } = body
  return new Promise(() => {
    // eslint-disable-next-line no-undef
    updateReagentApplications(userData, applicationData, bot)
      .then(applicationList => res.status(200).json(applicationList))
      .catch(error => res.status(500).json(error))
  })
}

async function deleteReagentApplicationPost(req, res) {
  const { body } = req
  const { applicationID, chatID } = body
  return new Promise(() => {
    getUserData(chatID)
      .then(userData => {
        if (userData.role === personRoles.superAdmin) deleteReagentApplication(applicationID)
      })
      .then(applicationList => res.status(200).json(applicationList))
      .catch(error => res.status(500).json(error))
  })
}

export {
  updateUserDataPost,
  deletePersonPost,
  updateReagentApplicationPost,
  deleteReagentApplicationPost,
  addNewReagentAppToDBPost,
  createNewPersonPost,
  loginPersonPost,
}
