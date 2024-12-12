import * as dotenv from 'dotenv'
dotenv.config()
import { GoogleSpreadsheet } from 'google-spreadsheet'
import JWT from 'google-auth-library'

const equipmentOperationsTableID = '1UZ21neg8OevoKReVYHIAkUmw9v388zF8AwpykXs-EsE'
const equipmentOperationsSheetIndex = '0'
const confirmedUsersTableID = '19R0KhK7RvVPKvtmVA7-EGPjakJxfWRflRLHp4Z4FFrs'
const equipmentListTableID = '1hhApEbP2pB52e-1wstgj7LX4QhRcuzGGLSQTPHLuYdc'
const equipmentListSheetID = '490152393'

const serviceAccountAuth = new JWT.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const equipmentOperations = new GoogleSpreadsheet(equipmentOperationsTableID, serviceAccountAuth)
const equipmentList = new GoogleSpreadsheet(equipmentListTableID, serviceAccountAuth)
const confirmedUsers = new GoogleSpreadsheet(confirmedUsersTableID, serviceAccountAuth)

export {
  equipmentOperationsTableID,
  equipmentListTableID,
  equipmentListSheetID,
  equipmentOperations,
  equipmentList,
  confirmedUsers,
  equipmentOperationsSheetIndex,
}
