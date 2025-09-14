import { prisma } from '../../../index.js'
import { sendNotification } from '../../controllers/tg-bot-controllers/botAnswers.js'
import { transformFavoriteEquipmentList } from '../helpers.js'

export async function getFavoriteEquipmentsFromDB(login) {
  try {
    if (!login)
      throw { message: 'Отсутствует логин при запросе избранного оборудования', status: 500 }
    console.info(`GET-запрос избранного оборудования. Логин ${login}.`)

    // @ts-ignore
    const rawData = await prisma.FavoriteEquipment.findMany({
      where: { login },
      include: {
        equipment: {
          include: {
            operatingEquipment: true,
          },
        },
      },
    })

    const formattedData = rawData.map(transformFavoriteEquipmentList)
    return formattedData
  } catch (error) {
    const errorMsg =
      error.message ||
      `Ошибка при отправке избранного оборудования. Логин ${login}. Подробности: ` + error
    const errorStatus = error.status || 500
    await prisma.$disconnect()
    throw { message: errorMsg, status: errorStatus }
  }
}

export async function removeFavoriteEquipmentFromDB(login, equipmentId) {
  try {
    console.info(
      `DELETE-запрос на удаление оборудования из избранного. Логин ${login}, Id оборудования ${equipmentId}.`,
    )
    // @ts-ignore
    await prisma.FavoriteEquipment.delete({
      where: {
        login_equipmentId: {
          login: login,
          equipmentId: equipmentId,
        },
      },
    })
    const infoMessage = `Оборудование удалено из избранного. Логин ${login}, Id оборудования ${equipmentId}.`
    console.info(infoMessage)
    return infoMessage
  } catch (error) {
    const errorMsg =
      `Ошибка при удалении оборудования из избранного. Логин ${login}, Id оборудования ${equipmentId}. Подробности: ` +
      error
    console.error(errorMsg)
    sendNotification(`❌ ${errorMsg}`)
    await prisma.$disconnect()
    throw { message: errorMsg, status: 500 }
  }
}

export async function addFavoriteEquipmentToDB(login, equipmentId) {
  try {
    console.info(
      `POST-запрос на добавление оборудования в избранное. Логин ${login}, Id оборудования ${equipmentId}.`,
    )
    // @ts-ignore
    await prisma.FavoriteEquipment.create({
      data: {
        user: {
          connect: { login },
        },
        equipment: {
          connect: { id: equipmentId },
        },
      },
    })
    const infoMessage = `Оборудование добавлено в избранное. Логин ${login}, Id оборудования ${equipmentId}.`
    console.info(infoMessage)
    return infoMessage
  } catch (error) {
    let errorMsg
    if (error.code === 'P2025') {
      errorMsg = "Такой пользователь не найден"
    } else {
      errorMsg =
      `Ошибка при добавлении оборудования в избранное. Логин ${login}, Id оборудования ${equipmentId}. Подробности: ` +
      error
    }
    console.error(errorMsg)
    sendNotification(`❌ ${errorMsg}`)
    await prisma.$disconnect()
    throw { message: errorMsg, status: 500 }
  }
}
