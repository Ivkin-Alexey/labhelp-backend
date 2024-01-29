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

