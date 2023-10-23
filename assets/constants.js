const webAppUrl = 'https://ephemeral-kringle-2c94b2.netlify.app/';

const adminsChatID = {
    adminsChatID: [392584400, 857875270, 1516784245],
    CEOChatID: 392584400,
}

const newPerson = {
    chatID: "",
    firstName: "",
    lastName: "",
    patronymic: "",
    phone: "",
    position: "",
    postGraduateEducationYear: "",
    studentsEducationYear: "",
    research: "",
    type: "user",
    otherInfo: {registrationDate: "", isUserConfirmed: false, isUserDataSent: false}
};

const newPersonCheckingRules = {
    chatID: "required",
    firstName: "required",
    lastName: "required",
    patronymic: "unRequired",
    phone: "required",
    position: "required",
    postGraduateEducationYear: ["studentsEducationYear", "postGraduateEducationYear"],
    studentsEducationYear: ["studentsEducationYear", "postGraduateEducationYear"],
    research: "required",
    type: "required",
    otherInfo: "unRequired"
};

const researches = [
    {id: 10, name: "Обогащение", advisor: "Александрова Татьяна Николаевна", degree: "докт. техн. наук"},
    {id: 9, name: "Алюминий", advisor: "Горланов Евгений Сергеевич", degree: "докт. техн. наук"},
    {id: 8, name: "Сплавы", advisor: "Бажин Владимир Юрьевич", degree: "докт. техн. наук"},
    {id: 7, name: "Редкие металлы", advisor: "Черемисина Ольга Владимировна", degree: "докт. техн. наук"},
    {id: 6, name: "Железо", advisor: "Лебедев Андрей Борисович", degree: "канд. техн. наук"},
    {id: 5, name: "Кремнегель", advisor: "Пягай Игорь Николаевич", degree: "докт. техн. наук"},
    {id: 4, name: "Катализаторы", advisor: "Спецов Евгений Александрович", degree: "канд. техн. наук"},
    {id: 3, name: "Углерод", advisor: "Рудко Вячеслав Алексеевич", degree: "канд. техн. наук"},
    {id: 2, name: "Удобрения", advisor: "Карапетян Кирилл Гарегинович", degree: "докт. техн. наук"},
    {id: 1, name: "Сапонит", advisor: "Зубкова Ольга Сергеевна", degree: "канд. техн. наук"},
    {id: 0, name: "Кинетика процессов", advisor: "Шариков Феликс Юрьевич", degree: "докт. техн. наук"},
];

const smiles = {
    researches: "👨‍ ‍🔬 ",
    closeMenu: "❌ "
}

const keyboards = {
    researches: researches.map(el => [smiles.researches + "Направление \"" + el.name + "\""]),
};

const researchTopics = researches.map(el => el.name);

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

module.exports = {webAppUrl, keyboards, commands, stickers, researches, researchTopics, smiles, adminsChatID, newPerson, newPersonCheckingRules};