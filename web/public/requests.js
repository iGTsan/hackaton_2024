async function generateHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

document.getElementById('addForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const login = document.getElementById('loginInput').value;
    const publicKey = document.getElementById('publicKeyHashInput').value;

    // Генерация хеша от публичного ключа
    const publicKeyHash = await generateHash(publicKey);

    fetch('/addRecord', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, publicKeyHash })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('responseArea').innerText = 'Ответ сервера: ' + JSON.stringify(data);
        document.getElementById('loginInput').value = ''; // Очищаем поля после отправки
        document.getElementById('publicKeyHashInput').value = ''; 
    })
    .catch(error => console.error('Ошибка:', error));
});

document.getElementById('checkForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const login = document.getElementById('loginCheckInput').value;
    const publicKey = document.getElementById('publicKeyHashCheckInput').value;
    const publicKeyHash = await generateHash(publicKey);
    fetch(`/checkRecord?login=${login}&publicKeyHash=${publicKeyHash}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('responseArea').innerText = 'Ответ сервера: ' + JSON.stringify(data);
    })
    .catch(error => console.error('Ошибка:', error));
});