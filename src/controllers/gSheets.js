import { createDate } from './helpers.js'

async function addNewRowInGSheet(table, sheetIndex, data) {
  return new Promise((resolve, reject) => {
    try {
      table.loadInfo()
      let sheet = table.sheetsByIndex[sheetIndex]
      sheet.addRow(data)
      sheet.saveUpdatedCells()
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

async function updateDataInGSheetCell(table, sheetIndex, dataForSearching, columnName, value) {
  return new Promise((resolve, reject) => {
    try {
      table.loadInfo()
      let sheet = table.sheetsByIndex[sheetIndex]
      const rows = sheet.getRows()
      let ended = false

      for (let i = 2; i < rows.length; i++) {
        if (ended) break
        const cellValue = rows[i].get(columnName)
        if (cellValue === '') {
          const rowData = rows[i]._rawData.join('')
          if (rowData.includes(dataForSearching.equipmentID) && rowData.includes(createDate())) {
            ended = true
            rows[i].set(columnName, value)
            rows[i].save()
          }
        }
      }

      sheet.saveUpdatedCells()
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

export { addNewRowInGSheet, updateDataInGSheetCell }
