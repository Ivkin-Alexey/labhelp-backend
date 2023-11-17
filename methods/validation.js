const {smiles, researchTopics} = require("../assets/constants/constants");

function validatePhoneNumber(input_str) {
    const re = /^\+?[1-9]\d{10}$/;
    return re.test(input_str);
}

function checkTextIsResearch(text) {
    let research = null;
    researchTopics.forEach(el => {
        if(text.includes(el)) research = el;
    })
    return research;
}

module.exports = {validatePhoneNumber, checkTextIsResearch};