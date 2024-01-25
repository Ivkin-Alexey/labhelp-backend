const {app} = require("./index");
const {getEquipmentList} = require("./methods/equipments");
const {getUserList} = require("./methods/users");
const {researchesSelectOptions} = require("./assets/constants/researches");
const {
    updateUserDataPost,
    deletePersonPost,
    equipmentStartPost,
    equipmentEndPost
} = require("./methods/appPostsProcessing");

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

app.post("/updatePersonData", async (req, res) => await updateUserDataPost(req, res, bot));
app.post("/deletePerson", async (req, res) => await deletePersonPost(req, res, bot));
app.post("/equipmentStart", async (req, res) => await equipmentStartPost(req, res, bot))
app.post("/equipmentEnd", async (req, res) => await equipmentEndPost(req, res, bot));