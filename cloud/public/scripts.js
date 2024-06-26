function showUploadPage() {
    document.getElementById('upload-page').style.display = 'block';
    document.getElementById('download-page').style.display = 'none';
}

function showDownloadPage() {
    document.getElementById('upload-page').style.display = 'none';
    document.getElementById('download-page').style.display = 'block';
}

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

async function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return bufferToHex(hashBuffer);
}

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function uploadFormData() {
    var formData = new FormData();

    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');
    const passwordHash = await hashData(passwordInput.value);
    var fileInput = document.getElementById('file');

    const publicKeyResponse = await fetch(`/getPublicKey`, {
        method: 'GET'
    });
    const publicKeyJson = await publicKeyResponse.json();
    // console.log(publicKeyJson);
    const publicKey = publicKeyJson['publicKey'];
    // console.log(publicKey, password);
    const encryptedPassword = await encryptData(passwordHash, publicKey);
    const encryptedPasswordBase64 = bufferToBase64(encryptedPassword);

    formData.append('username', usernameInput.value);
    formData.append('password', encryptedPasswordBase64);
    formData.append('file', fileInput.files[0], );

    console.log(formData);

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log(xhr.responseText);

                window.location.href = 'https://5.35.29.142:3000';
            } else {
                alert('Auth failed');
                console.error('Произошла ошибка:', xhr.status);
            }
        }
    };

    xhr.open('POST', '/upload', true);

    console.log(formData.get('username'));
    xhr.send(formData);
}

async function downloadFormData() {
    var formData = new FormData();

    var usernameInput = document.getElementById('username_d');
    var passwordInput = document.getElementById('password_d');

    formData.append('username', usernameInput.value);
    formData.append('password', passwordInput.value);
    console.log(usernameInput, passwordInput);
    console.log(usernameInput.value, passwordInput.value);
    console.log(formData.get('password'));
    const username = usernameInput.value;
    const password = passwordInput.value;
    console.log(JSON.stringify({username, password}));
// ZDES PROVERKA PAROLYAß
    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });

        if (!response.ok) {
            throw new Error('Произошла ошибка при скачивании файла');
        }

        const blob = await response.blob();
        const fileURL = window.URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = fileURL;
        downloadLink.setAttribute('download', `${usernameInput.value}.txt`);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);

        downloadLink.click();

        window.URL.revokeObjectURL(fileURL);
        document.body.removeChild(downloadLink);
    } catch (error) {
        console.error(error);
    }
}

document.querySelector('input[value="Загрузить"]').addEventListener('click', function(event) {
    event.preventDefault();

    uploadFormData();
});

document.querySelector('input[value="Скачать"]').addEventListener('click', function(event) {
    event.preventDefault();

    downloadFormData();
});
