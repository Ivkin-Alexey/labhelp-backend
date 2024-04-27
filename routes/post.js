import {
    updateUserDataPost,
    deletePersonPost,
    equipmentStartPost,
    equipmentEndPost,
    updateReagentApplicationPost, deleteReagentApplicationPost, addNewReagentAppToDBPost
} from "../methods/appPostsProcessing.js";

export default function post(app) {
    app.post("/updatePersonData", async (req, res) => await updateUserDataPost(req, res, bot));
    app.post("/deletePerson", async (req, res) => await deletePersonPost(req, res, bot));
    app.post("/equipmentStart", async (req, res) => await equipmentStartPost(req, res, bot))
    app.post("/equipmentEnd", async (req, res) => await equipmentEndPost(req, res, bot));
    app.post("/deleteReagentApplication", async (req, res) => await deleteReagentApplicationPost(req, res, bot));
    app.post("/updateReagentApplications", async (req, res) => await updateReagentApplicationPost(req, res, bot));
    app.post("/addNewReagentAppToDB", async (req, res) => await addNewReagentAppToDBPost(req, res, bot));
}