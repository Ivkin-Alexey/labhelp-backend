const {createDate, createTime} = require("../../methods/helpers");
const {createFullName} = require("../../methods/helpers");

const amountOfEquipment = 600;

function EquipmentItem() {
    this.id = "";
    this.category = "";
    this.name = "";
    this.brand = "";
    this.model = "";
    this.imgUrl = "";
    this.filesUrl = "";
    this.isUsing = [];
}

function WorkingEquipmentItem(equipmentID, chatID, longUse = false) {
    this.equipmentID = equipmentID;
    this.userChatID = [chatID];
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

module.exports = {
    EquipmentItem,
    StartData,
    EndData,
    WorkingEquipmentItem,
    amountOfEquipment,
}

