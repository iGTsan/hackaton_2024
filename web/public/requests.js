document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const login = document.getElementById('registerInput').value;
    const file = document.getElementById('registerFileInput').files[0];

    if (!file) {
        alert("Пожалуйста, выберите файл.");
        return;
    }

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
            const response = await fetch('/addRecord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login, publicKey: publicKey})
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

function cryptData(data, privateKey) {
    return data;
}

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const login = document.getElementById('loginInput').value;
    const file = document.getElementById('registerFileInput').files[0];

    if (!file) {
        alert("Пожалуйста, выберите файл.");
        return;
    }

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
        .then(data => {
            randomData = data["data"];
            console.log(randomData);
            const cryptedData = cryptData(randomData, privateKey);
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

function genKeyPair() {
    async function f() {
        keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
        );
        console.log("keyPair", keyPair);
        const exported_private = await window.crypto.subtle.exportKey("jwk", keyPair['privateKey']);
        const exported_public = await window.crypto.subtle.exportKey("jwk", keyPair['publicKey']);
        return JSON.stringify(exported_private) + "\n" + JSON.stringify(exported_public)
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