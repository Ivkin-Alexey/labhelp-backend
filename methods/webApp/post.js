const {app} = require("../../server");
const {bot} = require("../../index");
const {updateUserDataPost, deletePersonPost, equipmentStartPost, equipmentEndPost} = require("../appPostsProcessing");

app.post("/updatePersonData", async (req, res) => await updateUserDataPost(req, res, bot));
app.post("/deletePerson", async (req, res) => await deletePersonPost(req, res, bot));
app.post("/equipmentStart", async (req, res) => await equipmentStartPost(req, res, bot))
app.post("/equipmentEnd", async (req, res) => await equipmentEndPost(req, res, bot));