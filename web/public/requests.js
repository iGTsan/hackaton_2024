function convertPemToBinary(pem) {
    let b64Lines = pem.replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '').replace(/\r?\n|\r/g, '');
    let binaryDerString = atob(b64Lines);
    let binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return binaryDer;
  }

async function encryptData(data, publicKey) {
    const binaryKey = await window.crypto.subtle.importKey(
        'spki', 
        convertPemToBinary(publicKey),
        {
            name: 'RSA-OAEP',
            hash: {name: 'SHA-256'}
        },
        true,
        ['encrypt']
    );
    let enc = new TextEncoder();
    let encodedMessage = enc.encode(data);
    return await window.crypto.subtle.encrypt(
        {
            name: 'RSA-OAEP'
        },
        binaryKey,
        encodedMessage
    );
}

function bufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

try {
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const login = document.getElementById('registerInputLogin').value;
    const password = document.getElementById('registerInputPassword').value;
    const file = document.getElementById('registerFileInput').files[0];

    if (!file) {
        alert("Пожалуйста, выберите файл.");
        return;
    }

    const publicKeyResponse = await fetch(`/getPublicKey`, {
        method: 'GET'
    });
    const publicKeyJson = await publicKeyResponse.json();
    // console.log(publicKeyJson);
    const publicKey = publicKeyJson['publicKey'];
    // console.log(publicKey, password);
    const encryptedPassword = await encryptData(password, publicKey);
    const encryptedPasswordBase64 = bufferToBase64(encryptedPassword);
    // console.log(encryptedPassword);

    const reader = new FileReader();

    reader.onload = async function(e) {
        const allText = e.target.result; // Считываем содержимое файла
        const jsonObjects = allText.split('\n'); // Разделяем содержимое файла по переносам строк
        if (jsonObjects.length < 2) {
            alert("Файл должен содержать как минимум два JSON объекта.");
            return;
        }
        const publicKey = jsonObjects[1];

        try {
            console.log(encryptedPassword);
            const response = await fetch('/addRecord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login, encryptedPasswordBase64, publicKey})
            });

            const data = await response.json();
            document.getElementById('responseArea').innerText = 'Ответ сервера: ' + JSON.stringify(data);
            document.getElementById('registerInput').value = ''; // Очищаем поля после отправки
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    reader.readAsText(file); // Начинаем чтение файла
});
} catch (error) {
    console.error('Error:', error);
}

const {subtle} = globalThis.crypto;
function importPrivateKey(jwk) {
    return subtle.importKey(
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

async function cryptData(data, privateKey) {
    let key = await importPrivateKey(privateKey);
    let arr =  new ArrayBuffer(196);
    const data1 = new Int8Array(arr);
    for (let i = 0; i<196;i++){
        data1[i] = Object.values(data)[i];
    }
    console.log(arr);
    let signature = await globalThis.crypto.subtle.sign(
        {
            name: "RSA-PSS",
            saltLength: 32,
        },
        key,
        arr,
    );
    console.log("here->");
    return new Int8Array(signature);
}

try {
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const login = document.getElementById('loginInput').value;
    const file = document.getElementById('loginFileInput').files[0];

    if (!file) {
        alert("Пожалуйста, выберите файл.");
        return;
    }
    console.log(login);

    const reader = new FileReader();

    reader.onload = async function(e) {
        const allText = e.target.result; // Считываем содержимое файла
        const jsonObjects = allText.split('\n'); // Разделяем содержимое файла по переносам строк
        if (jsonObjects.length < 2) {
            alert("Файл должен содержать как минимум два JSON объекта.");
            return;
        }
        const privateKey = jsonObjects[0];
        fetch(`/loginStart?login=${login}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(async data => {
            randomData = data["data"];
            console.log(randomData);
            const cryptedData = await cryptData(randomData, privateKey);
            console.log(cryptedData);
            fetch(`/loginEnd?login=${login}&cryptedData=${cryptedData}`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('responseArea').innerText = 'Ответ сервера: ' + JSON.stringify(data);
            })
        })
        .catch(error => console.error('Ошибка:', error));
    };

    reader.readAsText(file); // Начинаем чтение файла
});
} catch (error) {
    console.error('Error:', error);
}

function genKeyPair() {
    async function f() {
        keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-PSS",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["sign", "verify"],
        );
        // console.log("keyPair", keyPair);
        const exported_private = await window.crypto.subtle.exportKey("jwk", keyPair['privateKey']);
        const exported_public = await window.crypto.subtle.exportKey("jwk", keyPair['publicKey']);
        return JSON.stringify(exported_private)+"\n"+JSON.stringify(exported_public)
    }
    return f()
}

async function createAndDownloadFile() {
  const fileName = document.getElementById('fileName').value;
  const content = await genKeyPair();
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

  if (window.navigator.msSaveOrOpenBlob) {
    // For IE10+
    window.navigator.msSaveOrOpenBlob(blob, fileName);
  } else {
    // For other browsers:
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
    }, 0); 
  }
}