import { prisma } from '../../index.js'
import { personRoles } from '../assets/constants/users.js'
import { generateAccessToken } from '../controllers/jwt.js'
import bcrypt from 'bcrypt'

export async function getUserData(login) {
  try {
    const user = await getUserByLogin(login)
    if (!user) {
      throw { message: `Пользователь с логином '${login}' не существует.`, status: 404 }
    }
    // @ts-ignore
    const userData = await prisma.User.findUnique({
      where: {
        login: login,
      },
    })

    delete userData.password
    return userData
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера: ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function deleteUser(login) {
  try {
    const user = await getUserByLogin(login)
    if (!user) {
      throw { message: `Пользователь с логином '${login}' не существует.`, status: 404 }
    }
    // @ts-ignore
    await prisma.User.delete({
      where: {
        login: login,
      },
    })
    return { message: `Пользователь ${login} успешно удален` }
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера: ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function createNewPerson(login, userData) {
  try {
    const user = await getUserByLogin(login)
    if (user) {
      throw { message: `Пользователь с логином '${login}' уже существует.`, status: 400 }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    delete userData.password
    if (!userData.role) {
      userData.role = personRoles.user
    }

    // @ts-ignore
    await prisma.User.create({
      data: {
        login,
        ...userData,
        password: hashedPassword,
      },
    })
    const token = generateAccessToken(login)
    return { message: `Пользователь ${login} успешно создан`, token }
  } catch (error) {
    const errorMsg = `Ошибка при создании нового пользователя. Подробности: ${error.message || error}`
    throw { message: errorMsg, status: error.status || 500 }
  } finally {
    await prisma.$disconnect()
  }
}

export async function updateUserData(login, userData) {
  try {
    const user = await getUserByLogin(login)
    if (!user) {
      throw { message: `Пользователя с логином '${login}' не существует.`, status: 400 }
    }
    // @ts-ignore
    await prisma.User.update({
      where: {
        login: login,
      },
      data: userData,
    })
    return { message: `Данные пользователя ${login} успешно обновлены`}
  } catch (error) {
    const errorMsg = `Ошибка при обновлении пользователя. Логин ${login}. Подробности: ${error.message}`
    throw { message: errorMsg, status: 500 }
  } finally {
    await prisma.$disconnect()
  }
}

async function getUserByLogin(login) {
  // @ts-ignore
  return await prisma.User.findUnique({
    where: { login },
  })
}

export async function authenticateUser(login, password) {
  try {
    const user = await getUserByLogin(login)
    if (!user) {
      const msg = 'Неправильный логин или пароль'
      throw { message: msg, status: 404 }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      const msg = 'Неправильный пароль'
      throw { message: msg, status: 404 }
    }

    const token = generateAccessToken(login)

    console.info(`Успешная аутентификация пользователя с логином: ${login}`)

    return token
  } catch (error) {
    const status = error.status || 500
    const errorMsg = error.message || 'Внутренняя ошибка сервера: ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}
