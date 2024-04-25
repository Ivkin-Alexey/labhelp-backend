import {createDate, createReagentID, createFullName, createNameWithInitials} from "../../methods/helpers.js";

const reagentStatuses = {inProcess: "inProcess", completed: "completed", rejected: "rejected"};

// interface INewReagentApplication {
//     id: string;
//     chatID: number;
//     reagentName: string;
//     amount: string;
//     date: string;
//     status: reagentStatus;
// }

function NewReagentApplication(userData) {
    this.id = createReagentID();
    this.chatID = userData.chatID;
    this.fullName = createNameWithInitials(userData);
    this.reagentName = "";
    this.reagentAmount = "";
    this.date = createDate();
    this.status = reagentStatuses.inProcess;
}

module.exports = {NewReagentApplication}

