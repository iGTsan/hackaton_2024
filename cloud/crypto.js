const crypto = require('crypto');

function generateKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
  
    // Возвращаем ключи как строки
    return { publicKey, privateKey };
  }
  
const keys = generateKeys();
const publicKeyGlobal = keys.publicKey;
const privateKeyGlobal = keys.privateKey;

module.exports.GetPublicKey = function() {
    return publicKeyGlobal;
}

module.exports.DecryptData = async function(encryptedData) {
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    try {
      // Загрузка приватного ключа из файла или переменной
      const privateKey = crypto.createPrivateKey(privateKeyGlobal);
  
      // Расшифровка данных
      const decryptedData = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        encryptedDataBuffer  // это должен быть Buffer
      );
  
      return decryptedData.toString('utf8');
    } catch (err) {
      console.error("Decryption error:", err);
      throw err;
    }
}