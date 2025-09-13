import { prisma } from '../../../index.js'

export async function getSearchHistory(login) {
  try {
    // @ts-ignore
    let data = await prisma.EquipmentSearchHistory.findMany({
      where: {
        login,
      },
      select: {term: true}
    })
    
    return data.map(el => el.term)
  } catch (error) {
    const status = 500
    const errorMsg =
      error.message || 'Внутренняя ошибка сервера (при поиске оборудования): ' + error
    throw { message: errorMsg, status }
  } finally {
    await prisma.$disconnect()
  }
}

export async function addTermToSearchHistory(login, term) {
  try {
    // @ts-ignore
    const existingTerm = await prisma.EquipmentSearchHistory.findFirst({
      where: {
        user: {
          login,
        },
        term,
      },
    })

    if (existingTerm) {
      const message = `Термин "${term}" уже существует в истории поиска.`
      console.info(message)
      return {message}
    }

    // @ts-ignore
    await prisma.EquipmentSearchHistory.create({
      data: {
        user: {
          connect: { login },
        },
        term,
      },
    })

    const message = `Термин "${term}" добавлен в историю поиска.`
    console.info(message)
    return {message}
  } catch (error) {
    const errorMsg = `Ошибка при добавлении термина в историю поиска. Подробности: ${error.message}`
    throw { message: errorMsg, status: 500 }
  } finally {
    await prisma.$disconnect()
  }
}

export async function deleteTermFromSearchHistory(login, term) {
  try {
    // @ts-ignore
    await prisma.EquipmentSearchHistory.delete({
      where: {
        login_term: {
          login,
          term,
        },
      },
    })
    const message = `Термин удален из истории поиска.`
    console.info(message)
    return { message }
  } catch (error) {
    const errorMsg = `Ошибка при удалении термина из истории поиска. Подробности: ` + error
    throw { message: errorMsg, status: 500 }
  } finally {
    await prisma.$disconnect()
  }
}
