const crypto = require('node:crypto').webcrypto;

let validationStore = {};

module.exports.GetDataForAuth = function (login, publicKey) {
    const buffer = new ArrayBuffer(196);
    const random_data = new Int8Array(buffer)
    crypto.getRandomValues(random_data);
    validationStore[login] = random_data;
    return random_data;
}

function importPrivateKey(jwk) {
    return crypto.subtle.importKey(
        "jwk",
        JSON.parse(jwk),
        {
            name: "RSA-PSS",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        (JSON.parse(jwk)).ext,
        (JSON.parse(jwk)).key_ops,
    );
}

module.exports.ValidateDataForAuth = async function(login, publicKey, cryptedData) {
    const start_data = validationStore[login];
    let x = JSON.parse("["+(await cryptedData)+"]");
    let arr =  new ArrayBuffer(x.length);
    const data1 = new Int8Array(arr);
    for (let i = 0; i<x.length;i++){
        data1[i] = Object.values(x)[i];
    }
    console.log(x);
    let result = await crypto.subtle.verify(
        {
            name: "RSA-PSS",
            saltLength: 32,
        },
        await importPrivateKey(publicKey),
        data1,
        start_data,
    );
    return result;
}

