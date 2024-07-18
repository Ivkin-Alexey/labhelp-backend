import {timeZoneRelativeToUTC} from "../assets/constants/constants.js";

function createDate() {
    const date = new Date();
    let day, month, year;
    day = date.getUTCDate();
    if(+day<10) day= "0" + day;
    month = +date.getUTCMonth()+1;
    if(+month<10) month= "0" + month;
    year = date.getFullYear();
    return day + "." + month + "." + year;
}

function createTime() {
    const date = new Date();
    let hours, minutes;
    hours = date.getUTCHours() + timeZoneRelativeToUTC;
    if(hours >= 24) hours = hours - 24;
    if(+hours<10) hours= "0" + hours;
    minutes = date.getUTCMinutes();
    if(+minutes<10) minutes = "0" + minutes;
    return hours + ":" + minutes;
}

function createFullName(userData) {
    const {firstName, lastName, patronymic} = userData;
    return lastName + " " + firstName + " " + patronymic;
}

function createNameWithInitials(userData) {
    const {firstName, lastName, patronymic} = userData;
    return lastName + " " + firstName[0] + "." + patronymic[0] + ".";
}

function createReagentID() {
    return new Date().getTime();
}

function checkEquipmentID(id) {
    const arr = ["нд", "нет", ""];
    return !arr.includes(id);
}

export {createDate, createTime, createFullName, createReagentID, createNameWithInitials, checkEquipmentID}