const express = require('express');
const multer = require('multer');
const https = require('https');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const my_crypto = require('./crypto');

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: '1234'
};

const httpsServer = https.createServer(options, app);

// Подключение к БД SQLite
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Подключение к SQLite базе данных успешно установлено.');
});

// Создание таблицы если ее нет
db.run('CREATE TABLE IF NOT EXISTS users (login TEXT PRIMARY KEY, password_hash TEXT)');

// Устанавливаем директорию для загруженных файлов
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: async function (req, file, cb) {
        const password = await my_crypto.DecryptData(req.body.password);
        const auth = await checkUser(req.body.username, password);
        if (auth) {
            cb(null, req.body.username + '.txt');
        } else {
            cb(null, 'wrong_file');
        }
    }
});
const upload = multer({ storage: storage });

// Статический сервер для отдачи статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Обрабатываем GET-запрос для отдачи HTML-страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function userExists(username) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE login = ?';
        db.get(sql, [username], (err, row) => {
            if (!row) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

function addUser(username, password) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (login, password_hash) VALUES (?, ?)';
        db.run(sql, [username, password], (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

async function checkUser(username, password) {
    if (!await userExists(username)) {
        await addUser(username, password);
    }
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE login = ? AND password_hash = ?';
        db.get(sql, [username, password], (err, row) => {
            if (!row) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}


// Проверка записи в БД
app.get('/getPublicKey', (req, res) => {
    const publicKey = my_crypto.GetPublicKey();
    res.send({publicKey: publicKey});
});

// Обрабатываем POST-запрос для загрузки файла
app.post('/upload', upload.single('file'), async (req, res) => {
    const password = await my_crypto.DecryptData(req.body.password);
    console.log(password);
    const auth = await checkUser(req.body.username, password);
    if (!auth) {
        res.status(403).send('Auth failed');
        console.log(req.body.username, req.body.password);
    } else {
        res.send('File uploaded successfully');
    }
});

// Порт, на котором будет работать сервер
const PORT = 3001;


httpsServer.listen(PORT, () => {
    console.log(`Сервер запущен на https://localhost:${PORT}`);
  });
