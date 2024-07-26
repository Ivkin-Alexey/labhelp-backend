import {
  updateUserDataPost,
  deletePersonPost,
  equipmentStartPost,
  equipmentEndPost,
  updateReagentApplicationPost,
  deleteReagentApplicationPost,
  addNewReagentAppToDBPost,
  createNewPersonPost,
  loginPersonPost,
} from "../methods/appPostsProcessing.js";
import { getUserList } from "../methods/users.js";

import { bot } from "../index.js";

import { generateAccessToken, authenticateToken } from "../methods/jwt.js";
import {
  addFavoriteEquipmentToDB,
  removeFavoriteEquipmentFromDB,
} from "../methods/db/equipment.js";

export default function post(app) {
  app.post(
    "/updatePersonData",
    authenticateToken,
    async (req, res) => await updateUserDataPost(req, res, bot)
  );

  app.post(
    "/deletePerson",
    authenticateToken,
    async (req, res) => await deletePersonPost(req, res, bot)
  );

  app.post(
    "/equipmentStart",
    authenticateToken,
    async (req, res) => await equipmentStartPost(req, res, bot)
  );

  app.post(
    "/equipmentEnd",
    authenticateToken,
    async (req, res) => await equipmentEndPost(req, res, bot)
  );

  app.post(
    "/deleteReagentApplication",
    authenticateToken,
    async (req, res) => await deleteReagentApplicationPost(req, res, bot)
  );

  app.post(
    "/updateReagentApplications",
    authenticateToken,
    async (req, res) => await updateReagentApplicationPost(req, res, bot)
  );

  app.post(
    "/addNewReagentAppToDB",
    authenticateToken,
    async (req, res) => await addNewReagentAppToDBPost(req, res, bot)
  );

  app.post(
    "/createNewPerson",
    async (req, res) => await createNewPersonPost(req, res, bot)
  );

  app.post("/login", async (req, res) => await loginPersonPost(req, res, bot));

  app.post("/favoriteEquipment", async (req, res) => {
    const { add, remove } = req.query;
    const { login, equipmentID } = req.body;
    try {
      if (add) {
        return await addFavoriteEquipmentToDB(login, equipmentID)
          .then((msg) => res.status(200).json(msg))
      }
      if (remove) {
        return await removeFavoriteEquipmentFromDB(login, equipmentID).then(
          (msg) => res.status(200).json(msg)
        );
      }
    } catch (e) {
      return res.status(500).json(e);
    }
  });
}
