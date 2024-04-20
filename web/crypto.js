let validationStore = {};

module.exports.GetDataForAuth = function(login, publicKey) {
    const random_data = login + publicKey;
    validationStore[login] = random_data;
    return random_data;
}

module.exports.ValidateDataForAuth = function(login, publicKey, cryptedData) {
    const start_data = validationStore[login];
    const end_data = cryptedData;
    return start_data === end_data;
}