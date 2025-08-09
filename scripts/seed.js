import { createEquipmentDbFromGSheet } from '../src/data-access/data-access-equipments/equipments.js'

createEquipmentDbFromGSheet(false).catch(console.error);
