import { prisma } from '../../../index.js'

export async function getWorkingEquipmentListFromDB(login) {
  try {
    if (!login) throw { message: 'Отсутствует логин', status: 400 }

    const rawData = await prisma.operatingEquipment.findMany({
      where: { login },
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
    const formattedData = rawData.map(el => {
      const result = {
        ...el,
        ...el.equipment,
      }
      delete result.operatingEquipment
      return result
    })
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

export async function startWorkWithEquipment(login, equipmentId, isLongUse = false) {
  try {
    await prisma.operatingEquipment.create({
      data: {
        equipmentId,
        login,
        isLongUse,
      },
    })
    return {message: `Начата работа на оборудовании с ID ${equipmentId}`, status: 200}
  } catch (error) {
    const errorMsg =
      error.message ||
      `Ошибка при изменении статуса (в работе или нет) оборудования. Логин ${login}, equipmentId ${equipmentId}. Подробности: ` +
        error
    const errorStatus = error.status || 500
    await prisma.$disconnect()
    throw { message: errorMsg, status: errorStatus }
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
    return {message: `Завершена работа на оборудовании с ID ${equipmentId}`, status: 200}
  } catch (error) {
    const errorMsg =
      error.message ||
      `Ошибка при изменении статуса (в работе или нет) оборудования. Логин ${login}, equipmentId ${equipmentId}. Подробности: ` +
        error
    const errorStatus = error.status || 500
    await prisma.$disconnect()
    throw { message: errorMsg, status: errorStatus }
  }
}
