const {defaultResearchSelectOption} = require("./researches")

const superAdminsChatID = [392584400, 1516784245];

const newPerson = {
    chatID: "",
    firstName: "",
    lastName: "",
    patronymic: "",
    phone: "",
    position: "",
    student: true,
    postGraduateEducationYear: "",
    studentsEducationYear: "",
    research: defaultResearchSelectOption.value,
    role: "user",
    isUserConfirmed: false,
    otherInfo: {registrationDate: "", isUserDataSent: false},
    requirements: [
        {name: "План работ", done: false},
        {name: 'Соглашение о конфиденциальности', done: false},
        {name: 'Техника безопасности', done: false}
    ]
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
    role: "required",
    isUserConfirmed: "required",
    otherInfo: "unRequired",
    requirements: "unRequired"
};

module.exports = {newPerson, newPersonCheckingRules, superAdminsChatID}