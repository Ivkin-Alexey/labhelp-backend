import {createDate, createTime,createFullName} from "../../methods/helpers.js";

const amountOfEquipment = 600;

function EquipmentItem() {
    this.id = "";
    this.category = "";
    this.name = "";
    this.brand = "";
    this.model = "";
    this.imgUrl = "";
    this.filesUrl = "";
}

function WorkingEquipmentItem(chatID, longUse = false) {
    this.id = "";
    this.category = "";
    this.name = "";
    this.brand = "";
    this.model = "";
    this.imgUrl = "";
    this.filesUrl = "";
    this.chatID = chatID;
    this.longUse = longUse;
}

function StartData(chatID, accountData, equipment) {
    this.equipmentID = equipment.id;
    this.date = createDate();
    this.startTime = createTime();
    this.fullName = createFullName(accountData);
    this.chatID = chatID;
    this.position = accountData.position;
    this.name = equipment.name + " " + equipment.model;
}

function EndData() {
    this.endTime = createTime();
}

export {
    EquipmentItem,
    StartData,
    EndData,
    WorkingEquipmentItem,
    amountOfEquipment,
}

