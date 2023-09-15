const researches = [
    {id: 10, name: "Направление \"Обогащение\"", advisor: "Александрова Татьяна Николаевна", degree: "докт. техн. наук"},
    {id: 9, name: "Направление \"Алюминий\"", advisor: "Горланов Евгений Сергеевич", degree: "докт. техн. наук"},
    {id: 8, name: "Направление \"Сплавы\"", advisor: "Бажин Владимир Юрьевич", degree: "докт. техн. наук"},
    {id: 7, name: "Направление \"Редкие металлы\"", advisor: "Черемисина Ольга Владимировна", degree: "докт. техн. наук"},
    {id: 6, name: "Направление \"Железо\"", advisor: "Лебедев Андрей Борисович", degree: "канд. техн. наук"},
    {id: 5, name: "Направление \"Кремнегель\"", advisor: "Пягай Игорь Николаевич", degree: "докт. техн. наук"},
    {id: 4, name: "Направление \"Катализаторы\"", advisor: "Спецов Евгений Александрович", degree: "канд. техн. наук"},
    {id: 3, name: "Направление \"Углерод\"", advisor: "Рудко Вячеслав Алексеевич", degree: "канд. техн. наук"},
    {id: 2, name: "Направление \"Удобрения\"", advisor: "Карапетян Кирилл Гарегинович", degree: "докт. техн. наук"},
    {id: 1, name: "Направление \"Сапонит\"", advisor: "Зубкова Ольга Сергеевна", degree: "канд. техн. наук"},
    {id: 0, name: "Направление \"Кинетика процессов\"", advisor: "Шариков Феликс Юрьевич", degree: "докт. техн. наук"},
];

const smiles = {
    researches: "⭐ ",
}

const keyboards = {
    researches: researches.map(el => [smiles.researches + el.name]),
};

const researchTopics = researches.map(el => el.name);

const commands = [
    {
        command: "start",
        description: "Запуск бота"
    },
    {
        command: "researches",
        description: "Научные направления"
    },
];

const stickers = {
    hello: 'CAACAgIAAxkBAAEKTKtlA3vTRlxYTs35OSSO7Q3KDGFaogACIAADwZxgDGWWbaHi0krRMAQ',
    unknown: 'CAACAgIAAxkBAAEKTKllA3t2S-fQqmxvXRtqMQGH7WUB0AACJAADwZxgDEgkWrolDSiOMAQ',
    disagree: 'CAACAgIAAxkBAAEKTK1lA3wQ9mmPrPuKzR3IpJYl3zTA1AACLQADwZxgDOM08idy_5BlMAQ',
    agree: 'CAACAgIAAxkBAAEKTK9lA3xE6klY8CnTJ9rk7ve_c4HdJgACKQADwZxgDPBLqR6_2N98MAQ',
    ok: 'CAACAgIAAxkBAAEKTlNlBLDJzNKqxAvp52WGuh4FS4TLeAACLAADwZxgDLDdeXbj2CCVMAQ'
}

module.exports = {keyboards, commands, stickers, researches, researchTopics, smiles};