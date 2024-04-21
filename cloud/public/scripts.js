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

async function uploadFormData() {
    var formData = new FormData();

    var usernameInput = document.getElementById('username');
    var passwordInput = document.getElementById('password');
    var fileInput = document.getElementById('file');

    const publicKeyResponse = await fetch(`/getPublicKey`, {
        method: 'GET'
    });
    const publicKeyJson = await publicKeyResponse.json();
    // console.log(publicKeyJson);
    const publicKey = publicKeyJson['publicKey'];
    // console.log(publicKey, password);
    const encryptedPassword = await encryptData(password, publicKey);
    const encryptedPasswordBase64 = bufferToBase64(encryptedPassword);

    formData.append('username', usernameInput.value);
    formData.append('password', passwordInput.value);
    formData.append('file', fileInput.files[0], );

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

    xhr.send(formData);
}

document.querySelector('input[type="submit"]').addEventListener('click', function(event) {
    event.preventDefault();

    uploadFormData();
});
