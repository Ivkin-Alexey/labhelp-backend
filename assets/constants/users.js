import {defaultResearchSelectOption} from "./researches.js";
import {createFullName} from "../../methods/helpers.js";

const personRoles = {admin: "admin", superAdmin: "superAdmin", user: "user"};
const personCategories = {student: "student", employee: "employee"};

const newPerson = {
    chatID: "",
    firstName: "",
    lastName: "",
    patronymic: "",
    phone: "",
    category: "",
    position: "",
    studentsEducationYear: "",
    postGraduateEducationYear: "",
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
    studentsEducationYear: "unRequired",
    postGraduateEducationYear: "unRequired",
    research: "required",
    role: "required",
    isUserConfirmed: "required",
    otherInfo: "unRequired",
    requirements: "unRequired"
};

function ConfirmedUserData(accountData) {
    this.chatID = accountData.chatID;
    this.position = accountData.position;
    this.fullName = createFullName(accountData);
    this.position = accountData.position;
    this.registrationDate = accountData.otherInfo.registrationDate;
    this.research = accountData.research;
    this.course = accountData.postGraduateEducationYear + accountData.studentsEducationYear;
}

export {newPerson, newPersonCheckingRules, ConfirmedUserData, personRoles, personCategories}