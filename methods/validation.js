const {researchTopics} = require("../assets/constants/researches");

function checkTextIsResearch(text) {
    let research = null;
    researchTopics.forEach(el => {
        if(text.includes(el)) research = el;
    })
    return research;
}

module.exports = {checkTextIsResearch};