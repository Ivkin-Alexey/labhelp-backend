const {researches} = require("./researches");
const {localisations} = require("./localisations");

const PORT = 8000;
const HTTPS_PORT = 443;

const timeZoneRelativeToUTC = 3;
const webAppUrl = 'https://ephemeral-kringle-2c94b2.netlify.app';
const editProfileUrl = webAppUrl + '/:chatID/editProfile';
const smiles = {
    researches: "👨‍ ‍🔬 ",
    closeMenu: "❌ ",
    equipment: "🔬 ",
    selectedEquipment: "⭐ ",
    profile: "👤 ",
}

const defaultKeyBoard = [
    [smiles.equipment + "Оборудование"],
    [smiles.selectedEquipment + "Избранное оборудование"],
    [smiles.profile + "Мой профиль"]
];

const keyboards = {
    researches: researches.map(el => [smiles.researches + "Направление \"" + el.name + "\""]),
    default: defaultKeyBoard
};

const commands = [
    {
        command: "start",
        description: "старт"
    },
    {
        command: "researches",
        description: "научные направления"
    },
    {
        command: "get_chat_id",
        description: "узнать чат id"
    }, {
        command: "get_my_data",
        description: "мои данные"
    },
];

// start - старт
// researches - научные направления
// get_chat_id - узнать id чата
// get_my_data - мои данные

const stickers = {
    hello: 'CAACAgIAAxkBAAEKTKtlA3vTRlxYTs35OSSO7Q3KDGFaogACIAADwZxgDGWWbaHi0krRMAQ',
    unknown: 'CAACAgIAAxkBAAEKTKllA3t2S-fQqmxvXRtqMQGH7WUB0AACJAADwZxgDEgkWrolDSiOMAQ',
    disagree: 'CAACAgIAAxkBAAEKTK1lA3wQ9mmPrPuKzR3IpJYl3zTA1AACLQADwZxgDOM08idy_5BlMAQ',
    agree: 'CAACAgIAAxkBAAEKTK9lA3xE6klY8CnTJ9rk7ve_c4HdJgACKQADwZxgDPBLqR6_2N98MAQ',
    ok: 'CAACAgIAAxkBAAEKTlNlBLDJzNKqxAvp52WGuh4FS4TLeAACLAADwZxgDLDdeXbj2CCVMAQ'
}

module.exports = {
    PORT,
    HTTPS_PORT,
    webAppUrl,
    keyboards,
    commands,
    stickers,
    researches,
    smiles,
    editProfileUrl,
    timeZoneRelativeToUTC,
    localisations
};