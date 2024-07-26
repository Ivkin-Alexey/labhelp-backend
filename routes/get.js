import {
  getEquipmentList,
  getEquipment,
  getEquipmentListByCategory,
  getEquipmentListBySearch,
} from "../methods/equipments.js";
import { getUserData, getUserList } from "../methods/users.js";
import { researchesSelectOptions } from "../assets/constants/researches.js";
import {
  getReagentApplications,
  addNewReagentAppToDB,
} from "../methods/reagents.js";
import {
  getWorkingEquipmentListFromDB,
  getFavoriteEquipmentsFromDB,
  addFavoriteEquipmentToDB,
  removeFavoriteEquipmentFromDB,
} from "../methods/db/equipment.js";
import { generateAccessToken, authenticateToken } from "../methods/jwt.js";

export default function get(app) {

  // app.use((req, res, next) => {
  //   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  //   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  //   next();
  // });

  app.get("/hello", async (req, res) => {
    return res.status(200).json("Привет");
  });

  app.get("/jwtHello", authenticateToken, (req, res) => {
    return res.status(200).json("Привет");
  });

  app.get("/equipmentList", async (req, res) => {
    try {
      const { category, equipmentID, search } = req.query;

      if (equipmentID) {
        return await getEquipment(equipmentID)
          .then((equipmentData) => res.status(200).json(equipmentData))
          .catch((error) => res.status(404).json(error));
      }

      if (search) {
        return await getEquipmentListBySearch(search)
          .then((equipmentList) => res.status(200).json(equipmentList))
          .catch((error) => res.status(404).json(error));
      }

      if (category) {
        return await getEquipmentListByCategory(category).then(
          (equipmentList) => res.status(200).json(equipmentList)
        );
      }
    } catch (e) {
      return res.status(500).json(e);
    }
  });

  app.get("/workingEquipmentList", authenticateToken, async (req, res) => {
    try {
      return await getWorkingEquipmentListFromDB().then((list) =>
        res.status(200).json(list)
      );
    } catch (e) {
      return res.status(500).json(e);
    }
  });

  app.get("/favoriteEquipments", async (req, res) => {
    const { login } = req.query;
    console.log(login)
    try {
      return await getFavoriteEquipmentsFromDB(login).then((list) =>
        res.status(200).json(list)
      );
    } catch (e) {

      return res.status(500).json(e);
    }
  });

  app.get("/person/:chatID", authenticateToken, async (req, res) => {
    try {
      const chatID = req.params.chatID;
      return await getUserData(chatID).then((person) =>
        res.status(200).json(person)
      );
    } catch (e) {
      return res.status(500).json(e);
    }
  });

  app.get("/persons/:chatID", authenticateToken, async (req, res) => {
    try {
      return await getUserList().then((personList) =>
        res.status(200).json(personList)
      );
    } catch (e) {
      return res.status(500).json(e);
    }
  });

  app.get("/researches", authenticateToken, async (req, res) => {
    try {
      return res.status(200).json(researchesSelectOptions);
    } catch (e) {
      return res.status(500).json(e);
    }
  });

  app.get("/reagentApplications", async (req, res) => {
    try {
      return await getReagentApplications().then((list) =>
        res.status(200).json(list)
      );
    } catch (e) {
      return res.status(500).json(e);
    }
  });
}
