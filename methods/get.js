import app, { get } from "../index.js";

console.log(app)

get('/hi', async (req, res) => {
    return res.status(200).json('Hi');
});