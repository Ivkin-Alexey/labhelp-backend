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

function StartData(chatID, accountData, equipment) {
    this.equipmentID = equipment.id;
    this.date = createDate();
    this.startTime = createTime();
    this.fullName = createFullName(accountData);
    this.chatID = chatID;
    this.position = accountData.position;
    this.name = equipment.name + " " + equipment.model;
}

module.exports = {
    EquipmentItem,
    StartData,
    amountOfEquipment
}

