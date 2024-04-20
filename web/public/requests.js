document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const login = document.getElementById('registerInput').value;
    const publicKey = document.getElementById('publicKeyInput').value;

    fetch('/addRecord', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, publicKey })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('responseArea').innerText = 'Ответ сервера: ' + JSON.stringify(data);
        document.getElementById('registerInput').value = ''; // Очищаем поля после отправки
        document.getElementById('publicKeyInput').value = ''; 
    })
    .catch(error => console.error('Ошибка:', error));
});

function cryptData(data, privateKey) {
    return data;
}

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const login = document.getElementById('loginInput').value;
    const privateKey = document.getElementById('privateKeyInput').value;
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
});

function genKeyPair() {
    const keyPair = "Pubclic" + '\n' + "Private";
    return keyPair;
}

function createAndDownloadFile() {
  const fileName = document.getElementById('fileName').value;
  const content = genKeyPair();
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