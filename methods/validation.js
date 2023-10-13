function validatePhoneNumber(input_str) {
    const re = /^\+?[1-9]\d{10}$/;
    return re.test(input_str);
}

module.exports = {validatePhoneNumber};