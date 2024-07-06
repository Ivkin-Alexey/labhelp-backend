import {getEquipmentList} from "../methods/equipments.js";
import {getUserData, getUserList} from "../methods/users.js";
import{researchesSelectOptions} from "../assets/constants/researches.js";
import {getReagentApplications, addNewReagentAppToDB} from "../methods/reagents.js";
import {getWorkingEquipmentListFromDB} from "../methods/db/equipment.js";

export default function get(app) {
    app.get('/hello', async (req, res) => {
        return res.status(200).json('Привет');
    });

    app.get('/equipmentList', async (req, res) => {
        try {
            const category = req.query.category
            return await getEquipmentList(category).then(equipmentList => res.status(200).json(equipmentList))
        } catch (e) {
            return res.status(500).json(e);
        }
    });
    
    app.get('/workingEquipmentList', async (req, res) => {
        try {
            return await getWorkingEquipmentListFromDB().then(list => res.status(200).json(list))
        } catch (e) {
            return res.status(500).json(e);
        }
    });

    app.get('/person/:chatID', async (req, res) => {
        try {
            const chatID = req.params.chatID;
            return await getUserData(chatID).then(person => res.status(200).json(person));
        } catch (e) {
            return res.status(500).json(e);
        }
    });
    
    app.get('/persons/:chatID', async (req, res) => {
        try {
            return await getUserList().then(personList => res.status(200).json(personList));
        } catch (e) {
            return res.status(500).json(e);
        }
    });
    
    app.get('/workingEquipmentList', async (req, res) => {
        try {
            return await getWorkingEquipmentListFromDB().then(list => res.status(200).json(list));
        } catch (e) {
            return res.status(500).json(e);
        }
    });
    
    app.get('/researches', async (req, res) => {
        try {
            return res.status(200).json(researchesSelectOptions);
        } catch (e) {
            return res.status(500).json(e);
        }
    });
    
    app.get('/reagentApplications', async (req, res) => {
        try {
            return await getReagentApplications().then(list => res.status(200).json(list));
        } catch (e) {
            return res.status(500).json(e);
        }
    });
}