import {
  updateUserDataPost,
  deletePersonPost,
  equipmentStartPost,
  equipmentEndPost,
  updateReagentApplicationPost,
  deleteReagentApplicationPost,
  addNewReagentAppToDBPost,
  createNewPersonPost,
} from "../methods/appPostsProcessing.js";
import { getUserList } from "../methods/users.js";

import {bot} from "../index.js"

import { generateAccessToken, authenticateToken } from "../methods/jwt.js";

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

  app.post("/login", async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        message: "Ошибка. Неверный логин или пароль",
      });
    }

    const users = await getUserList();

    const user = users.find(
      (user) => user.login === login && user.password === password
    );

    if (!user) {
      return res.status(400).json({
        message: "Ошибка. Неверный логин или пароль",
      });
    }

    const token = generateAccessToken(login, password);

    return res.json({
      token: token,
    });
  });
}
