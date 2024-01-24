const {app} = require("../../server");
const {getEquipmentList} = require("../equipments");
const {getUserList} = require("../users");
const {researchesSelectOptions} = require("../../assets/constants/researches");

app.get('/hello', async (req, res) => {
    return res.status(200).json('Привет');
});

app.get('/equipmentList', async (req, res) => {
    try {
        return await getEquipmentList().then(equipmentList => res.status(200).json(equipmentList))
    } catch (e) {
        return res.status(500).json(e);
    }
});

app.get('/persons', async (req, res) => {
    try {
        return await getUserList().then(personList => res.status(200).json(personList))
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