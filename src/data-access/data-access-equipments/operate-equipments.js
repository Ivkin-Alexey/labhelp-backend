import { prisma } from '../../../index.js'
import { transformOperateEquipmentList } from '../helpers.js'

export async function getWorkingEquipmentListFromDB(login) {
  try {
    if (!login) throw { message: 'Отсутствует логин', status: 400 }

    const rawData = await prisma.operatingEquipment.findMany({
      include: {
        equipment: {
          include: {
            favoriteEquipment: {
              where: { login },
            },
          },
        },
      },
    })

    const formattedData = rawData.map(transformOperateEquipmentList)

    return formattedData
  } catch (error) {
    const errorMsg =
      error.message ||
      `Ошибка при отправке избранного оборудования. Логин ${login}. Подробности: ` + error
    const errorStatus = error.status || 500
    throw { message: errorMsg, status: errorStatus }
  } finally {
    await prisma.$disconnect()
  }
}

export async function startWorkWithEquipment(login, equipmentId, isLongUse = false) {
  try {
    await prisma.operatingEquipment.create({
      data: {
        equipmentId,
        login,
        isLongUse,
      },
    })
    return { message: `Начата работа на оборудовании с ID ${equipmentId}`, status: 200 }
  } catch (error) {
    const errorMsg =
      error.message ||
      `Ошибка при изменении статуса (в работе или нет) оборудования. Логин ${login}, equipmentId ${equipmentId}. Подробности: ` +
        error
    const errorStatus = error.status || 500
    throw { message: errorMsg, status: errorStatus }
  } finally {
    await prisma.$disconnect()
  }
}

export async function endWorkWithEquipment(login, equipmentId) {
  try {
    await prisma.operatingEquipment.delete({
      where: {
        login_equipmentId: {
          login,
          equipmentId,
        },
      },
    })
    return { message: `Завершена работа на оборудовании с ID ${equipmentId}`, status: 200 }
  } catch (error) {
    const errorMsg =
      error.message ||
      `Ошибка при изменении статуса (в работе или нет) оборудования. Логин ${login}, equipmentId ${equipmentId}. Подробности: ` +
        error
    const errorStatus = error.status || 500
    throw { message: errorMsg, status: errorStatus }
  } finally {
    await prisma.$disconnect()
  }
}
