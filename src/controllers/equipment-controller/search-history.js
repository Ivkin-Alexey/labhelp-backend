import {
  addTermToSearchHistory,
  deleteTermFromSearchHistory,
  getSearchHistory,
} from '../../data-access/data-access-equipments/search-history.js'
import { processEndpointError } from '../../utils/errorProcessing.js'

export async function processSearchHistoryRequest(req, res) {
  try {
    const { login } = req.params
    const { term } = req.query
    if (!login) {
      throw { message: 'Отсутствует логин', status: 400 }
    }
    const method = req.method
    let response
    if (method === 'GET') {
      response = await getSearchHistory(login)
    } else if (method === 'DELETE') {
      if (!term) {
        throw { message: 'Отсутствует термин', status: 400 }
      }
      response = await deleteTermFromSearchHistory(login, term)
    } else if (method === 'POST') {
      if (!term) {
        throw { message: 'Отсутствует термин', status: 400 }
      }
      response = await addTermToSearchHistory(login, term)
    } else {
      throw { message: 'Метод не разрешен', status: 405 }
    }
    return res.status(200).json(response)
  } catch (e) {
    processEndpointError(res, e)
  }
}
