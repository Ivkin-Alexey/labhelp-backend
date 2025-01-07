import { equipmentFilterNames } from '../assets/constants/equipments.js'

export function getFiltersFromQuery(object) {
  let filters = null
  for (let key in object) {
    if (equipmentFilterNames.includes(key)) {
      if (!filters) {
        filters = {}
      }
      filters[key] = JSON.parse(object[key])
    }
  }
  return filters
}
